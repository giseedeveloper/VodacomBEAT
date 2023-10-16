<?php

namespace App\Http\Controllers\tunes;

use App\Http\Controllers\BaseController;
use App\Models\ReferralAgent;
use App\Models\TuneSubscription;
use App\Models\TuneSubscriptionPackage;
use App\Services\TunesSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TunesAgentController extends BaseController
{

    public function __construct()
    {

    }


    public function getStats()
    {

        $agent = TunesSubscriptionService::getAgent();
        if (!$agent) {
            return $this->returnError("You are not an agent", [], 412);
        }

        # Customers
        $customersSubscriptionsCount = TuneSubscription::query()->where([
            'agent_id' => $agent->id
        ])->count();

        # Commissions
        $entitledCommission = TuneSubscription::query()->where([
            'agent_id' => $agent->id
        ])->sum('commission_amount');

        $responseData['customersCount'] = $customersSubscriptionsCount;
        $responseData['entitledCommission'] = $entitledCommission;
        $responseData['dayCommissions'] = $entitledCommission;
        $responseData['monthCommissions'] = $entitledCommission;
        return $this->returnResponse("Stats", $responseData);
    }

    public function addSubscription(Request $request): JsonResponse
    {

        $request->validate([
            'contact_person_name' => 'required',
            'business_name' => 'required',
            'contact_phone' => 'required',
            'payment_phone' => 'required',
            'subscription_package' => 'required',
            'voice_type' => 'required',
            'voice_script' => 'required',
            'subscription_phones' => 'required|array',
        ]);

        $packageNumber = $request->input('subscription_package');

        # Load agent
        $agent = TunesSubscriptionService::getAgent();
        if (!$agent) {
            Log::error("attempted to add subscription by non-agent ".json_encode(Auth::user()));
            return $this->returnError("You are not an agent", [], 400);
        }

        # Load package
        $packageConfiguration = TuneSubscriptionPackage::where([
            'package' => $packageNumber
        ])->first();
        if (!$packageConfiguration) {
            return $this->returnError("Package {$packageNumber} does not exist", [], 400);
        }

        $unpaidSubscription = TunesSubscriptionService::addPendingSubscription($request, $packageConfiguration, $agent);

        TunesSubscriptionService::initCharge($unpaidSubscription);

        $responseData['subscription'] = $unpaidSubscription;
        return $this->returnResponse('Pending subscription created', $responseData);

    }


    public function retryPushInitiation(Request $request): JsonResponse
    {

        Log::info("retry customer push payment: ".json_encode($request->all()));
        $request->validate([
            'subscription_id' => 'required'
        ]);

        /** @var TuneSubscription | null  $unpaidSubscription */
        $unpaidSubscription = TuneSubscription::query()->find($request->input('subscription_id'));
        if($unpaidSubscription==null){
            Log::info("subscription is invalid".json_encode($request->all()));
            return $this->returnError('Subscription is invalid', [],400);
        }

        if($unpaidSubscription->starts_at != null){
            Log::info("subscription already paid".json_encode($request->all()));
            return $this->returnError('Subscription already paid', [],400);
        }

        TunesSubscriptionService::initCharge($unpaidSubscription);

        $responseData['subscription'] = $unpaidSubscription;
        return $this->returnResponse('Charge request resent', $responseData);
    }


    public function getSubscriptions(Request $request): JsonResponse
    {

        $agent = ReferralAgent::query()->where(
            ['user_id' => Auth::id()]
        )->first();
        if (!$agent) {
            return $this->returnError("You are not an agent", [], 412);
        }

        $agentSubscriptions = TuneSubscription::query()
            ->where('agent_id', $agent->id)
            ->latest()
            ->paginate();

        $responseData['subscriptions'] = $agentSubscriptions;
        return $this->returnResponse('Agent subscriptinos', $responseData);
    }


}




























