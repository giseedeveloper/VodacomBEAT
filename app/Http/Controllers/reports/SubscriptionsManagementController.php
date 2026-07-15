<?php

namespace App\Http\Controllers\reports;

use App\Exports\SubscriptionsExport;
use App\Http\Controllers\BaseController;
use App\Models\ExportLog;
use App\Models\TuneSubscription;
use App\Services\ExportBatchService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        try {
            $exportLog = ExportBatchService::createBatch(Auth::id());
        } catch (\RuntimeException $e) {
            return $this->returnError($e->getMessage(), [], 404);
        }

        $subscriptions = $exportLog->subscriptions()->with(['phones', 'package'])->get();
        $fileName = $exportLog->file_name ?: ('subscriptions-' . Carbon::now()->format('Y-m-d-H-i-s') . '.xlsx');

        $exportLog->checksum = hash('sha256', $subscriptions->pluck('id')->implode(','));
        $exportLog->save();

        $binaryFileResponse = Excel::download(
            new SubscriptionsExport($subscriptions, $exportLog->batch_reference),
            $fileName,
            null,
            ['Access-Control-Allow-Origin' => '*']
        );

        return $binaryFileResponse->send();
    }

    public function listExportBatches(Request $request): JsonResponse
    {
        $perPage = $request->input('perPage', 15);
        $responseData['export_logs'] = ExportLog::query()
            ->withCount('subscriptions')
            ->latest()
            ->paginate($perPage);

        return $this->returnResponse('Export batches', $responseData);
    }


}




























