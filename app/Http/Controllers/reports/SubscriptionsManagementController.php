<?php

namespace App\Http\Controllers\reports;

use App\Http\Controllers\BaseController;
use App\Models\LedgerTransaction;
use App\Models\Subscription;
use App\Models\TuneSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionsManagementController extends BaseController
{

    public function __construct()
    {

    }

    public function getSubscriptions(Request $request): JsonResponse
    {

        $perPage = $request->input('perPage');
        $transactionQueryBuilder = TuneSubscription::query();

        $appliedFilter = "All Subscriptions";

        # filter by status
        $status = $request->input('status');
        if (is_string($status)) {
            $transactionQueryBuilder->where('status', $status);
            $appliedFilter = "Transactions by status: {$status}";
        }

        # filter by phone
        $phone = $request->input('query');
        if (is_string($phone)) {
            $transactionQueryBuilder->where('payer_phone','like', "%$phone%");
            $appliedFilter = "Transactions by phone: {$phone}";
        }

        $responseData['subscriptions'] = $transactionQueryBuilder->latest()->paginate($perPage);
        return $this->returnResponse($appliedFilter, $responseData);
    }


}




























