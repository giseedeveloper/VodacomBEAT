<?php

namespace App\Adapters\Selcom;


use App\Http\Controllers\BaseController;
use App\Objects\SelcomCallback;
use App\Services\TunesSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SelcomController extends BaseController
{

    public function handleCallback(Request $request): JsonResponse
    {

        Log::debug("selcom-callback:" . json_encode($request->all()));

        $callbackObject = SelcomCallback::fromResponse($request);
        $selcomTransactionService = new SelcomTransactionsService();
        $existingSelcomTransaction = $selcomTransactionService->completeTransaction($callbackObject);

        if($existingSelcomTransaction!=null){
            TunesSubscriptionService::onPaymentComplete($existingSelcomTransaction);
        }

        $responseEntity['success'] = $existingSelcomTransaction != null;
        $responseEntity['callback'] = $callbackObject;
        return $this->returnResponse('Callback received', $responseEntity);

    }

    public function finalizeTransaction(Request $request): JsonResponse
    {

        Log::debug("selcom-redirection:" . json_encode($request->all()));
        return $this->returnResponse('Transaction completed', []);

    }

    public function cancelTransaction(Request $request): JsonResponse
    {

        Log::debug("selcom-cancellation:" . json_encode($request->all()));
        return $this->returnResponse('Transaction cancelled', []);

    }


}




























