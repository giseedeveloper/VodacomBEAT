<?php

namespace App\Http\Controllers\tests;

use App\Http\Controllers\BaseController;
use App\Integrations\SelcomTransactionsService;
use App\Models\BroadcastMessage;
use App\Models\SelcomTransaction;

use App\Services\NotificationServiceService;
use App\Services\SubscriptionsService;
use App\Services\sms\MobishatraSmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TestsController extends BaseController
{

    public function __construct()
    {

    }

    public function sendSmsToMany(Request $request): JsonResponse
    {
        $request->validate([
            'recipients' => 'required|array',
            'msg' => 'required|string',
        ]);

        $recipients = $request->input('recipients');
        $recipientsString = implode(',', $recipients);

        $message = $request->input('msg');
        $resp = MobishatraSmsService::sendMany($recipientsString, $message);

        $responseData['respBody'] = $resp;
        return $this->returnResponse('Stats', $responseData);

    }

    public function testBroadcast(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|numeric'
        ]);

        /** @var BroadcastMessage|null $message */
        $message = BroadcastMessage::query()->find($request->input('id'));
        if (!$message) {
            return $this->returnError("Message does not exist");
        }

        SubscriptionsService::broadcastToActiveSubscribers($message);

        $responseData['message'] = $message;
        return $this->returnResponse('Initiated message', $responseData);
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

        $selcomTransaction->selcom_uuid = $orderResults->gatewayBuyerUuid;
        $selcomTransaction->selcom_token = $orderResults->paymentToken;
        $selcomTransaction->qr = $orderResults->qr;
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
        $selcomResults = $selcomClient->creditCustomerWallet($selcomCreditTransaction,$networkCode);

        $responseData['results'] = $selcomResults;
        return $this->returnResponse('Initiated message', $responseData);
    }


}




























