<?php

namespace App\Http\Controllers\reports;

use App\Exports\SubscriptionsExport;
use App\Http\Controllers\BaseController;
use App\Models\TuneSubscription;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

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
            $transactionQueryBuilder->where('payer_phone', 'like', "%$phone%");
            $appliedFilter = "Transactions by phone: {$phone}";
        }

        $responseData['subscriptions'] = $transactionQueryBuilder->latest()->paginate($perPage);
        return $this->returnResponse($appliedFilter, $responseData);
    }

    public function exportSubscriptions(Request $request)
    {
        $fileName = "subscriptions-" . Carbon::now()->format('dd-m-Y-H-i-s') . ".xlsx";
        $binaryFileResponse = Excel::download(new SubscriptionsExport, $fileName, null, ['time' => 'today']);
        return $binaryFileResponse->send();
    }


}




























