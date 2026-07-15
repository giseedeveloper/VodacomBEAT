<?php

namespace App\Http\Controllers\tunes;

use App\Http\Controllers\BaseController;
use App\Jobs\GenerateAudioPreviewJob;
use App\Jobs\GenerateFinalAudioJob;
use App\Models\AudioAsset;
use App\Models\TuneSubscription;
use App\Models\TtsVoiceProfile;
use App\Services\BeatAudioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BeatAudioController extends BaseController
{

    public function listVoices(): JsonResponse
    {
        $dbVoices = TtsVoiceProfile::query()
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->get();

        if ($dbVoices->isNotEmpty()) {
            return $this->returnResponse('TTS voices', ['voices' => $dbVoices]);
        }

        return $this->returnResponse('TTS voices', ['voices' => BeatAudioService::listVoices()]);
    }

    public function generatePreview(Request $request, $id): JsonResponse
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription === null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        if (! BeatAudioService::canGeneratePreview($subscription)) {
            return $this->returnError(
                'Preview generation is not allowed for this subscription',
                [
                    'status' => $subscription->status,
                    'voice_preview_count' => $subscription->voice_preview_count,
                ],
                400
            );
        }

        $voiceId = $request->input('voice_id');
        $async = filter_var($request->input('async', true), FILTER_VALIDATE_BOOLEAN);

        if ($async) {
            GenerateAudioPreviewJob::dispatch((int) $subscription->id, $voiceId, Auth::id());
            return $this->returnResponse('Preview generation queued', [
                'subscription_id' => $subscription->id,
            ]);
        }

        try {
            $asset = BeatAudioService::generatePreview($subscription, $voiceId, Auth::id());
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Preview generated', [
            'subscription' => $subscription->refresh(),
            'audio_asset' => $asset,
        ]);
    }

    public function generateFinal(Request $request, $id): JsonResponse
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription === null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        if (! BeatAudioService::canGenerateFinal($subscription)) {
            return $this->returnError(
                'Final audio generation requires a paid subscription in an allowed status',
                ['status' => $subscription->status],
                400
            );
        }

        $voiceId = $request->input('voice_id');
        $async = filter_var($request->input('async', true), FILTER_VALIDATE_BOOLEAN);

        if ($async) {
            GenerateFinalAudioJob::dispatch((int) $subscription->id, $voiceId, Auth::id());
            return $this->returnResponse('Final audio generation queued', [
                'subscription_id' => $subscription->id,
            ]);
        }

        try {
            $asset = BeatAudioService::generateFinal($subscription, $voiceId, Auth::id());
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Final audio generated', [
            'subscription' => $subscription->refresh(),
            'audio_asset' => $asset,
        ]);
    }

    public function listAssets($id): JsonResponse
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription === null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        $assets = AudioAsset::query()
            ->where('subscription_id', $subscription->id)
            ->latest()
            ->get();

        return $this->returnResponse('Audio assets', [
            'subscription_id' => $subscription->id,
            'assets' => $assets,
        ]);
    }

    public function downloadAsset($assetId): StreamedResponse|JsonResponse
    {
        /** @var AudioAsset|null $asset */
        $asset = AudioAsset::query()->find($assetId);
        if ($asset === null) {
            return $this->returnError("Audio asset {$assetId} does not exist", [], 404);
        }

        if (! Storage::disk('local')->exists($asset->file_path)) {
            return $this->returnError('Audio file is missing on disk', [], 404);
        }

        $mime = $asset->format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
        $filename = basename($asset->file_path);

        return Storage::disk('local')->download($asset->file_path, $filename, [
            'Content-Type' => $mime,
        ]);
    }

}
