<?php

namespace App\Services;


use App\Integrations\SelcomTransactionsService;
use App\Models\Customer;
use App\Models\LedgerTransaction;
use App\Models\ReferralAgent;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Models\TuneSubscriptionPackage;
use App\Models\TuneSubscriptionPhone;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TunesSubscriptionService
{


    public function __construct()
    {

    }

    public static function getAgent(): ?ReferralAgent
    {
        /** @var ReferralAgent | null $agent */
        $agent = ReferralAgent::query()->where(
            ['user_id' => Auth::id()]
        )->first();

        return $agent;
    }

    public static function addPendingSubscription(Request $request, TuneSubscriptionPackage $packageConfiguration, $agent): ?TuneSubscription
    {

        $contactPersonName = $request->input('contact_person_name');
        $businessName = $request->input('business_name');
        $contactPhone = NotificationServiceService::formatPhoneNumberTZ($request->input('contact_phone'));
        $paymentPhone = NotificationServiceService::formatPhoneNumberTZ($request->input('payment_phone'));
        $voiceType = $request->input('voice_type');
        $voiceScript = $request->input('voice_script');

        $phones = $request->input('subscription_phones');


        # Get customer
        $customer = Customer::query()->firstOrCreate([
            'phone_number' => $contactPhone
        ], [
            'phone_number' => $contactPhone,
            'full_name' => $contactPersonName,
            'business_name' => $businessName
        ]);

        Log::info("Creating a transaction for $contactPhone, package: " . json_encode($packageConfiguration));

        $totalCost = ($packageConfiguration->price) * count($phones);

        # Create pending subscription
        /** @var TuneSubscription | null $tuneSubscription */
        $tuneSubscription = TuneSubscription::query()->create([
            'customer_id' => $customer->id,
            'agent_id' => $agent?->id,
            'transaction_id' => null,
            'contact_phone' => $contactPhone,
            'contact_person_name' => $contactPersonName,
            'business_name' => $businessName,

            'payment_phone' => $paymentPhone,
            'voice_type' => $voiceType,
            'voice_script' => $voiceScript,

            'subscription_package' => $packageConfiguration->package,
            'subscription_package_id' => $packageConfiguration->id,
            'amount' => $totalCost,

            'commission_amount' => $packageConfiguration->price * 0.10,

            'starts_at' => null,
            'ends_at' => null,
            'paid_at' => null
        ]);

        //Add reference
        $tuneSubscription->subscription_reference = self::generateReference($customer->id, $tuneSubscription->id);
        $tuneSubscription->save();

        foreach ($phones as $phone) {
            TuneSubscriptionPhone::query()->create([
                'subscription_id' => $tuneSubscription->id,
                'customer_id' => $customer->id,
                'phone_number' => $phone
            ]);
        }

        return $tuneSubscription;
    }

    public static function initCharge(TuneSubscription $unpaidSubscription)
    {
        Log::info("initiating charge request for subscription " . json_encode($unpaidSubscription));

        $selcomTransactionService = new  SelcomTransactionsService();
        $pendingSelcomTransaction = $selcomTransactionService->createLocalSelcomTransaction($unpaidSubscription);

        // 1 - push order to selcom
        $orderSubmissionResults = $selcomTransactionService->submitTransactionToSelcom($pendingSelcomTransaction);
        $pendingSelcomTransaction->selcom_uuid = $orderSubmissionResults->gatewayBuyerUuid;
        $pendingSelcomTransaction->selcom_token = $orderSubmissionResults->paymentToken;
        $pendingSelcomTransaction->qr = $orderSubmissionResults->qr;
        $pendingSelcomTransaction->payment_url = $orderSubmissionResults->paymentGatewayUrlPlain;
        $pendingSelcomTransaction->save();

        // 2 - push order
        $selcomTransactionService->initiatePushUssd($pendingSelcomTransaction);
    }

    public static function onPaymentComplete(SelcomTransaction $selcomTransaction)
    {
        /** @var  $unpaidSubscription TuneSubscription | null */
        $unpaidSubscription = TuneSubscription::query()->where('subscription_reference', $selcomTransaction->order_id)->first();
        if ($unpaidSubscription == null) {
            Log::error("failed to determine subscription associated with selcom transaction: " . json_encode($selcomTransaction));
            return null;
        }

        $paidAmount = $selcomTransaction->amount;
        $requiredAmount = $unpaidSubscription->amount;
        if (($paidAmount) >= ($requiredAmount)) {
            self::activateSubscription($unpaidSubscription, $selcomTransaction->id);
            return $unpaidSubscription;
        } else {
            Log::error("Amount paid $paidAmount TZS is less that required amount $requiredAmount TZS" . json_encode($unpaidSubscription));
            return null;
        }
    }

    public static function activateSubscription(TuneSubscription $subscription, $transactionId)
    {
        /** @var  TuneSubscriptionPackage | null $package */
        $package = TuneSubscriptionPackage::query()->find($subscription->subscription_package_id);
        if ($package == null) {
            Log::error("failed to determine subscription package " . json_encode($subscription));
            return;
        }

        $subscription->starts_at = Carbon::now();
        $subscription->ends_at = Carbon::now()->addMonths($package->package);
        $subscription->paid_at = Carbon::now();
        $subscription->transaction_id = $transactionId;
        $subscription->save();

        Log::info("activated subscription " . json_encode($subscription));
    }


    public static function generateReference($customerId, $subscriptionId)
    {
        return "M"
            . str_pad($customerId, 3, "0", STR_PAD_LEFT)
            . "C"
            . str_pad($subscriptionId, 3, "0", STR_PAD_LEFT);
    }

}


