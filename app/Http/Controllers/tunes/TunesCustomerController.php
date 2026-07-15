<?php

namespace App\Http\Controllers\tunes;

use App\Http\Controllers\BaseController;

use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Models\TuneSubscriptionPackage;
use App\Services\TunesSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TunesCustomerController extends BaseController
{

    public function __construct()
    {

    }



    public function getPackages(Request $request): JsonResponse
    {

        $packageConfigurations = TuneSubscriptionPackage::get();
        $responseData['packages'] = $packageConfigurations;
        return $this->returnResponse('Packages', $responseData);
    }

    public function addSubscription(Request $request): JsonResponse
    {

        Log::info("customer subscription request: ".json_encode($request->all()));

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

        # Load package
        $packageConfiguration = TuneSubscriptionPackage::where([
            'package' => $packageNumber
        ])->first();
        if (!$packageConfiguration) {
            return $this->returnError("Package {$packageNumber} does not exist", [], 400);
        }

        $unpaidSubscription = TunesSubscriptionService::addPendingSubscription($request, $packageConfiguration,null);
        if (! TunesSubscriptionService::initCharge($unpaidSubscription)) {
            return $this->returnError(
                'Payment request could not be sent. Please check your payment phone and try again.',
                ['subscription' => $unpaidSubscription],
                502
            );
        }

        $responseData['subscription'] = $unpaidSubscription->refresh();
        return $this->returnResponse('Pending subscription created', $responseData);
    }

    public function retryPayment(Request $request): JsonResponse
    {

        Log::info("customer payment retry: ".json_encode($request->all()));
        $request->validate([
            'reference' => 'required'
        ]);

        $reference =  $request->input('reference');


        # Load package
        $unpaidSubscription = TuneSubscription::where([
            'subscription_reference' =>$reference
        ])->first();
        if (!$unpaidSubscription) {
            return $this->returnError("Subscription with reference {$reference} does not exist", [], 400);
        }

        if (! TunesSubscriptionService::initCharge($unpaidSubscription)) {
            return $this->returnError(
                'Payment request could not be sent. Please check your payment phone and try again.',
                ['subscription' => $unpaidSubscription],
                502
            );
        }

        $responseData['subscription'] = $unpaidSubscription->refresh();
        return $this->returnResponse('Pending subscription created', $responseData);
    }

    public function getSubscription(Request $request): JsonResponse
    {

        Log::info("customer payment retry: ".json_encode($request->all()));
        $request->validate([
            'reference' => 'required'
        ]);
        $reference =  $request->input('reference');

        # Load package
        $unpaidSubscription = TuneSubscription::where([
            'subscription_reference' =>$reference
        ])->first();
        if (!$unpaidSubscription) {
            return $this->returnError("Subscription with reference {$reference} does not exist", [], 400);
        }

        # Load package
        $selcomTransaction = SelcomTransaction::where([
            'order_id' =>$reference
        ])->first();
        if (!$selcomTransaction) {
            return $this->returnError("No pending payment detected", [], 400);
        }

        $responseData['subscription'] = $unpaidSubscription;
        $responseData['transaction'] = $selcomTransaction;
        return $this->returnResponse('Subscription details', $responseData);
    }



}




























