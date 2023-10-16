<?php

namespace App\Services;


use App\Models\Commission;
use App\Models\LedgerTransaction;
use App\Models\ReferralAgent;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class ReferralsService
{


    public function __construct()
    {

    }

    public static function generateReferenceNumber(ReferralAgent $referralAgent): string
    {
        $leftSide = str_pad($referralAgent->id, 3, "0", STR_PAD_LEFT);
        return "N" . $leftSide;
    }

    public static function notifyAgent(ReferralAgent $referralAgent, string $password): void
    {

        $message = "Habari " . $referralAgent->first_name . ", \n"
            . "namba yako ya siri ni " . $password . ".\n"
            . "Namba yako ya kamisheni ni " . $referralAgent->reference_number . ".\n\n"
            . "Itumie link hii kuona takwimu zako http://159.89.8.177:8090";

        NotificationServiceService::sendOneSms($message, $referralAgent->phone_number);
    }

    public static function getReferral(LedgerTransaction $ledgerTransaction): array|string
    {

        if ($ledgerTransaction == null || $ledgerTransaction->reference == null) {
            return "";
        }

        $referencePrefix = Config::get('selcom.reference_prefix');
        return str_replace($referencePrefix, "", $ledgerTransaction->reference);
    }

    /** @Deprecated */
    public static function giveCommission(Subscription $subscription)
    {
        //Get other subscriptions by same-customer

        if ($subscription->referred_by == null || strlen($subscription->referred_by) == 0) {
            Log::info("No one deserves a commission ");
            return null;
        }

        //Check if the agent exists
        /** @var ReferralAgent|null $referralAgent */
        $referralAgent = ReferralAgent::query()->where([
            'reference_number' => $subscription->referred_by
        ])->first();
        if ($referralAgent == null) {
            Log::info("No referralAgent found with id " . $subscription->referred_by);
            return null;
        }


        $thisMonthSubscriptions = Subscription::query()->where([
            'referred_by' => $subscription->referred_by,
            'phone_number' => $subscription->phone_number
        ])->whereBetween('created_at', [Carbon::now()->subMonth()->startOfDay(), Carbon::now()->endOfDay()])
            ->get();

        $commissionPercentage = 10;

        //  20% - Subscriptions of 3 up to 4 weeks on 1st month
        if ($thisMonthSubscriptions->count() >= 3) {
            $commissionPercentage = 20;

        } else {

            //15% - Subscription of any duration on 2nd month
            $previousMonthsSubscription = Subscription::query()->where([
                'referred_by' => $subscription->referred_by,
                'phone_number' => $subscription->phone_number
            ])->whereBetween('created_at', [Carbon::now()->subMonth(2)->startOfDay(), Carbon::now()->subMonth()->endOfDay()])
                ->get();

            if ($previousMonthsSubscription->count() > 0) {
                $commissionPercentage = 15;
            }
        }

        $commissionAmount = ($commissionPercentage / 100) * $subscription->amount;

        $commission = Commission::query()->create([
            'subscription_id' => $subscription->id,
            'agent_id' => $referralAgent->id,
            'amount' => $commissionAmount,
            'percentage' => $commissionPercentage,
            'paid_at' => null
        ]);

        Log::info("Gave commission " . json_encode($commission));
    }


}


