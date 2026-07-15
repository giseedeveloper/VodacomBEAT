<?php

namespace App\Services;

use App\Models\ScriptTemplate;
use App\Models\ScriptVersion;
use App\Models\TuneSubscription;
use Illuminate\Support\Facades\Config;

class BeatScriptService
{

    protected const GENERATABLE_STATUSES = [
        SubscriptionStatusService::DRAFT,
        SubscriptionStatusService::SCRIPT_READY,
        SubscriptionStatusService::PREVIEW_READY,
        SubscriptionStatusService::QA_CHANGES_REQUIRED,
        SubscriptionStatusService::MANUAL_REVIEW_REQUESTED,
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
     * Request script generation using validated template + Gemini (via ai-worker).
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

        $template = self::resolveTemplate($subscription);
        $safe = BusinessAnalysisService::safeInputSnapshot($subscription);

        $payload = [
            'subscription_id' => $subscription->id,
            'business_name' => $subscription->business_name,
            'business_location' => $subscription->business_location,
            'landmark' => $subscription->landmark,
            'business_industry' => $subscription->business_industry,
            'business_description' => $subscription->business_description,
            'products_or_services' => $subscription->products_or_services ?: [],
            'secondary_products' => $subscription->secondary_products ?: [],
            'selling_points' => $subscription->selling_points ?: [],
            'target_audience' => $subscription->target_audience,
            'call_to_action' => $subscription->call_to_action,
            'offer_text' => $subscription->offer_text,
            'must_include_words' => $subscription->must_include_words ?: [],
            'must_exclude_words' => $subscription->must_exclude_words ?: [],
            'category' => $subscription->business_category,
            'objective' => $subscription->ad_objective,
            'tone' => $subscription->preferred_tone ?: 'FRIENDLY_SALES',
            'voice_type' => $subscription->voice_type,
            'language' => Config::get('beat.script.default_language', 'sw-TZ'),
            'max_duration_seconds' => (int) ($template->target_duration_seconds ?: Config::get('beat.script.max_duration_seconds', 30)),
            'maximum_words' => (int) ($template->maximum_words ?: Config::get('beat.script.maximum_words', 75)),
            'forbidden_claims' => array_values(array_unique(array_merge(
                Config::get('beat.script.forbidden_claims', []),
                $template->prohibited_claims ?? [],
                $subscription->must_exclude_words ?: []
            ))),
            'template' => [
                'template_key' => $template->template_key,
                'maximum_words' => $template->maximum_words,
                'target_duration_seconds' => $template->target_duration_seconds,
                'opening_rules' => $template->opening_rules ?? [],
                'body_rules' => $template->body_rules ?? [],
                'cta_rules' => $template->cta_rules ?? [],
                'prompt_instructions' => $template->prompt_instructions,
            ],
            // Explicitly omit payment / MSISDN fields
            'safe_context' => $safe,
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
        $variants = $scriptData['versions'] ?? [];
        $chosenText = $scriptData['plain_text'] ?? '';
        if ($chosenText === '' && ! empty($variants[0]['text'])) {
            $chosenText = $variants[0]['text'];
            $scriptData['plain_text'] = $chosenText;
        }

        $backendValidation = ScriptValidationService::validateGeneratedScript([
            'script' => $chosenText,
            'business_name' => $subscription->business_name,
            'location' => $subscription->business_location,
            'maximum_words' => $template->maximum_words,
            'prohibited_terms' => $payload['forbidden_claims'],
            'must_include_words' => $subscription->must_include_words ?: [],
            'must_exclude_words' => $subscription->must_exclude_words ?: [],
        ]);

        $validationErrors = array_values(array_unique(array_merge(
            $response['validation_errors'] ?? [],
            $backendValidation['problems']
        )));

        // Validate each variant too; keep metadata for UI
        $validatedVariants = [];
        foreach ($variants as $variant) {
            $text = (string) ($variant['text'] ?? '');
            $result = ScriptValidationService::validateGeneratedScript([
                'script' => $text,
                'business_name' => $subscription->business_name,
                'location' => $subscription->business_location,
                'maximum_words' => $template->maximum_words,
                'prohibited_terms' => $payload['forbidden_claims'],
                'must_include_words' => $subscription->must_include_words ?: [],
                'must_exclude_words' => $subscription->must_exclude_words ?: [],
            ]);
            $validatedVariants[] = [
                'variant' => $variant['variant'] ?? $variant['label'] ?? 'VARIANT',
                'label' => $variant['label'] ?? $variant['variant'] ?? 'VARIANT',
                'text' => $text,
                'word_count' => $result['word_count'],
                'valid' => $result['valid'],
                'problems' => $result['problems'],
            ];
        }
        $scriptData['versions'] = $validatedVariants;
        $scriptData['word_count'] = $backendValidation['word_count'];
        $scriptData['template_key'] = $template->template_key;
        $scriptData['requires_admin_review'] = (bool) $subscription->requires_admin_script_review;

        $nextVersion = ((int) ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->max('version_number')) + 1;

        /** @var ScriptVersion $scriptVersion */
        $scriptVersion = ScriptVersion::query()->create([
            'subscription_id' => $subscription->id,
            'version_number' => $nextVersion,
            'language' => $scriptData['language'] ?? Config::get('beat.script.default_language', 'sw-TZ'),
            'plain_text' => $chosenText ?: null,
            'structured_payload' => $scriptData,
            'validation_errors' => $validationErrors ?: null,
            'estimated_duration_seconds' => $scriptData['estimated_duration_seconds'] ?? null,
            'tone' => $scriptData['tone'] ?? $subscription->preferred_tone,
            'source' => 'ai_worker',
        ]);

        $subscription->script_generation_count = (int) $subscription->script_generation_count + 1;
        if ($chosenText !== '') {
            $subscription->voice_script = $chosenText;
            $subscription->selected_script_variant = $validatedVariants[0]['variant'] ?? 'SHORT_DIRECT';
        }
        $subscription->script_template_key = $template->template_key;
        $subscription->save();

        SubscriptionStatusService::transition(
            $subscription,
            SubscriptionStatusService::SCRIPT_READY,
            $requestedBy,
            empty($validationErrors)
                ? 'Script generated successfully'
                : 'Script generated with validation warnings'
        );

        return $scriptVersion;
    }

    public static function selectVariant(TuneSubscription $subscription, string $variant, ?string $plainText = null): TuneSubscription
    {
        $latest = ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->orderByDesc('version_number')
            ->first();

        $text = $plainText;
        if ($text === null && $latest) {
            $versions = $latest->structured_payload['versions'] ?? [];
            foreach ($versions as $item) {
                if (($item['variant'] ?? $item['label'] ?? '') === $variant) {
                    $text = $item['text'] ?? null;
                    break;
                }
            }
        }

        if (! is_string($text) || trim($text) === '') {
            throw new \RuntimeException('Selected script variant not found');
        }

        $subscription->voice_script = trim($text);
        $subscription->selected_script_variant = $variant;
        $subscription->save();

        return $subscription->refresh();
    }

    protected static function resolveTemplate(TuneSubscription $subscription): ScriptTemplate
    {
        if ($subscription->script_template_key) {
            $existing = ScriptTemplate::query()
                ->where('template_key', $subscription->script_template_key)
                ->where('status', 'ACTIVE')
                ->first();
            if ($existing) {
                return $existing;
            }
        }

        return TemplateResolverService::resolve(
            (string) ($subscription->business_category ?: 'GENERAL_OTHER'),
            (string) ($subscription->ad_objective ?: 'BRAND_AWARENESS'),
            (string) ($subscription->preferred_tone ?: 'FRIENDLY_SALES')
        );
    }

}
