<?php

namespace App\Http\Controllers\reports;

use App\Http\Controllers\BaseController;
use App\Models\LedgerTransaction;
use App\Models\SmsHistory;
use App\Models\SubscriptionTopic;
use App\Models\TuneSubscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportsController extends BaseController
{

    public function __construct()
    {

    }

    public function getGeneralStats(): JsonResponse
    {
        $startOfWeek = Carbon::now()->startOfWeek()->startOfDay();
        $endOfWeek = Carbon::now()->endOfWeek()->endOfDay();

        $startOfMonth = Carbon::now()->startOfMonth()->startOfDay();
        $endOfMonth = Carbon::now()->endOfMonth()->endOfDay();


        # -- Revenue ---
        # Week-count
        $responseData['dayTransactionsAmount'] =  LedgerTransaction::query()
            ->whereBetween('created_at',[Carbon::now()->startOfDay(),Carbon::now()->endOfDay()])
            ->where(['status'=>LedgerTransaction::$STATUS_SUCCESS])
            ->count();

        # Week-revenue
        $responseData['weekTransactionsAmount'] =  LedgerTransaction::query()
            ->whereBetween('created_at',[$startOfWeek,$endOfWeek])
            ->where(['status'=>LedgerTransaction::$STATUS_SUCCESS])
            ->sum('amount');

        # Month-revenue
        $responseData['monthTransactionsAmount'] =  LedgerTransaction::query()
            ->whereBetween('created_at',[$startOfMonth,$endOfMonth])
            ->where(['status'=>LedgerTransaction::$STATUS_SUCCESS])
            ->sum('amount');

        # All-time-revenue
        $responseData['allTimeTransactionsAmount'] =  LedgerTransaction::query()
            ->where(['status'=>LedgerTransaction::$STATUS_SUCCESS])
            ->sum('amount');



        # Subscriptions Today
        $responseData['daySubscriptionsCount'] =  TuneSubscription::query()
            ->whereBetween('created_at',[Carbon::now()->startOfDay(),Carbon::now()->endOfDay()])
            ->count();

        # Active subscriptions
        $responseData['activeSubscriptions'] =  TuneSubscription::query()
            ->where('ends_at',">",Carbon::now())
            ->count();

        # Last 7-Days Subscriptions
        $responseData['weekSubscriptions'] =  TuneSubscription::query()
            ->whereBetween('created_at',[$startOfWeek,$endOfWeek])
            ->count();

        # Last 30-Days Subscriptions
        $responseData['monthSubscriptions'] =  TuneSubscription::query()
            ->whereBetween('created_at',[$startOfMonth,$endOfMonth])
            ->count();

        # All Time subscriptions
        $responseData['allTimeSubscriptions'] =  TuneSubscription::query()
            ->count();

        # Sent SMS counters
        $responseData['daySmsCounter'] =  SmsHistory::query()
            ->whereBetween('created_at',[Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])
            ->sum('audience_count');

        $responseData['weekSmsCounter'] =  SmsHistory::query()
            ->whereBetween('created_at',[$startOfWeek,$endOfWeek])
            ->sum('audience_count');

        $responseData['monthSmsCounter'] =  SmsHistory::query()
            ->whereBetween('created_at',[$startOfMonth,$endOfMonth])
            ->sum('audience_count');


        $responseData['allTimeSmsCounter'] =  SmsHistory::query()
            ->sum('audience_count');

        return $this->returnResponse('Stats', $responseData);
    }

    public function getTeamsGeneralStats(): JsonResponse
    {

        /** @var SubscriptionTopic[] $teams */
        $teams = SubscriptionTopic::all();

        $responseData['teams'] =[];
        return $this->returnResponse('Stats', $responseData);
    }

    public function subscriptionsByReferenceCode(): JsonResponse
    {

        /** @var SubscriptionTopic[] $teams */
        $subscriptions = LedgerTransaction::query()->select('reference',DB::raw('count(*) as subscriptions'))
            ->groupBy('reference')
            ->get();



        $responseData['stats'] = $subscriptions;
        return $this->returnResponse('Stats', $responseData);
    }


}




























