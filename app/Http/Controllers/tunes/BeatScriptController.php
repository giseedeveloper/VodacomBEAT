<?php

namespace App\Http\Controllers\tunes;

use App\Http\Controllers\BaseController;
use App\Jobs\GenerateSubscriptionScriptJob;
use App\Models\ScriptVersion;
use App\Models\TuneSubscription;
use App\Services\BeatScriptService;
use App\Services\SubscriptionStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BeatScriptController extends BaseController
{

    public function generateScript(Request $request, $id): JsonResponse
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription === null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        if (! BeatScriptService::canGenerate($subscription)) {
            return $this->returnError(
                'Script generation is not allowed for this subscription',
                [
                    'status' => $subscription->status,
                    'script_generation_count' => $subscription->script_generation_count,
                ],
                400
            );
        }

        $async = filter_var($request->input('async', true), FILTER_VALIDATE_BOOLEAN);
        if ($async) {
            GenerateSubscriptionScriptJob::dispatch((int) $subscription->id, Auth::id());
            return $this->returnResponse('Script generation queued', [
                'subscription_id' => $subscription->id,
                'status' => SubscriptionStatusService::SCRIPT_GENERATING,
            ]);
        }

        try {
            $scriptVersion = BeatScriptService::generate($subscription, Auth::id());
        } catch (\Exception $e) {
            return $this->returnError($e->getMessage(), [], 502);
        }

        return $this->returnResponse('Script generated', [
            'subscription' => $subscription->refresh(),
            'script_version' => $scriptVersion,
        ]);
    }

    public function listScriptVersions($id): JsonResponse
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription === null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        $versions = ScriptVersion::query()
            ->where('subscription_id', $subscription->id)
            ->orderByDesc('version_number')
            ->get();

        return $this->returnResponse('Script versions', [
            'subscription_id' => $subscription->id,
            'versions' => $versions,
        ]);
    }

}
