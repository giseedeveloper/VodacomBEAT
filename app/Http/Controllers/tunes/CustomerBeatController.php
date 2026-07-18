<?php

namespace App\Http\Controllers\tunes;

use App\Http\Controllers\BaseController;
use App\Models\AudioAsset;
use App\Models\ScriptVersion;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Models\TuneSubscriptionPackage;
use App\Models\TtsVoiceProfile;
use App\Services\BeatAudioService;
use App\Services\BeatScriptService;
use App\Services\BusinessAnalysisService;
use App\Services\NotificationServiceService;
use App\Services\SubscriptionStatusService;
use App\Services\TunesSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CustomerBeatController extends BaseController
{

    public function createDraft(Request $request): JsonResponse
    {
        Log::info('customer draft subscription: ' . json_encode($request->except([
            'subscription_phones', 'payment_phone', 'contact_phone',
        ])));

        $request->validate([
            'contact_person_name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:32',
            // Package & activation phones are picked at checkout (after audio approval)
            'subscription_package' => 'nullable',
            'voice_type' => 'nullable|in:MALE,FEMALE',
            'subscription_phones' => 'nullable|array',
            'business_location' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'business_industry' => 'nullable|string|max:255',
            'business_description' => 'nullable|string|max:2000',
            'offer_type' => 'nullable|in:PRODUCTS,SERVICES,BOTH',
            'instagram_handle' => 'nullable|string|max:255',
            'facebook_handle' => 'nullable|string|max:255',
            'tiktok_handle' => 'nullable|string|max:255',
            'website_url' => 'nullable|string|max:255',
            'products_or_services' => 'nullable',
            'secondary_products' => 'nullable',
            'target_audience' => 'nullable|string|max:500',
            'call_to_action' => 'nullable|string|max:255',
            'selling_points' => 'nullable',
            'preferred_tone' => 'nullable|string|max:64',
            'must_include_words' => 'nullable',
            'must_exclude_words' => 'nullable',
            'offer_text' => 'nullable|string|max:255',
            'voice_script' => 'nullable|string|max:2000',
        ]);

        $packageNumber = $request->input('subscription_package');
        $packageConfiguration = null;
        if ($packageNumber !== null && $packageNumber !== '') {
            $packageConfiguration = TuneSubscriptionPackage::query()->where(['package' => $packageNumber])->first();
            if (! $packageConfiguration) {
                return $this->returnError("Package {$packageNumber} does not exist", [], 400);
            }
        }

        $subscription = TunesSubscriptionService::addPendingSubscription(
            $request,
            $packageConfiguration,
            null,
            SubscriptionStatusService::DRAFT
        );

        try {
            $analysisResult = BusinessAnalysisService::analyze($subscription, null);
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [
                'subscription' => $subscription->refresh(),
            ], 502);
        }

        $nextStep = match ($analysisResult['next_action']) {
            BusinessAnalysisService::ACTION_ASK_FOLLOW_UP => 'clarify',
            BusinessAnalysisService::ACTION_MANUAL_CATEGORY_REVIEW => 'status',
            default => 'script_pending',
        };

        return $this->returnResponse('Draft subscription created', [
            'subscription' => $subscription->refresh(),
            'analysis' => $analysisResult['analysis'],
            'next_action' => $analysisResult['next_action'],
            'follow_up_questions' => $analysisResult['follow_up_questions'],
            'template_key' => $analysisResult['template_key'],
            'requires_admin_review' => $analysisResult['requires_admin_review'],
            'next_step' => $nextStep,
        ]);
    }

    public function answerFollowUp(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'follow_up_answers' => 'nullable|array',
            'follow_up_answers.*.question' => 'nullable|string|max:500',
            'follow_up_answers.*.answer' => 'nullable|string|max:1000',
            'business_description' => 'nullable|string|max:2000',
            'products_or_services' => 'nullable',
            'secondary_products' => 'nullable',
            'business_location' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'call_to_action' => 'nullable|string|max:255',
            'target_audience' => 'nullable|string|max:500',
            'selling_points' => 'nullable',
            'preferred_tone' => 'nullable|string',
            'offer_text' => 'nullable|string|max:255',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        // Q&A answers from the clarify step are appended to the description so
        // the analyzer re-runs with the new information (no duplicated form fields).
        $qaText = collect($request->input('follow_up_answers', []))
            ->filter(fn ($qa) => filled($qa['answer'] ?? null))
            ->map(fn ($qa) => trim(($qa['question'] ?? 'Swali') . ' — ' . $qa['answer']))
            ->implode("\n");

        if ($qaText !== '') {
            $existingDescription = $request->input('business_description', $subscription->business_description);
            $request->merge([
                'business_description' => trim(
                    ($existingDescription ? $existingDescription . "\n\n" : '')
                    . "Majibu ya maswali ya ziada:\n" . $qaText
                ),
            ]);
        }

        $subscription->fill([
            'business_description' => $request->input('business_description', $subscription->business_description),
            'products_or_services' => TunesSubscriptionService::normalizeStringList(
                $request->input('products_or_services', $subscription->products_or_services)
            ),
            'secondary_products' => TunesSubscriptionService::normalizeStringList(
                $request->input('secondary_products', $subscription->secondary_products)
            ),
            'business_location' => $request->input('business_location', $subscription->business_location),
            'landmark' => $request->input('landmark', $subscription->landmark),
            'call_to_action' => $request->input('call_to_action', $subscription->call_to_action),
            'target_audience' => $request->input('target_audience', $subscription->target_audience),
            'selling_points' => TunesSubscriptionService::normalizeStringList(
                $request->input('selling_points', $subscription->selling_points)
            ),
            'preferred_tone' => $request->input('preferred_tone', $subscription->preferred_tone),
            'offer_text' => $request->input('offer_text', $subscription->offer_text),
        ]);
        $subscription->save();

        try {
            $analysisResult = BusinessAnalysisService::analyze($subscription, null);
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        $nextStep = match ($analysisResult['next_action']) {
            BusinessAnalysisService::ACTION_ASK_FOLLOW_UP => 'clarify',
            BusinessAnalysisService::ACTION_MANUAL_CATEGORY_REVIEW => 'status',
            default => 'script_pending',
        };

        return $this->returnResponse('Follow-up answers saved', [
            'subscription' => $subscription->refresh(),
            'analysis' => $analysisResult['analysis'],
            'next_action' => $analysisResult['next_action'],
            'follow_up_questions' => $analysisResult['follow_up_questions'],
            'template_key' => $analysisResult['template_key'],
            'requires_admin_review' => $analysisResult['requires_admin_review'],
            'next_step' => $nextStep,
        ]);
    }

    public function analyzeBusiness(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        try {
            $analysisResult = BusinessAnalysisService::analyze($subscription, null);
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Business analyzed', [
            'subscription' => $subscription->refresh(),
            'analysis' => $analysisResult['analysis'],
            'next_action' => $analysisResult['next_action'],
            'follow_up_questions' => $analysisResult['follow_up_questions'],
            'template_key' => $analysisResult['template_key'],
            'requires_admin_review' => $analysisResult['requires_admin_review'],
        ]);
    }

    public function getDetails(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $scripts = ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->orderByDesc('version_number')
            ->get();

        $assets = AudioAsset::query()
            ->where('subscription_id', $subscription->id)
            ->latest()
            ->get()
            ->map(function (AudioAsset $asset) use ($subscription) {
                $asset->setAttribute(
                    'play_url',
                    BeatAudioService::signedPlayUrl($asset, $subscription->subscription_reference)
                );

                return $asset;
            });

        $transaction = SelcomTransaction::query()
            ->where('order_id', $subscription->subscription_reference)
            ->latest()
            ->first();

        return $this->returnResponse('Subscription details', [
            'subscription' => $subscription,
            'script_versions' => $scripts,
            'audio_assets' => $assets,
            'transaction' => $transaction,
            'wizard_step' => self::wizardStepForStatus($subscription->status),
            'limits' => [
                'pronunciation_tests' => (int) config('beat.limits.pronunciation_tests', 3),
                'voice_previews' => (int) config('beat.limits.voice_previews', 3),
                'music_changes' => (int) config('beat.limits.music_changes', 3),
            ],
        ]);
    }

    public function generateScript(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        if ($subscription->analysis_action === BusinessAnalysisService::ACTION_ASK_FOLLOW_UP) {
            return $this->returnError('Please answer follow-up questions before generating scripts', [
                'next_action' => $subscription->analysis_action,
            ], 400);
        }

        if ($subscription->analysis_action === BusinessAnalysisService::ACTION_MANUAL_CATEGORY_REVIEW
            && $subscription->status === SubscriptionStatusService::MANUAL_REVIEW_REQUESTED
            && empty($subscription->script_template_key)) {
            return $this->returnError('This order needs manual category review before scripts can be generated', [
                'status' => $subscription->status,
            ], 400);
        }

        // Recover soft-blocked orders that already have a resolved template
        if ($subscription->status === SubscriptionStatusService::MANUAL_REVIEW_REQUESTED
            && ! empty($subscription->script_template_key)) {
            $subscription->analysis_action = BusinessAnalysisService::ACTION_GENERATE_WITH_ADMIN_REVIEW;
            $subscription->requires_admin_script_review = true;
            $subscription->status = SubscriptionStatusService::DRAFT;
            $subscription->save();
        }

        if (! BeatScriptService::canGenerate($subscription)) {
            return $this->returnError('Script generation is not allowed', [
                'status' => $subscription->status,
                'script_generation_count' => $subscription->script_generation_count,
            ], 400);
        }

        try {
            $scriptVersion = BeatScriptService::generate($subscription, null);
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Script generated', [
            'subscription' => $subscription->refresh(),
            'script_version' => $scriptVersion,
            'variants' => $scriptVersion->structured_payload['versions'] ?? [],
            'requires_admin_review' => (bool) $subscription->requires_admin_script_review,
        ]);
    }

    public function selectScriptVariant(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'variant' => 'required|string|max:64',
            'plain_text' => 'nullable|string|max:2000',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        try {
            $subscription = BeatScriptService::selectVariant(
                $subscription,
                $request->input('variant'),
                $request->input('plain_text')
            );
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 400);
        }

        return $this->returnResponse('Script variant selected', [
            'subscription' => $subscription,
            'next_step' => 'preview',
        ]);
    }

    public function approveScript(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'plain_text' => 'nullable|string|max:2000',
            'variant' => 'nullable|string|max:64',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $editableStatuses = [
            SubscriptionStatusService::SCRIPT_READY,
            SubscriptionStatusService::PREVIEW_READY,
            // Back-navigation before payment
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::AWAITING_PAYMENT,
        ];
        if (! in_array($subscription->status, $editableStatuses, true)) {
            return $this->returnError('Script can only be approved when it is ready', [
                'status' => $subscription->status,
            ], 400);
        }

        if ($request->filled('variant')) {
            try {
                $subscription = BeatScriptService::selectVariant(
                    $subscription,
                    $request->input('variant'),
                    $request->input('plain_text')
                );
            } catch (\Exception $e) {
                return $this->returnError($e->getMessage(), [], 400);
            }
        } else {
            $plainText = $request->input('plain_text');
            if (is_string($plainText) && trim($plainText) !== '') {
                $subscription->voice_script = trim($plainText);
                $subscription->save();
            }
        }

        if ($subscription->status === SubscriptionStatusService::SCRIPT_READY) {
            return $this->returnResponse('Script approved', [
                'subscription' => $subscription->refresh(),
                'next_step' => 'preview',
            ]);
        }

        return $this->returnResponse('Script updated', [
            'subscription' => $subscription->refresh(),
            'next_step' => 'preview',
        ]);
    }

    public function listVoices(): JsonResponse
    {
        $voices = BeatAudioService::listVoices();
        if ($voices === []) {
            $voices = TtsVoiceProfile::query()
                ->where('is_active', true)
                ->orderByDesc('is_default')
                ->get()
                ->map(static function (TtsVoiceProfile $profile): array {
                    $id = (string) $profile->slug;

                    return [
                        'id' => $id,
                        'slug' => $id,
                        'label' => $profile->label,
                        'gender' => $profile->gender,
                        'provider' => $profile->provider,
                        'language' => $profile->language,
                        'style' => $profile->style,
                        'sample_url' => url('/api/v1/tunes/customer/tts/voices/' . rawurlencode($id) . '/sample'),
                    ];
                })
                ->all();
        }

        return $this->returnResponse('TTS voices', ['voices' => $voices]);
    }

    public function previewVoiceSample(string $voiceId)
    {
        return BeatAudioService::streamVoiceSample($voiceId);
    }

    public function listMusicTracks(): JsonResponse
    {
        return $this->returnResponse('Music tracks', [
            'tracks' => BeatAudioService::listMusicTracks(),
        ]);
    }

    public function previewMusicTrack(string $trackId)
    {
        return BeatAudioService::streamMusicPreview($trackId);
    }

    public function generatePreview(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'voice_id' => 'nullable|string',
            'music_track_id' => 'nullable|string',
            'speaking_speed' => 'nullable|in:slow,normal,fast',
            'music_intensity' => 'nullable|in:soft,medium,strong,none',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $voiceId = $request->input('voice_id')
            ?: $subscription->preferred_voice_profile
            ?: self::voiceIdForType($subscription->voice_type);
        $musicTrackId = $request->input('music_track_id', $subscription->preferred_music_track_id ?: 'warm_pad');

        try {
            $asset = BeatAudioService::generatePreview(
                $subscription,
                $voiceId,
                null,
                $musicTrackId,
                $request->input('speaking_speed'),
                $request->input('music_intensity')
            );
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        $subscription = $subscription->refresh();
        $asset->setAttribute(
            'play_url',
            BeatAudioService::signedPlayUrl($asset, $subscription->subscription_reference)
        );

        return $this->returnResponse('Preview generated', [
            'subscription' => $subscription,
            'audio_asset' => $asset,
        ]);
    }

    public function generatePronunciationTest(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'voice_id' => 'nullable|string',
            'phrase' => 'nullable|string|max:255',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $voiceId = $request->input('voice_id')
            ?: $subscription->preferred_voice_profile
            ?: self::voiceIdForType($subscription->voice_type);

        try {
            $asset = BeatAudioService::generatePronunciationTest(
                $subscription,
                $voiceId,
                $request->input('phrase'),
                null
            );
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 400);
        }

        $subscription = $subscription->refresh();
        $asset->setAttribute(
            'play_url',
            BeatAudioService::signedPlayUrl($asset, $subscription->subscription_reference)
        );

        return $this->returnResponse('Pronunciation test ready', [
            'subscription' => $subscription,
            'audio_asset' => $asset,
        ]);
    }

    public function updatePronunciation(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'original_text' => 'required|string|max:255',
            'replacement_text' => 'required|string|max:255',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $entry = \App\Models\PronunciationEntry::query()->updateOrCreate(
            [
                'subscription_id' => $subscription->id,
                'original_text' => trim($request->input('original_text')),
                'scope' => 'subscription',
            ],
            [
                'replacement_text' => trim($request->input('replacement_text')),
                'language' => 'sw',
                'is_active' => true,
            ]
        );

        return $this->returnResponse('Pronunciation updated', [
            'entry' => $entry,
            'subscription' => $subscription->refresh(),
        ]);
    }

    public function approvePreview(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        // Idempotent: re-approving after back-navigation is a no-op
        if (in_array($subscription->status, [
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::AWAITING_PAYMENT,
        ], true)) {
            if ($subscription->status === SubscriptionStatusService::CUSTOMER_APPROVED) {
                SubscriptionStatusService::transition(
                    $subscription,
                    SubscriptionStatusService::AWAITING_PAYMENT,
                    null,
                    'Ready for payment'
                );
            }

            return $this->returnResponse('Preview approved', [
                'subscription' => $subscription->refresh(),
                'next_step' => 'payment',
            ]);
        }

        if ($subscription->status !== SubscriptionStatusService::PREVIEW_READY) {
            return $this->returnError('Preview must be ready before approval', [
                'status' => $subscription->status,
            ], 400);
        }

        try {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::CUSTOMER_APPROVED,
                null,
                'Customer approved voice preview'
            );
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::AWAITING_PAYMENT,
                null,
                'Ready for payment'
            );
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 400);
        }

        return $this->returnResponse('Preview approved', [
            'subscription' => $subscription->refresh(),
            'next_step' => 'payment',
        ]);
    }

    /**
     * BizTune checkout (steps 6 & 7): after the audio is approved the customer
     * picks a package and the phone numbers to activate. Amount is computed here.
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'subscription_package' => 'required',
            'subscription_phones' => 'required|array|min:1',
            'subscription_phones.*' => 'string|max:32',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        if (! in_array($subscription->status, [
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::AWAITING_PAYMENT,
            SubscriptionStatusService::PAYMENT_PENDING,
        ], true)) {
            return $this->returnError('Checkout is available after the audio is approved', [
                'status' => $subscription->status,
            ], 400);
        }

        $packageNumber = $request->input('subscription_package');
        $packageConfiguration = TuneSubscriptionPackage::query()->where(['package' => $packageNumber])->first();
        if (! $packageConfiguration) {
            return $this->returnError("Package {$packageNumber} does not exist", [], 400);
        }

        $subscription = TunesSubscriptionService::applyPackageAndPhones(
            $subscription,
            $packageConfiguration,
            $request->input('subscription_phones')
        );

        return $this->returnResponse('Checkout saved', [
            'subscription' => $subscription->load('phones'),
            'next_step' => 'payment',
        ]);
    }

    public function initiatePayment(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'payment_phone' => 'required|string|max:32',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        if (! in_array($subscription->status, [
            SubscriptionStatusService::AWAITING_PAYMENT,
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::PAYMENT_PENDING,
        ], true)) {
            return $this->returnError('Payment cannot be started in the current status', [
                'status' => $subscription->status,
            ], 400);
        }

        if (! $subscription->subscription_package_id || ! ($subscription->amount > 0)) {
            return $this->returnError('Chagua kifurushi na namba za kuwekewa tune kwanza', [
                'status' => $subscription->status,
            ], 400);
        }

        if ($subscription->status === SubscriptionStatusService::CUSTOMER_APPROVED) {
            SubscriptionStatusService::transition(
                $subscription,
                SubscriptionStatusService::AWAITING_PAYMENT,
                null,
                'Moving to payment'
            );
        }

        $subscription->payment_phone = NotificationServiceService::formatPhoneNumberTZ(
            $request->input('payment_phone')
        );
        $subscription->save();

        if (! TunesSubscriptionService::initCharge($subscription)) {
            return $this->returnError(
                'Payment request could not be sent. Please check your payment phone and try again.',
                ['subscription' => $subscription->refresh()],
                502
            );
        }

        $transaction = SelcomTransaction::query()
            ->where('order_id', $subscription->subscription_reference)
            ->latest()
            ->first();

        return $this->returnResponse('Payment initiated', [
            'subscription' => $subscription->refresh(),
            'transaction' => $transaction,
            'next_step' => 'status',
        ]);
    }

    public function streamAudio(Request $request, $assetId): BinaryFileResponse|JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        /** @var AudioAsset|null $asset */
        $asset = AudioAsset::query()->find($assetId);
        if ($asset === null || (int) $asset->subscription_id !== (int) $subscription->id) {
            return $this->returnError('Audio asset not found', [], 404);
        }

        if ($asset->expires_at && $asset->expires_at->isPast()) {
            return $this->returnError('Audio URL has expired', [], 410);
        }

        if (! Storage::disk('local')->exists($asset->file_path)) {
            return $this->returnError('Audio file is missing', [], 404);
        }

        $mime = $asset->format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
        $absolutePath = Storage::disk('local')->path($asset->file_path);

        return response()->file($absolutePath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, max-age=300',
            'Accept-Ranges' => 'bytes',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    protected static function voiceIdForType(?string $voiceType): string
    {
        if (strtoupper((string) $voiceType) === 'FEMALE') {
            $preferred = ['rehema-friendly', 'rehema-professional', 'rehema-energetic', 'mms-swh-default'];
        } elseif (strtoupper((string) $voiceType) === 'MALE') {
            $preferred = ['daudi-professional', 'daudi-calm', 'daudi-energetic', 'mms-swh-default'];
        } else {
            $preferred = [
                (string) config('beat.tts.default_voice_id', 'daudi-professional'),
                'daudi-professional',
                'rehema-friendly',
            ];
        }

        foreach ($preferred as $slug) {
            $profile = TtsVoiceProfile::query()
                ->where('slug', $slug)
                ->where('is_active', true)
                ->first();
            if ($profile) {
                return $profile->slug;
            }
        }

        return $preferred[0];
    }

    protected static function wizardStepForStatus(?string $status): string
    {
        return match ($status) {
            SubscriptionStatusService::DRAFT,
            SubscriptionStatusService::SCRIPT_GENERATING,
            SubscriptionStatusService::SCRIPT_READY => 'script',
            SubscriptionStatusService::PREVIEW_GENERATING,
            SubscriptionStatusService::PREVIEW_READY => 'preview',
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::AWAITING_PAYMENT => 'checkout',
            SubscriptionStatusService::PAYMENT_PENDING,
            SubscriptionStatusService::PAID,
            SubscriptionStatusService::ACTIVE,
            SubscriptionStatusService::INSTALLED => 'status',
            SubscriptionStatusService::MANUAL_REVIEW_REQUESTED => 'script',
            default => 'business',
        };
    }

}
