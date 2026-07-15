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
        Log::info('customer draft subscription: ' . json_encode($request->all()));

        $request->validate([
            'contact_person_name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:32',
            'subscription_package' => 'required',
            'voice_type' => 'required|in:MALE,FEMALE',
            'subscription_phones' => 'required|array|min:1',
            'business_location' => 'nullable|string|max:255',
            'business_industry' => 'nullable|string|max:255',
            'call_to_action' => 'nullable|string|max:255',
            'voice_script' => 'nullable|string|max:2000',
        ]);

        $packageNumber = $request->input('subscription_package');
        $packageConfiguration = TuneSubscriptionPackage::query()->where(['package' => $packageNumber])->first();
        if (! $packageConfiguration) {
            return $this->returnError("Package {$packageNumber} does not exist", [], 400);
        }

        $subscription = TunesSubscriptionService::addPendingSubscription(
            $request,
            $packageConfiguration,
            null,
            SubscriptionStatusService::DRAFT
        );

        return $this->returnResponse('Draft subscription created', [
            'subscription' => $subscription->refresh(),
            'next_step' => 'script',
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
            ->get();

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
        ]);
    }

    public function generateScript(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
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
        ]);
    }

    public function approveScript(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'plain_text' => 'nullable|string|max:2000',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        if ($subscription->status !== SubscriptionStatusService::SCRIPT_READY
            && $subscription->status !== SubscriptionStatusService::PREVIEW_READY) {
            return $this->returnError('Script can only be approved when it is ready', [
                'status' => $subscription->status,
            ], 400);
        }

        $plainText = $request->input('plain_text');
        if (is_string($plainText) && trim($plainText) !== '') {
            $subscription->voice_script = trim($plainText);
            $subscription->save();
        }

        if ($subscription->status === SubscriptionStatusService::SCRIPT_READY) {
            // Stay on SCRIPT_READY — customer advances to voice preview in the UI.
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
        $voices = TtsVoiceProfile::query()
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->get();

        if ($voices->isEmpty()) {
            $voices = BeatAudioService::listVoices();
        }

        return $this->returnResponse('TTS voices', ['voices' => $voices]);
    }

    public function listMusicTracks(): JsonResponse
    {
        return $this->returnResponse('Music tracks', [
            'tracks' => BeatAudioService::listMusicTracks(),
        ]);
    }

    public function generatePreview(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
            'voice_id' => 'nullable|string',
            'music_track_id' => 'nullable|string',
        ]);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
        }

        $voiceId = $request->input('voice_id') ?: self::voiceIdForType($subscription->voice_type);
        $musicTrackId = $request->input('music_track_id', 'warm_pad');

        try {
            $asset = BeatAudioService::generatePreview($subscription, $voiceId, null, $musicTrackId);
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Preview generated', [
            'subscription' => $subscription->refresh(),
            'audio_asset' => $asset,
        ]);
    }

    public function approvePreview(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        $subscription = TunesSubscriptionService::findByReference($request->input('reference'));
        if ($subscription === null) {
            return $this->returnError('Subscription not found', [], 404);
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

    public function streamAudio(Request $request, $assetId): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
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
        // Prefer local gender voices for Mac fallback; MMS uses default when available.
        if (strtoupper((string) $voiceType) === 'FEMALE') {
            $preferred = ['biztune-female-v1', 'local-female', 'mms-swh-default'];
        } elseif (strtoupper((string) $voiceType) === 'MALE') {
            $preferred = ['biztune-male-v1', 'local-male', 'mms-swh-default'];
        } else {
            $preferred = ['mms-swh-default'];
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

        return $preferred[1] ?? (string) config('beat.tts.default_voice_id', 'local-female');
    }

    protected static function wizardStepForStatus(?string $status): string
    {
        return match ($status) {
            SubscriptionStatusService::DRAFT,
            SubscriptionStatusService::SCRIPT_GENERATING => 'script',
            SubscriptionStatusService::SCRIPT_READY,
            SubscriptionStatusService::PREVIEW_GENERATING,
            SubscriptionStatusService::PREVIEW_READY => 'preview',
            SubscriptionStatusService::CUSTOMER_APPROVED,
            SubscriptionStatusService::AWAITING_PAYMENT => 'payment',
            SubscriptionStatusService::PAYMENT_PENDING,
            SubscriptionStatusService::PAID,
            SubscriptionStatusService::ACTIVE,
            SubscriptionStatusService::INSTALLED => 'status',
            default => 'business',
        };
    }

}
