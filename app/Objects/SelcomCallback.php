<?php

namespace App\Objects;


use Illuminate\Http\Request;

class SelcomCallback
{

    public static string $PAYMENT_STATUS_COMPLETE = 'COMPLETED';

    public string $result;
    public string $resultcode;

    public string $order_id;
    public string $selcomTransactionId;
    public string $reference;
    public string $channel;
    public string $phone;

    public string $amount;
    public string $payment_status;


    public static function fromResponse(Request $request): SelcomCallback
    {
        $object = new SelcomCallback();

        $object->result = $request->input('result');
        $object->resultcode = $request->input('resultcode');

        $object->order_id = $request->input('order_id');
        $object->selcomTransactionId = $request->input('transid');
        $object->reference = $request->input('reference');
        $object->channel = $request->input('channel');
        $object->phone = $request->input('phone');

        $object->amount = $request->input('amount');
        $object->payment_status = $request->input('payment_status');

        return $object;
    }

}

