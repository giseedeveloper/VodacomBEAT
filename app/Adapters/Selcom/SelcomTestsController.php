<?php

namespace App\Adapters\Selcom;

use App\Http\Controllers\BaseController;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Services\NotificationServiceService;
use App\Services\payment\AgentsCommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SelcomTestsController extends BaseController
{

    public function __construct()
    {

    }

    public function selcomOrder(Request $request): JsonResponse
    {

        Log::info("selcom order: " . json_encode($request->all()));

        $responseData['status'] = "arrived";
        $phone = $request->input('phone_number');
        $amount = $request->input('amount');

        /** @var SelcomTransaction | null $selcomTransaction */
        $selcomTransaction = SelcomTransaction::query()->create([
            "order_id" => dechex(time()),
            "selcom_reference" => null,
            "selcom_uuid" => null,
            "selcom_token" => null,
            "payer_phone" => $phone,
            "amount" => $amount
        ]);

        $selcomClient = new  SelcomTransactionsService();
        $orderResults = $selcomClient->submitTransactionToSelcom($selcomTransaction);

        $selcomTransaction->selcom_uuid = $orderResults->gatewayBuyerUuid??"";
        $selcomTransaction->selcom_token = $orderResults->paymentToken??"";
        $selcomTransaction->qr = $orderResults->qr??"";
        $selcomTransaction->remark = $orderResults->message??"";
        $selcomTransaction->save();

        //Init push
        if ($orderResults->isSuccess) {
            $pushResults = $selcomClient->initiatePushUssd($selcomTransaction);
        }

        $responseData['orderResults'] = $orderResults;
        $responseData['pushResults'] = $pushResults;
        $responseData['selcomTransaction'] = $selcomTransaction;
        return $this->returnResponse('Initiated message', $responseData);
    }

    public function selcomPush(Request $request): JsonResponse
    {
        Log::info($request->all());
        $request->validate([
            'transaction_id' => 'required|numeric'
        ]);

        /** @var SelcomTransaction | null $selcomTransaction */
        $selcomTransaction = SelcomTransaction::query()->find($request->input('transaction_id'));
        if ($selcomTransaction == null) {
            return $this->returnError('Transaction not found', [], 400);
        }

        $selcomClient = new  SelcomTransactionsService();
        $selcomResults = $selcomClient->initiatePushUssd($selcomTransaction);


        $responseData['results'] = $selcomResults;
        return $this->returnResponse('Initiated message', $responseData);
    }

    public function selcomDisburse(Request $request): JsonResponse
    {

        Log::info($request->all());
        $request->validate([
            'payer_phone' => 'required|numeric',
            'receiver_phone' => 'required|numeric',
            'network' => 'required',
        ]);

        $userId = Auth::id();
        $receiverPhone = NotificationServiceService::formatPhoneNumberTZ($request->input('receiver_phone'));
        $payerPhone = NotificationServiceService::formatPhoneNumberTZ($request->input('payer_phone'));
        $networkCode = $request->input('network');

        /** @var SelcomTransaction | null $selcomCreditTransaction */
        $selcomCreditTransaction = SelcomTransaction::query()->create([
            "order_id" => $userId . dechex(time()),
            "transaction_type" => SelcomTransaction::$TYPE_CREDIT_CUSTOMER,
            "selcom_reference" => null,
            "selcom_transaction_id" => null,
            "selcom_uuid" => null,
            "selcom_token" => null,
            "payer_phone" => $payerPhone,
            "receiver_phone" => $receiverPhone,
            "amount" => 1000,
            "status" => SelcomTransaction::$STATUS_PENDING
        ]);

        $selcomClient = new  SelcomTransactionsService();
        $selcomResults = $selcomClient->creditCustomerWallet($selcomCreditTransaction, $networkCode);

        $responseData['results'] = $selcomResults;
        return $this->returnResponse('Initiated message', $responseData);
    }

    public function selcomDisburseAgent(Request $request): JsonResponse
    {

        Log::info($request->all());
        $request->validate([
            'subscription_id' => 'required|numeric',
        ]);

        /** @var TuneSubscription | null $tuneSubscription */
        $tuneSubscription = TuneSubscription::query()->find($request->input('subscription_id'));
        if ($tuneSubscription == null) {
            return $this->returnError("Subscription not found", [], 400);
        }

        $transaction = AgentsCommissionService::onCommissionDisbursement($tuneSubscription);

        $responseData['subscription'] = $tuneSubscription;
        $responseData['transaction'] = $transaction;
        return $this->returnResponse('Initiated message', $responseData);
    }


    public function mockDisburse(Request $request)
    {
        $resp =  '{"reference":"0700993782","transid":61,"resultcode":"000","result":"SUCCESS","message":"Vodacom M-pesa Cash-in\nTo RICHARD UNGANI\nReference 0700993782\nPhone 0763328665\nAmount TZS 1,000.00\nReceipt AJD4AZ0DHEK","data":[]}';
        return json_decode($resp);
    }


}




























