<?php

namespace App\Services;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Models\Customer;
use App\Models\ReferralAgent;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Models\TuneSubscriptionPackage;
use App\Models\TuneSubscriptionPhone;
use App\Services\payment\AgentsCommissionService;
use Carbon\Carbon;
use Exception;
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

    public static function addPendingSubscription(
        Request $request,
        TuneSubscriptionPackage $packageConfiguration,
        ?ReferralAgent $agent,
        string $initialStatus = SubscriptionStatusService::AWAITING_PAYMENT
    ): ?TuneSubscription
    {

        $contactPersonName = $request->input('contact_person_name');
        $businessName = $request->input('business_name');
        $contactPhone = NotificationServiceService::formatPhoneNumberTZ($request->input('contact_phone'));
        $rawPaymentPhone = $request->input('payment_phone');
        $paymentPhone = $rawPaymentPhone
            ? NotificationServiceService::formatPhoneNumberTZ($rawPaymentPhone)
            : null;
        $voiceType = $request->input('voice_type') ?: 'FEMALE';
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

        /// Determine commission percentage
        if($agent!=null && is_numeric($agent->commission_percentage)){
            $commissionPercentage = $agent->commission_percentage;
        }else{
            $commissionPercentage = $packageConfiguration->commission_percentage;
        }

        $singleSubscriberCommission = round($packageConfiguration->price * ($commissionPercentage/100));
        $agentCommission = $singleSubscriberCommission * count($phones);


        # Create pending subscription
        /** @var TuneSubscription | null $tuneSubscription */
        $tuneSubscription = TuneSubscription::query()->create([
            'customer_id' => $customer->id,
            'agent_id' => $agent?->id,
            'transaction_id' => null,
            'contact_phone' => $contactPhone,
            'contact_person_name' => $contactPersonName,
            'business_name' => $businessName,
            'business_location' => $request->input('business_location'),
            'landmark' => $request->input('landmark'),
            'business_industry' => $request->input('business_industry'),
            'business_description' => $request->input('business_description'),
            'products_or_services' => self::normalizeStringList($request->input('products_or_services')),
            'secondary_products' => self::normalizeStringList($request->input('secondary_products')),
            'target_audience' => $request->input('target_audience'),
            'call_to_action' => $request->input('call_to_action'),
            'selling_points' => self::normalizeStringList($request->input('selling_points')),
            'preferred_tone' => $request->input('preferred_tone'),
            'must_include_words' => self::normalizeStringList($request->input('must_include_words')),
            'must_exclude_words' => self::normalizeStringList($request->input('must_exclude_words')),
            'offer_text' => $request->input('offer_text'),

            'payment_phone' => $paymentPhone,
            'voice_type' => $voiceType,
            'voice_script' => $voiceScript,

            'subscription_package' => $packageConfiguration->package,
            'subscription_package_id' => $packageConfiguration->id,
            'amount' => $totalCost,

            'commission_amount' => $agentCommission,

            'status' => $initialStatus,
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

    public static function findByReference(string $reference): ?TuneSubscription
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()
            ->where('subscription_reference', $reference)
            ->first();

        return $subscription;
    }

    /**
     * Initiate Selcom USSD push. Returns false when Selcom rejects the request
     * so callers can surface an error instead of a false success.
     */
    public static function initCharge(TuneSubscription $unpaidSubscription): bool
    {
        Log::info("initiating charge request for subscription " . json_encode($unpaidSubscription));

        $selcomTransactionService = new SelcomTransactionsService();
        $pendingSelcomTransaction = $selcomTransactionService->createLocalSelcomTransaction($unpaidSubscription);

        // 1 - push order to selcom
        $orderSubmissionResults = $selcomTransactionService->submitTransactionToSelcom($pendingSelcomTransaction);
        if (! $orderSubmissionResults->isSuccess) {
            Log::error("selcom order submission failed for subscription {$unpaidSubscription->id}: "
                . ($orderSubmissionResults->message ?: $orderSubmissionResults->extra));
            return false;
        }

        $pendingSelcomTransaction->selcom_uuid = $orderSubmissionResults->gatewayBuyerUuid ?? "";
        $pendingSelcomTransaction->selcom_token = $orderSubmissionResults->paymentToken ?? "";
        $pendingSelcomTransaction->qr = $orderSubmissionResults->qr ?? "";
        $pendingSelcomTransaction->payment_url = $orderSubmissionResults->paymentGatewayUrlPlain ?? "";
        $pendingSelcomTransaction->remark = $orderSubmissionResults->message ?? "";
        $pendingSelcomTransaction->save();

        // 2 - push USSD to customer phone
        $pushResults = $selcomTransactionService->initiatePushUssd($pendingSelcomTransaction);
        if (! $pushResults->isSuccess) {
            Log::error("selcom USSD push failed for subscription {$unpaidSubscription->id}: "
                . ($pushResults->message ?: $pushResults->extra));
            return false;
        }

        try {
            SubscriptionStatusService::transition(
                $unpaidSubscription,
                SubscriptionStatusService::PAYMENT_PENDING,
                null,
                'Selcom USSD push sent'
            );
        } catch (Exception $e) {
            Log::error("failed to transition subscription {$unpaidSubscription->id} to PAYMENT_PENDING: " . $e->getMessage());
        }

        return true;
    }

    public static function onPaymentComplete(SelcomTransaction $selcomTransaction): ?TuneSubscription
    {
        /** @var  $unpaidSubscription TuneSubscription | null */
        $unpaidSubscription = TuneSubscription::query()->where('subscription_reference', $selcomTransaction->order_id)->first();
        if ($unpaidSubscription == null) {
            Log::error("failed to determine subscription associated with selcom transaction: " . json_encode($selcomTransaction));
            return null;
        }

        // Idempotency: duplicate Selcom callbacks are normal and must be no-ops.
        if ($unpaidSubscription->paid_at !== null || SubscriptionStatusService::isPaidOrLater($unpaidSubscription->status)) {
            Log::warning("duplicate payment callback ignored - subscription {$unpaidSubscription->id} is already paid. "
                . "selcom transaction: " . json_encode($selcomTransaction));
            return $unpaidSubscription;
        }

        $paidAmount = $selcomTransaction->amount;
        $requiredAmount = $unpaidSubscription->amount;
        if (($paidAmount) < ($requiredAmount)) {
            Log::error("Amount paid $paidAmount TZS is less that required amount $requiredAmount TZS" . json_encode($unpaidSubscription));
            return $unpaidSubscription;
        }

        // Mark as paid. Service dates (starts_at/ends_at) and agent commission
        // are handled at installation time, not here.
        try {
            self::markPaid($unpaidSubscription, $selcomTransaction->id);
        } catch (Exception $e) {
            Log::error("Encountered an error while marking subscription as paid. selcomTransaction: ".json_encode($selcomTransaction));
            Log::error($e);
        }

        return $unpaidSubscription;
    }

    public static function markPaid(TuneSubscription $subscription, $transactionId): TuneSubscription
    {
        $subscription->paid_at = Carbon::now();
        $subscription->transaction_id = $transactionId;
        $subscription->save();

        try {
            SubscriptionStatusService::transition($subscription, SubscriptionStatusService::PAID, null, 'Selcom payment received');
        } catch (Exception $e) {
            Log::error("failed to transition subscription {$subscription->id} to PAID: " . $e->getMessage());
        }

        Log::info("subscription marked as paid " . json_encode($subscription));

        return $subscription;
    }

    /**
     * Called when ops confirm the beat is installed on Vodacom.
     * Sets the service period, transitions INSTALLED -> ACTIVE, then disburses
     * agent commission (guarded by commission_issued_at).
     */
    public static function markInstalled(TuneSubscription $subscription, ?int $installedBy = null): ?TuneSubscription
    {
        /** @var  TuneSubscriptionPackage | null $package */
        $package = TuneSubscriptionPackage::query()->find($subscription->subscription_package_id);
        if ($package == null) {
            Log::error("failed to determine subscription package " . json_encode($subscription));
            return null;
        }

        $subscription->installed_at = Carbon::now();
        $subscription->installed_by = $installedBy;
        $subscription->starts_at = Carbon::now();
        $subscription->ends_at = Carbon::now()->addMonths($package->package);
        $subscription->save();

        SubscriptionStatusService::transition($subscription, SubscriptionStatusService::INSTALLED, $installedBy, 'Beat installed on Vodacom');
        SubscriptionStatusService::transition($subscription, SubscriptionStatusService::ACTIVE, $installedBy, 'Service period started');

        Log::info("subscription installed and activated " . json_encode($subscription));

        // Disburse commission - only once, guarded by commission_issued_at.
        if ($subscription->commission_issued_at === null) {
            try {
                $isDisbursementSuccess = AgentsCommissionService::onCommissionDisbursement($subscription);
                if ($isDisbursementSuccess) {
                    $subscription->commission_issued_at = Carbon::now();
                    $subscription->commission_issued_by = $installedBy;
                    $subscription->save();
                }
            } catch (Exception $e) {
                Log::error("Encountered an error while disbursing commission. subscription: ".json_encode($subscription));
                Log::error($e);
            }
        } else {
            Log::warning("commission already issued for subscription {$subscription->id}, skipping disbursement");
        }

        return $subscription;
    }

    public static function generateReference($customerId, $subscriptionId)
    {
        return "M"
            . str_pad($customerId, 3, "0", STR_PAD_LEFT)
            . "C"
            . str_pad($subscriptionId, 3, "0", STR_PAD_LEFT)
            . "T"
            . dechex(time());
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>|null
     */
    public static function normalizeStringList(mixed $value): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_string($value)) {
            $parts = preg_split('/[,;\n]+/u', $value) ?: [];
            $value = $parts;
        }

        if (! is_array($value)) {
            return null;
        }

        $clean = [];
        foreach ($value as $item) {
            $item = trim((string) $item);
            if ($item !== '') {
                $clean[] = $item;
            }
        }

        return $clean ?: null;
    }

}


