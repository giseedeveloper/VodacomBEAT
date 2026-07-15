<?php

namespace App\Http\Controllers\tunes;

use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\BaseController;
use App\Models\TuneSubscription;
use App\Services\SubscriptionStatusService;
use App\Services\TunesSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TunesInstallationController extends BaseController
{

    protected const INSTALLABLE_STATUSES = [
        SubscriptionStatusService::PAID,
        SubscriptionStatusService::READY_FOR_INSTALLATION,
        SubscriptionStatusService::EXPORTED,
        SubscriptionStatusService::INSTALLATION_IN_PROGRESS,
    ];

    public function getSubscriptions(Request $request): JsonResponse
    {

        $perPage = $request->input('perPage');
        $subscriptionsQuery = TuneSubscription::query();

        $appliedFilter = "All Subscriptions";

        # filter by status
        $status = $request->input('status');
        if (is_string($status)) {
            $subscriptionsQuery->where('status', $status);
            $appliedFilter = "Subscriptions by status: {$status}";
        }

        # search by phone / business name
        $phone = $request->input('phone');
        if (is_string($phone)) {
            $subscriptionsQuery->where(function ($query) use ($phone) {
                $query->where('contact_phone', 'like', "%$phone%")
                    ->orWhere('business_name', 'like', "%$phone%");
            });
            $appliedFilter = "Subscriptions by search: {$phone}";
        }

        $responseData['subscriptions'] = $subscriptionsQuery->latest()->paginate($perPage);
        return $this->returnResponse($appliedFilter, $responseData);
    }

    public function markInstalled(Request $request, $id): JsonResponse
    {

        /** @var TuneSubscription | null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription == null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        if (! in_array($subscription->status, self::INSTALLABLE_STATUSES, true)) {
            return $this->returnError(
                "Subscription {$id} cannot be marked as installed from status {$subscription->status}",
                ['status' => $subscription->status],
                400
            );
        }

        try {
            $installedSubscription = TunesSubscriptionService::markInstalled($subscription, Auth::id());
        } catch (InvalidStatusTransitionException $e) {
            Log::error("invalid transition while installing subscription {$id}: " . $e->getMessage());
            return $this->returnError($e->getMessage(), [], 400);
        }

        if ($installedSubscription == null) {
            return $this->returnError("Failed to install subscription {$id} - package could not be determined", [], 400);
        }

        $responseData['subscription'] = $installedSubscription->refresh();
        return $this->returnResponse('Subscription installed and activated', $responseData);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {

        $request->validate([
            'status' => ['required', 'string', Rule::in(SubscriptionStatusService::ALL_STATUSES)],
            'remark' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var TuneSubscription | null $subscription */
        $subscription = TuneSubscription::query()->find($id);
        if ($subscription == null) {
            return $this->returnError("Subscription {$id} does not exist", [], 404);
        }

        try {
            SubscriptionStatusService::transition(
                $subscription,
                $request->input('status'),
                Auth::id(),
                $request->input('remark')
            );
        } catch (InvalidStatusTransitionException $e) {
            Log::error("invalid status transition requested for subscription {$id}: " . $e->getMessage());
            return $this->returnError($e->getMessage(), [], 400);
        }

        $responseData['subscription'] = $subscription->refresh();
        return $this->returnResponse('Subscription status updated', $responseData);
    }

}
