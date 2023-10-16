<?php

namespace App\Http\Controllers\integrations;


use App\Http\Controllers\BaseController;
use App\Models\LedgerTransaction;
use App\Services\SubscriptionsService;
use App\Services\TransactionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FasthubController extends BaseController
{

    public function validateReference(Request $request): JsonResponse
    {
        Log::info("Fasthub validation: ". json_encode($request->all()));
        $responseData['code'] = 200;
        $responseData['desc'] = "ok";
        $responseData['reference_id'] = $request->input('msisdn');
        return response()->json($responseData);
    }

    public function handleCallback(Request $request): JsonResponse
    {

        Log::info("\n");
        Log::info("fasthub-callback:" . json_encode($request->all()));

        /** @var LedgerTransaction|null  $transaction */
        $transaction =  TransactionsService::addTransaction($request);
        Log::info("Transaction created: ". json_encode($transaction));

        #handle transaction creation failure
        if($transaction==null){
            Log::error("transaction creation failed: ".json_encode($request->all()));
            $responseData['status_code'] = 1;
            $responseData['status_desc'] = "ok";
            return response()->json($responseData);
        }

        if($transaction->amount<500){
            Log::debug("amount $transaction->amount did not reach required amount 500");
            $responseData['status_code'] = 1;
            $responseData['status_desc'] = "ok";
            return response()->json($responseData);
        }

        #Create subscription on successful transaction processing
        SubscriptionsService::addSubscription($transaction);

        $responseData['status_code'] = 0;
        $responseData['status_desc'] = "ok";
        return response()->json($responseData);
    }

    public function finalizeTransaction(Request $request): JsonResponse
    {
        Log::debug("fasthub-redirection:" . json_encode($request->all()));
        $responseData['status_code'] = 0;
        $responseData['desc'] = "ok";
        return response()->json($responseData);
    }

    public function cancelTransaction(Request $request): JsonResponse
    {

        Log::debug("fasthub-cancellation:" . json_encode($request->all()));
        return $this->returnResponse('Transaction cancelled', []);

    }


}




























