<?php

namespace App\Services;

use App\Models\BusinessAiAnalysis;
use App\Models\TuneSubscription;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class BusinessAnalysisService
{
    public const ACTION_MANUAL_CATEGORY_REVIEW = 'MANUAL_CATEGORY_REVIEW';
    public const ACTION_ASK_FOLLOW_UP = 'ASK_FOLLOW_UP_QUESTIONS';
    public const ACTION_GENERATE_WITH_ADMIN_REVIEW = 'GENERATE_WITH_ADMIN_REVIEW';
    public const ACTION_GENERATE_AUTOMATICALLY = 'GENERATE_AUTOMATICALLY';

    /**
     * Never send payment / MSISDN / Selcom details to Gemini.
     *
     * @return array<string, mixed>
     */
    public static function safeInputSnapshot(TuneSubscription $subscription): array
    {
        return [
            'business_name' => $subscription->business_name,
            'description' => $subscription->business_description
                ?: $subscription->business_industry
                ?: '',
            'products_or_services' => $subscription->products_or_services ?: [],
            'secondary_products' => $subscription->secondary_products ?: [],
            'target_audience' => $subscription->target_audience,
            'location' => $subscription->business_location,
            'landmark' => $subscription->landmark,
            'call_to_action' => $subscription->call_to_action,
            'preferred_tone' => $subscription->preferred_tone,
            'selling_points' => $subscription->selling_points ?: [],
            'offer_text' => $subscription->offer_text,
            'must_include_words' => $subscription->must_include_words ?: [],
            'must_exclude_words' => $subscription->must_exclude_words ?: [],
        ];
    }

    /**
     * @param  array<string, mixed>  $analysis
     */
    public static function determineAction(array $analysis): string
    {
        $confidence = (float) ($analysis['confidence'] ?? 0);
        $missing = $analysis['missing_fields'] ?? $analysis['missingFields'] ?? [];
        $riskFlags = $analysis['risk_flags'] ?? $analysis['riskFlags'] ?? [];
        $category = (string) ($analysis['category'] ?? 'GENERAL_OTHER');

        $critical = Config::get('beat.analysis.critical_missing_fields', []);
        $manualThreshold = (float) Config::get('beat.analysis.confidence_manual', 0.65);

        $hasCriticalMissing = (bool) array_intersect($critical, (array) $missing);
        $hasSensitiveRisk = collect((array) $riskFlags)
            ->filter(fn ($flag) => $flag && $flag !== 'NONE')
            ->isNotEmpty();

        // True ambiguous cases only — clear retail/food matches must not dead-end the customer
        if ($confidence < $manualThreshold && $category === 'GENERAL_OTHER') {
            return self::ACTION_MANUAL_CATEGORY_REVIEW;
        }

        if ($hasCriticalMissing) {
            return self::ACTION_ASK_FOLLOW_UP;
        }

        if ($confidence < $manualThreshold || $hasSensitiveRisk) {
            return self::ACTION_GENERATE_WITH_ADMIN_REVIEW;
        }

        return self::ACTION_GENERATE_AUTOMATICALLY;
    }

    /**
     * @return array{
     *   analysis: BusinessAiAnalysis,
     *   next_action: string,
     *   template_key: string|null,
     *   requires_admin_review: bool,
     *   follow_up_questions: array<int, string>
     * }
     */
    public static function analyze(TuneSubscription $subscription, ?int $requestedBy = null): array
    {
        $started = microtime(true);
        $input = self::safeInputSnapshot($subscription);

        $payload = array_merge($input, [
            'subscription_id' => $subscription->id,
            'allowed_categories' => Config::get('beat.taxonomies.categories', []),
            'allowed_objectives' => Config::get('beat.taxonomies.objectives', []),
            'allowed_tones' => Config::get('beat.taxonomies.tones', []),
            'allowed_missing_fields' => Config::get('beat.taxonomies.missing_fields', []),
            'allowed_risk_flags' => Config::get('beat.taxonomies.risk_flags', []),
        ]);

        $response = BeatAiWorkerClient::post('/v1/business/analyze', $payload);
        $latencyMs = (int) ((microtime(true) - $started) * 1000);

        if (! ($response['success'] ?? false)) {
            Log::error('Business analysis failed', ['response' => $response]);
            throw new \RuntimeException($response['message'] ?? 'Business analysis failed');
        }

        $analysis = $response['analysis'] ?? [];
        self::assertEnums($analysis);

        $action = self::determineAction($analysis);
        $tone = (string) ($analysis['recommendedTone'] ?? $subscription->preferred_tone ?? 'FRIENDLY_SALES');
        $category = (string) ($analysis['category'] ?? 'GENERAL_OTHER');
        $objective = (string) ($analysis['objective'] ?? 'BRAND_AWARENESS');

        $template = TemplateResolverService::resolve(
            $category,
            $objective,
            $tone,
            $analysis['recommendedTemplateKey'] ?? null
        );

        $requiresAdmin = $action === self::ACTION_GENERATE_WITH_ADMIN_REVIEW
            || $action === self::ACTION_MANUAL_CATEGORY_REVIEW;

        /** @var BusinessAiAnalysis $record */
        $record = BusinessAiAnalysis::query()->create([
            'subscription_id' => $subscription->id,
            'provider' => $response['provider'] ?? 'gemini',
            'model' => $response['model'] ?? Config::get('beat.gemini.model'),
            'prompt_version' => 'v1',
            'input_snapshot' => $input,
            'raw_response' => $response,
            'parsed_response' => $analysis,
            'category' => $category,
            'subcategory' => $analysis['subcategory'] ?? null,
            'objective' => $objective,
            'recommended_tone' => $tone,
            'confidence' => $analysis['confidence'] ?? null,
            'risk_flags' => $analysis['riskFlags'] ?? [],
            'missing_fields' => $analysis['missingFields'] ?? [],
            'follow_up_questions' => $analysis['followUpQuestions'] ?? [],
            'recommended_template_key' => $analysis['recommendedTemplateKey'] ?? null,
            'resolved_template_key' => $template->template_key,
            'next_action' => $action,
            'requires_admin_review' => $requiresAdmin,
            'latency_ms' => $latencyMs,
            'input_tokens' => $response['usage']['input_tokens'] ?? null,
            'output_tokens' => $response['usage']['output_tokens'] ?? null,
            'status' => 'completed',
        ]);

        $subscription->fill([
            'business_category' => $category,
            'ad_objective' => $objective,
            'preferred_tone' => $subscription->preferred_tone ?: $tone,
            'script_template_key' => $template->template_key,
            'analysis_action' => $action,
            'requires_admin_script_review' => $requiresAdmin,
            'latest_analysis_id' => $record->id,
        ]);

        // Enrich from analysis when customer left fields empty (never invent prices/phones).
        if (empty($subscription->products_or_services) && ! empty($analysis['primaryProductsOrServices'])) {
            $subscription->products_or_services = array_slice((array) $analysis['primaryProductsOrServices'], 0, 15);
        }
        if (empty($subscription->selling_points) && ! empty($analysis['keySellingPoints'])) {
            $subscription->selling_points = array_slice((array) $analysis['keySellingPoints'], 0, 10);
        }
        if (empty($subscription->business_location) && ! empty($analysis['detectedLocation'])) {
            $subscription->business_location = $analysis['detectedLocation'];
        }
        if (empty($subscription->call_to_action) && ! empty($analysis['objective'])) {
            $subscription->call_to_action = self::defaultCtaForObjective($objective);
        }

        $subscription->save();

        if ($action === self::ACTION_MANUAL_CATEGORY_REVIEW) {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::MANUAL_REVIEW_REQUESTED,
                $requestedBy,
                'Low-confidence business analysis'
            );
        }

        return [
            'analysis' => $record,
            'next_action' => $action,
            'template_key' => $template->template_key,
            'requires_admin_review' => $requiresAdmin,
            'follow_up_questions' => $analysis['followUpQuestions'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $analysis
     */
    protected static function assertEnums(array &$analysis): void
    {
        $categories = Config::get('beat.taxonomies.categories', []);
        $objectives = Config::get('beat.taxonomies.objectives', []);
        $tones = Config::get('beat.taxonomies.tones', []);
        $missingAllowed = Config::get('beat.taxonomies.missing_fields', []);
        $riskAllowed = Config::get('beat.taxonomies.risk_flags', []);

        if (! in_array($analysis['category'] ?? null, $categories, true)) {
            $analysis['category'] = 'GENERAL_OTHER';
        }
        if (! in_array($analysis['objective'] ?? null, $objectives, true)) {
            $analysis['objective'] = 'BRAND_AWARENESS';
        }
        if (! in_array($analysis['recommendedTone'] ?? null, $tones, true)) {
            $analysis['recommendedTone'] = 'FRIENDLY_SALES';
        }

        $analysis['missingFields'] = array_values(array_intersect(
            (array) ($analysis['missingFields'] ?? []),
            $missingAllowed
        ));
        $analysis['riskFlags'] = array_values(array_intersect(
            (array) ($analysis['riskFlags'] ?? []),
            $riskAllowed
        )) ?: ['NONE'];
    }

    protected static function defaultCtaForObjective(string $objective): string
    {
        return match ($objective) {
            'CALL_NOW' => 'Piga simu sasa',
            'BOOK_SERVICE' => 'Weka booking yako leo',
            'PROMOTE_PRODUCTS' => 'Jiunge na wateja wetu leo',
            'ANNOUNCE_OFFER' => 'Karibu uchukue ofa yetu',
            'EVENT_ANNOUNCEMENT' => 'Karibu kwenye tukio letu',
            'BRAND_AWARENESS' => 'Kumbuka jina letu',
            default => 'Karibu ututembelee',
        };
    }
}
