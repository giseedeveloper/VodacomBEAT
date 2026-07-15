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
            $voices = $response;
        } else {
            $voices = $response['voices'] ?? [];
        }

        return array_map(static function (array $voice): array {
            $id = (string) ($voice['id'] ?? $voice['slug'] ?? '');
            if ($id !== '') {
                $voice['sample_url'] = url('/api/v1/tunes/customer/tts/voices/' . rawurlencode($id) . '/sample');
            } else {
                $voice['sample_url'] = null;
            }

            return $voice;
        }, $voices);
    }

    public static function streamVoiceSample(string $voiceId): \Symfony\Component\HttpFoundation\Response
    {
        $voiceId = trim($voiceId);
        if ($voiceId === '') {
            abort(404, 'Voice sample not available');
        }

        $cachePath = 'private/beat/voice-samples/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $voiceId) . '.mp3';
        if (! Storage::disk('local')->exists($cachePath)) {
            $raw = BeatAiWorkerClient::getRaw('/v1/tts/voices/' . rawurlencode($voiceId) . '/sample', 90);
            if (! ($raw['ok'] ?? false) || ($raw['body'] ?? '') === '') {
                abort((int) ($raw['status'] ?? 502), $raw['message'] ?? 'Voice sample unavailable');
            }
            Storage::disk('local')->put($cachePath, $raw['body']);
        }

        return response(Storage::disk('local')->get($cachePath), 200, [
            'Content-Type' => 'audio/mpeg',
            'Cache-Control' => 'public, max-age=86400',
            'Accept-Ranges' => 'bytes',
        ]);
    }

    public static function canGeneratePreview(TuneSubscription $subscription): bool
    {
        if (! in_array($subscription->status, self::PREVIEW_STATUSES, true)) {
            return false;
        }

        $limit = (int) Config::get('beat.limits.voice_previews', 3);
        return (int) $subscription->voice_preview_count < $limit;
    }

    public static function canGeneratePronunciationTest(TuneSubscription $subscription): bool
    {
        $allowed = [
            SubscriptionStatusService::SCRIPT_READY,
            SubscriptionStatusService::PREVIEW_GENERATING,
            SubscriptionStatusService::PREVIEW_READY,
            SubscriptionStatusService::QA_CHANGES_REQUIRED,
        ];
        if (! in_array($subscription->status, $allowed, true)) {
            return false;
        }

        $limit = (int) Config::get('beat.limits.pronunciation_tests', 3);

        return (int) ($subscription->pronunciation_test_count ?? 0) < $limit;
    }

    public static function canGenerateFinal(TuneSubscription $subscription): bool
    {
        if (! SubscriptionStatusService::isPaidOrLater($subscription->status)) {
            return false;
        }

        if (! in_array($subscription->status, self::FINAL_STATUSES, true)) {
            return false;
        }

        $limit = (int) Config::get('beat.limits.full_revisions', 2);

        // Count increments after each successful final; block when already at/over limit.
        return (int) ($subscription->final_audio_regeneration_count ?? 0) < $limit;
    }

    /**
     * Short voice-only clip of business name / critical words (no music).
     *
     * @throws \RuntimeException
     */
    public static function generatePronunciationTest(
        TuneSubscription $subscription,
        ?string $voiceId = null,
        ?string $customPhrase = null,
        ?int $requestedBy = null
    ): AudioAsset {
        if (! self::canGeneratePronunciationTest($subscription)) {
            throw new \RuntimeException('Pronunciation test limit reached (max 3)');
        }

        $phrase = trim((string) ($customPhrase ?: $subscription->business_name));
        if ($phrase === '') {
            throw new \RuntimeException('No business name available for pronunciation test');
        }

        $voiceId = $voiceId
            ?: $subscription->preferred_voice_profile
            ?: self::defaultVoiceForSubscription($subscription);

        $asset = self::synthesizeAndStore(
            $subscription,
            'pronunciation_test',
            '/v1/tts/pronunciation-test',
            self::profileConfig('pronunciation_test'),
            $voiceId,
            'none',
            $phrase,
            [
                'speaking_speed' => $subscription->speaking_speed ?: 'normal',
                'music_intensity' => 'none',
                'render_mode' => 'pronunciation_test',
            ]
        );

        $subscription->pronunciation_test_count = (int) ($subscription->pronunciation_test_count ?? 0) + 1;
        $subscription->preferred_voice_profile = $voiceId;
        if (str_starts_with(strtolower((string) $voiceId), 'daudi')) {
            $subscription->voice_type = 'MALE';
        } elseif (str_starts_with(strtolower((string) $voiceId), 'rehema')) {
            $subscription->voice_type = 'FEMALE';
        }
        $subscription->save();

        return $asset;
    }

    /**
     * @throws \RuntimeException
     */
    public static function generatePreview(
        TuneSubscription $subscription,
        ?string $voiceId = null,
        ?int $requestedBy = null,
        ?string $musicTrackId = 'warm_pad',
        ?string $speakingSpeed = null,
        ?string $musicIntensity = null
    ): AudioAsset {
        if (! self::canGeneratePreview($subscription)) {
            self::handlePreviewLimitBreached($subscription, $requestedBy);
            throw new \RuntimeException('Voice preview generation is not allowed for this subscription');
        }

        $previousMusic = $subscription->preferred_music_track_id;
        $voiceId = $voiceId
            ?: $subscription->preferred_voice_profile
            ?: self::defaultVoiceForSubscription($subscription);
        $musicTrackId = $musicTrackId ?: ($subscription->preferred_music_track_id ?: 'warm_pad');
        $speakingSpeed = $speakingSpeed ?: ($subscription->speaking_speed ?: 'normal');
        $musicIntensity = $musicIntensity ?: ($subscription->music_intensity ?: 'medium');

        if ($previousMusic && $previousMusic !== $musicTrackId) {
            $musicLimit = (int) Config::get('beat.limits.music_changes', 3);
            if ((int) ($subscription->music_change_count ?? 0) >= $musicLimit) {
                throw new \RuntimeException('Music change limit reached (max 3)');
            }
            $subscription->music_change_count = (int) ($subscription->music_change_count ?? 0) + 1;
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
            $musicTrackId,
            null,
            [
                'speaking_speed' => $speakingSpeed,
                'music_intensity' => $musicIntensity,
                'render_mode' => 'preview',
            ]
        );

        $subscription->voice_preview_count = (int) $subscription->voice_preview_count + 1;
        $subscription->preferred_voice_profile = $voiceId;
        if (str_starts_with(strtolower((string) $voiceId), 'daudi')) {
            $subscription->voice_type = 'MALE';
        } elseif (str_starts_with(strtolower((string) $voiceId), 'rehema')) {
            $subscription->voice_type = 'FEMALE';
        }
        $subscription->preferred_music_track_id = $musicTrackId;
        $subscription->speaking_speed = $speakingSpeed;
        $subscription->music_intensity = $musicIntensity;
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
            $musicTrackId,
            null,
            [
                'speaking_speed' => $subscription->speaking_speed ?: 'normal',
                'music_intensity' => $subscription->music_intensity ?: 'medium',
                'render_mode' => 'final',
            ]
        );

        $subscription->final_audio_regeneration_count = (int) ($subscription->final_audio_regeneration_count ?? 0) + 1;
        $subscription->save();

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
            $tracks = $response;
        } else {
            $tracks = $response['tracks'] ?? [
                ['id' => 'none', 'label' => 'Bila Muziki / No Music', 'mood' => 'none'],
                ['id' => 'warm_pad', 'label' => 'Warm Soft Pad', 'mood' => 'calm'],
                ['id' => 'piano_glow', 'label' => 'Mountain Piano', 'mood' => 'warm'],
                ['id' => 'mountain_soft', 'label' => 'Mountain Soft Bed', 'mood' => 'calm'],
                ['id' => 'soft_ambient', 'label' => 'Soft Ambient Groove', 'mood' => 'friendly'],
                ['id' => 'afro_light', 'label' => 'Afro Light Groove', 'mood' => 'upbeat'],
                ['id' => 'marimba_glow', 'label' => 'Marimba Glow', 'mood' => 'friendly'],
                ['id' => 'corporate_clean', 'label' => 'Corporate Clean', 'mood' => 'professional'],
            ];
        }

        return array_map(static function (array $track): array {
            $id = (string) ($track['id'] ?? '');
            if ($id !== '' && $id !== 'none') {
                $track['preview_url'] = url('/api/v1/tunes/customer/music/tracks/' . rawurlencode($id) . '/preview');
            } else {
                $track['preview_url'] = null;
            }

            return $track;
        }, $tracks);
    }

    public static function streamMusicPreview(string $trackId): \Symfony\Component\HttpFoundation\Response
    {
        $trackId = trim($trackId);
        if ($trackId === '' || $trackId === 'none') {
            abort(404, 'Music track preview not available');
        }

        $raw = BeatAiWorkerClient::getRaw('/v1/music/tracks/' . rawurlencode($trackId) . '/preview', 45);
        if (! ($raw['ok'] ?? false) || ($raw['body'] ?? '') === '') {
            abort((int) ($raw['status'] ?? 502), $raw['message'] ?? 'Music preview unavailable');
        }

        return response($raw['body'], 200, [
            'Content-Type' => $raw['content_type'] ?: 'audio/mpeg',
            'Cache-Control' => 'public, max-age=86400',
            'Accept-Ranges' => 'bytes',
        ]);
    }

    protected static function synthesizeAndStore(
        TuneSubscription $subscription,
        string $assetType,
        string $workerPath,
        array $profile,
        ?string $voiceId,
        ?string $musicTrackId = 'warm_pad',
        ?string $overrideText = null,
        array $options = []
    ): AudioAsset {
        $scriptText = $overrideText !== null ? trim($overrideText) : self::resolveScriptText($subscription);
        if ($scriptText === '') {
            throw new \RuntimeException('Subscription has no script text for TTS');
        }

        $voiceId = $voiceId ?: self::defaultVoiceForSubscription($subscription);
        $hints = self::resolvePronunciationHints($subscription);

        $payload = [
            'subscription_id' => $subscription->id,
            'text' => $scriptText,
            'voice_id' => $voiceId,
            'speaking_rate' => 1.0,
            'speaking_speed' => $options['speaking_speed'] ?? ($subscription->speaking_speed ?: 'normal'),
            'music_intensity' => $options['music_intensity'] ?? ($subscription->music_intensity ?: 'medium'),
            'pronunciation_hints' => $hints,
            'profile' => $profile,
            'music_track_id' => $musicTrackId ?: 'warm_pad',
            'render_mode' => $options['render_mode'] ?? null,
        ];

        $response = BeatAiWorkerClient::post($workerPath, $payload);

        if (! ($response['success'] ?? false)) {
            try {
                if ($assetType !== 'pronunciation_test') {
                    SubscriptionStatusService::transition(
                        $subscription,
                        SubscriptionStatusService::FAILED,
                        null,
                        'TTS generation failed'
                    );
                }
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

        $ttl = (int) Config::get('beat.limits.audio_url_ttl_minutes', 30);

        return AudioAsset::query()->create([
            'subscription_id' => $subscription->id,
            'asset_type' => $assetType,
            'voice_id' => $voiceId,
            'provider' => Config::get('beat.tts.provider', 'azure'),
            'file_path' => $relativePath,
            'format' => $extension,
            'sample_rate' => $audio['sample_rate'] ?? null,
            'duration_seconds' => $audio['duration_seconds'] ?? null,
            'checksum_sha256' => $audio['checksum_sha256'] ?? hash('sha256', $binary),
            'profile' => ($profile['profile_key'] ?? null) . ':' . ($musicTrackId ?: 'none'),
            'qc_report' => $audio['qc_report'] ?? null,
            'qc_passed' => $audio['qc_passed'] ?? null,
            'expires_at' => $assetType === 'preview' || $assetType === 'pronunciation_test'
                ? now()->addMinutes($ttl)
                : null,
        ]);
    }

    public static function signedPlayUrl(AudioAsset $asset, string $reference): string
    {
        $ttl = (int) Config::get('beat.limits.audio_url_ttl_minutes', 30);

        return \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'customer.audio.stream',
            now()->addMinutes($ttl),
            [
                'assetId' => $asset->id,
                'reference' => $reference,
            ]
        );
    }

    protected static function defaultVoiceForSubscription(TuneSubscription $subscription): string
    {
        if (strtoupper((string) $subscription->voice_type) === 'MALE') {
            return 'daudi-professional';
        }
        if (strtoupper((string) $subscription->voice_type) === 'FEMALE') {
            return 'rehema-friendly';
        }

        return (string) Config::get('beat.tts.default_voice_id', 'daudi-professional');
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
            $hints = [];
        }

        $fromDb = \App\Models\PronunciationEntry::query()
            ->where('is_active', true)
            ->where(function ($query) use ($subscription) {
                $query->where('scope', 'GLOBAL')
                    ->orWhere(function ($inner) use ($subscription) {
                        $inner->whereIn('scope', ['BUSINESS', 'subscription'])
                            ->where('subscription_id', $subscription->id);
                    });
            })
            ->get(['original_text', 'replacement_text']);

        foreach ($fromDb as $entry) {
            $hints[] = [
                'word' => $entry->original_text,
                'hint' => $entry->replacement_text ?: $entry->original_text,
            ];
        }

        // Always include business name as a pronunciation candidate if multi-word/unusual
        if ($subscription->business_name) {
            $hints[] = [
                'word' => $subscription->business_name,
                'hint' => $subscription->business_name,
            ];
        }

        return array_values(array_filter(
            $hints,
            fn ($hint) => is_array($hint) && ! empty($hint['word'])
        ));
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
