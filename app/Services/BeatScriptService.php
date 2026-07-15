<?php

namespace App\Services;

use App\Models\ScriptVersion;
use App\Models\TuneSubscription;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class BeatScriptService
{

    protected const GENERATABLE_STATUSES = [
        SubscriptionStatusService::DRAFT,
        SubscriptionStatusService::SCRIPT_READY,
        SubscriptionStatusService::PREVIEW_READY,
        SubscriptionStatusService::QA_CHANGES_REQUIRED,
    ];

    public static function canGenerate(TuneSubscription $subscription): bool
    {
        if (! in_array($subscription->status, self::GENERATABLE_STATUSES, true)) {
            return false;
        }

        $limit = (int) Config::get('beat.limits.script_generations', 3);
        return (int) $subscription->script_generation_count < $limit;
    }

    /**
     * Request script generation from the Python ai-worker and persist the result.
     *
     * @throws \RuntimeException
     */
    public static function generate(TuneSubscription $subscription, ?int $requestedBy = null): ScriptVersion
    {
        if (! self::canGenerate($subscription)) {
            $limit = (int) Config::get('beat.limits.script_generations', 3);
            if ((int) $subscription->script_generation_count >= $limit) {
                SubscriptionStatusService::transition(
                    $subscription,
                    SubscriptionStatusService::MANUAL_REVIEW_REQUESTED,
                    $requestedBy,
                    'Script generation limit reached'
                );
            }

            throw new \RuntimeException('Script generation is not allowed for this subscription');
        }

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::SCRIPT_GENERATING,
            $requestedBy,
            'AI script generation started'
        );

        $payload = [
            'subscription_id' => $subscription->id,
            'business_name' => $subscription->business_name,
            'business_location' => $subscription->business_location,
            'business_industry' => $subscription->business_industry,
            'call_to_action' => $subscription->call_to_action,
            'voice_type' => $subscription->voice_type,
            'language' => Config::get('beat.script.default_language', 'sw-TZ'),
            'max_duration_seconds' => (int) Config::get('beat.script.max_duration_seconds', 30),
            'forbidden_claims' => Config::get('beat.script.forbidden_claims', []),
        ];

        $response = BeatAiWorkerClient::post('/v1/script/generate', $payload);
        if (! ($response['success'] ?? false)) {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::FAILED,
                $requestedBy,
                'AI script generation failed'
            );
            throw new \RuntimeException($response['message'] ?? 'AI worker script generation failed');
        }

        $scriptData = $response['script'] ?? [];
        $validationErrors = $response['validation_errors'] ?? [];
        $nextVersion = ((int) ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->max('version_number')) + 1;

        /** @var ScriptVersion $scriptVersion */
        $scriptVersion = ScriptVersion::query()->create([
            'subscription_id' => $subscription->id,
            'version_number' => $nextVersion,
            'language' => $scriptData['language'] ?? Config::get('beat.script.default_language', 'sw-TZ'),
            'plain_text' => $scriptData['plain_text'] ?? null,
            'structured_payload' => $scriptData,
            'validation_errors' => $validationErrors ?: null,
            'estimated_duration_seconds' => $scriptData['estimated_duration_seconds'] ?? null,
            'tone' => $scriptData['tone'] ?? null,
            'source' => 'ai_worker',
        ]);

        $subscription->script_generation_count = (int) $subscription->script_generation_count + 1;
        if (! empty($scriptData['plain_text'])) {
            $subscription->voice_script = $scriptData['plain_text'];
        }
        $subscription->save();

        if (! empty($validationErrors)) {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::SCRIPT_READY,
                $requestedBy,
                'Script generated with validation warnings'
            );
        } else {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::SCRIPT_READY,
                $requestedBy,
                'Script generated successfully'
            );
        }

        return $scriptVersion;
    }

}
