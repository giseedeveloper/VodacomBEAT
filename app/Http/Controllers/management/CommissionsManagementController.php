<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\BroadcastMessage;
use App\Models\Commission;
use App\Models\ReferralAgent;
use App\Models\Subscription;
use App\Models\VoteWeight;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionsManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getCommissions(Request $request): JsonResponse
    {

        $query = $request->input('query');
        $getPaidCommissions = $request->input('paid_commissions', '0');

        $referralAgentsQueryBuilder = ReferralAgent::query();
        if ($query) {
            $referralAgentsQueryBuilder = $referralAgentsQueryBuilder->where('phone_number', "%$query%");
        }


        //Get paid or unpaid commissions
        if ($getPaidCommissions == '1') {
            $referralAgentsQueryBuilder = $referralAgentsQueryBuilder
                ->whereHas('commissions', function ($query) {
                    $query->whereNotNull('paid_at');
                })
                ->with('commissions', function ($query) {
                    $query->whereNotNull('paid_at')
                        ->with('subscription');
                });

        } else {
            $referralAgentsQueryBuilder = $referralAgentsQueryBuilder
                ->whereHas('commissions', function ($query) {
                    $query->whereNull('paid_at');
                })
                ->with('commissions', function ($query) {
                    $query->whereNull('paid_at')
                        ->with('subscription');
                });
        }

        $referralAgentsQueryBuilder = $referralAgentsQueryBuilder->withSum('commissions', 'amount')
            ->withCount('commissions');

        $responseData['commissions'] = $referralAgentsQueryBuilder->paginate(50);
        return $this->returnResponse('Subscription update', $responseData);

    }


}




























