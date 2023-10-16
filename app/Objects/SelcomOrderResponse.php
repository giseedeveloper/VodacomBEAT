<?php

namespace App\Objects;


class SelcomOrderResponse
{

    public bool $isSuccess;
    public string $status;

    public string $extra;
    public string $reference;

    public string $gatewayBuyerUuid;
    public string $paymentToken;
    public string $paymentGatewayUrl;
    public string $paymentGatewayUrlPlain;
    public string $qr;

    public static function failure(bool $isSuccess): SelcomOrderResponse
    {
        $resp = new SelcomOrderResponse();
        $resp->isSuccess = $isSuccess;
        return $resp;
    }

    public static function failureWithMessage(bool $isSuccess,String $message): SelcomOrderResponse
    {
        $resp = new SelcomOrderResponse();
        $resp->isSuccess = $isSuccess;
        $resp->extra = $message;
        return $resp;
    }

}

