<?php

namespace App\Services;

use App\Models\AudioAsset;
use App\Models\ScriptVersion;
use App\Models\TuneSubscription;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BeatAudioService
{

    protected const PREVIEW_STATUSES = [
        SubscriptionStatusService::SCRIPT_READY,
        SubscriptionStatusService::PREVIEW_READY,
        SubscriptionStatusService::QA_CHANGES_REQUIRED,
    ];

    protected const FINAL_STATUSES = [
        SubscriptionStatusService::PAID,
        SubscriptionStatusService::FINAL_AUDIO_GENERATING,
        SubscriptionStatusService::QA_CHANGES_REQUIRED,
    ];

    public static function listVoices(): array
    {
        $response = BeatAiWorkerClient::get('/v1/tts/voices');
        if (isset($response[0])) {
            return $response;
        }

        return $response['voices'] ?? [];
    }

    public static function canGeneratePreview(TuneSubscription $subscription): bool
    {
        if (! in_array($subscription->status, self::PREVIEW_STATUSES, true)) {
            return false;
        }

        $limit = (int) Config::get('beat.limits.voice_previews', 5);
        return (int) $subscription->voice_preview_count < $limit;
    }

    public static function canGenerateFinal(TuneSubscription $subscription): bool
    {
        if (! SubscriptionStatusService::isPaidOrLater($subscription->status)) {
            return false;
        }

        return in_array($subscription->status, self::FINAL_STATUSES, true);
    }

    /**
     * @throws \RuntimeException
     */
    public static function generatePreview(
        TuneSubscription $subscription,
        ?string $voiceId = null,
        ?int $requestedBy = null,
        ?string $musicTrackId = 'warm_pad'
    ): AudioAsset {
        if (! self::canGeneratePreview($subscription)) {
            self::handlePreviewLimitBreached($subscription, $requestedBy);
            throw new \RuntimeException('Voice preview generation is not allowed for this subscription');
        }

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::PREVIEW_GENERATING,
            $requestedBy,
            'TTS preview generation started'
        );

        $asset = self::synthesizeAndStore(
            $subscription,
            'preview',
            '/v1/tts/preview',
            self::profileConfig('preview'),
            $voiceId,
            $musicTrackId
        );

        $subscription->voice_preview_count = (int) $subscription->voice_preview_count + 1;
        $subscription->save();

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::PREVIEW_READY,
            $requestedBy,
            'TTS preview ready'
        );

        return $asset;
    }

    /**
     * @throws \RuntimeException
     */
    public static function generateFinal(
        TuneSubscription $subscription,
        ?string $voiceId = null,
        ?int $requestedBy = null,
        ?string $musicTrackId = 'warm_pad'
    ): AudioAsset {
        if (! self::canGenerateFinal($subscription)) {
            throw new \RuntimeException('Final audio generation requires a paid subscription');
        }

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::FINAL_AUDIO_GENERATING,
            $requestedBy,
            'TTS final audio generation started'
        );

        $asset = self::synthesizeAndStore(
            $subscription,
            'final',
            '/v1/tts/final',
            self::profileConfig('vodacom_caller_tune'),
            $voiceId,
            $musicTrackId
        );

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::READY_FOR_QA,
            $requestedBy,
            'Final audio ready for QA'
        );

        return $asset;
    }

    public static function listMusicTracks(): array
    {
        $response = BeatAiWorkerClient::get('/v1/music/tracks');
        if (isset($response[0])) {
            return $response;
        }

        return $response['tracks'] ?? [
            ['id' => 'none', 'label' => 'Bila Muziki / No Music', 'mood' => 'none'],
            ['id' => 'warm_pad', 'label' => 'Warm Soft Pad', 'mood' => 'calm'],
            ['id' => 'afro_light', 'label' => 'Afro Light Groove', 'mood' => 'upbeat'],
            ['id' => 'marimba_glow', 'label' => 'Marimba Glow', 'mood' => 'friendly'],
            ['id' => 'corporate_clean', 'label' => 'Corporate Clean', 'mood' => 'professional'],
        ];
    }

    protected static function synthesizeAndStore(
        TuneSubscription $subscription,
        string $assetType,
        string $workerPath,
        array $profile,
        ?string $voiceId,
        ?string $musicTrackId = 'warm_pad'
    ): AudioAsset {
        $scriptText = self::resolveScriptText($subscription);
        if ($scriptText === '') {
            throw new \RuntimeException('Subscription has no script text for TTS');
        }

        $voiceId = $voiceId ?: self::defaultVoiceForSubscription($subscription);
        $hints = self::resolvePronunciationHints($subscription);

        $response = BeatAiWorkerClient::post($workerPath, [
            'subscription_id' => $subscription->id,
            'text' => $scriptText,
            'voice_id' => $voiceId,
            'speaking_rate' => 0.95,
            'pronunciation_hints' => $hints,
            'profile' => $profile,
            'music_track_id' => $musicTrackId ?: 'warm_pad',
        ]);

        if (! ($response['success'] ?? false)) {
            try {
                SubscriptionStatusService::transition(
                    $subscription,
                    SubscriptionStatusService::FAILED,
                    null,
                    'TTS generation failed'
                );
            } catch (\Exception $e) {
                Log::warning('could not mark subscription failed after TTS error: ' . $e->getMessage());
            }
            throw new \RuntimeException($response['message'] ?? 'TTS generation failed');
        }

        $audio = $response['audio'] ?? [];
        $binary = base64_decode($audio['content_base64'] ?? '', true);
        if ($binary === false || $binary === '') {
            throw new \RuntimeException('AI worker returned empty audio content');
        }

        $extension = $audio['format'] ?? 'wav';
        $relativePath = sprintf(
            'private/beat/%s/%s-%s.%s',
            $subscription->id,
            $assetType,
            now()->format('YmdHis'),
            $extension
        );

        Storage::disk('local')->put($relativePath, $binary);

        return AudioAsset::query()->create([
            'subscription_id' => $subscription->id,
            'asset_type' => $assetType,
            'voice_id' => $voiceId,
            'provider' => Config::get('beat.tts.provider', 'mms'),
            'file_path' => $relativePath,
            'format' => $extension,
            'sample_rate' => $audio['sample_rate'] ?? null,
            'duration_seconds' => $audio['duration_seconds'] ?? null,
            'checksum_sha256' => $audio['checksum_sha256'] ?? hash('sha256', $binary),
            'profile' => ($profile['profile_key'] ?? null) . ':' . ($musicTrackId ?: 'none'),
        ]);
    }

    protected static function defaultVoiceForSubscription(TuneSubscription $subscription): string
    {
        if (strtoupper((string) $subscription->voice_type) === 'MALE') {
            return 'local-male';
        }
        if (strtoupper((string) $subscription->voice_type) === 'FEMALE') {
            return 'local-female';
        }

        return (string) Config::get('beat.tts.default_voice_id', 'mms-swh-default');
    }

    protected static function resolveScriptText(TuneSubscription $subscription): string
    {
        if (is_string($subscription->voice_script) && trim($subscription->voice_script) !== '') {
            return trim($subscription->voice_script);
        }

        /** @var ScriptVersion|null $latest */
        $latest = ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->orderByDesc('version_number')
            ->first();

        return trim((string) ($latest?->plain_text ?? ''));
    }

    protected static function resolvePronunciationHints(TuneSubscription $subscription): array
    {
        /** @var ScriptVersion|null $latest */
        $latest = ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->orderByDesc('version_number')
            ->first();

        $payload = $latest?->structured_payload ?? [];
        $hints = $payload['pronunciation_hints'] ?? [];

        if (! is_array($hints)) {
            return [];
        }

        return array_values(array_filter($hints, fn ($hint) => is_array($hint) && ! empty($hint['word'])));
    }

    protected static function profileConfig(string $profileKey): array
    {
        $profile = Config::get("beat.audio.profiles.{$profileKey}", []);
        $profile['profile_key'] = $profileKey;

        return $profile;
    }

    protected static function handlePreviewLimitBreached(TuneSubscription $subscription, ?int $requestedBy): void
    {
        $limit = (int) Config::get('beat.limits.voice_previews', 5);
        if ((int) $subscription->voice_preview_count >= $limit) {
            try {
                SubscriptionStatusService::transition(
                    $subscription,
                    SubscriptionStatusService::MANUAL_REVIEW_REQUESTED,
                    $requestedBy,
                    'Voice preview generation limit reached'
                );
            } catch (\Exception $e) {
                Log::warning("could not transition subscription {$subscription->id} to manual review: " . $e->getMessage());
            }
        }
    }

}
