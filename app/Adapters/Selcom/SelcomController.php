<?php

namespace App\Adapters\Selcom;


use App\Http\Controllers\BaseController;
use App\Models\LedgerTransaction;
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

            $tuneSubscription = TunesSubscriptionService::onPaymentComplete($existingSelcomTransaction);

            //Create ledger transaction
            LedgerTransaction::query()->create([
                "selcom_reference"=>$existingSelcomTransaction->selcom_reference,
                "selcom_uuid"=>$existingSelcomTransaction->selcom_uuid,
                "selcom_token"=>$existingSelcomTransaction->selcom_token,

                "subscription_id"=>$tuneSubscription->id,
                "subscriber_id"=>$tuneSubscription->customer_id,
                "payer_phone"=>$tuneSubscription->payment_phone,
                "amount"=>$tuneSubscription->amount,
                "status"=>LedgerTransaction::$STATUS_SUCCESS,
                "payment_url",

                "receipt"=>$existingSelcomTransaction->rec,
                "reference"=>$existingSelcomTransaction->id,
                "txid"=>$existingSelcomTransaction->selcom_transaction_id,
                "third_party"=>"Selcom"
            ]);
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




























