<?php

namespace App\Adapters\Selcom;

use App\Objects\SelcomOrderResponse;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SelcomRestClient
{

    protected string $baseUrl;
    protected string $apiKey;
    protected string $apiSecret;

    public function __construct()
    {
        $this->apiKey = Config::get('selcom.auth.api_key');
        $this->apiSecret = Config::get('selcom.auth.api_secret');
        $this->baseUrl = Config::get('selcom.urls.base');
    }


    public function post(string $url, array $params, $isOrder = true): SelcomOrderResponse
    {
        date_default_timezone_set('Africa/Dar_es_Salaam');
        $requestTimestamp = date('c');

        $endpointUrl = $this->baseUrl . $url;
         Log::debug('Url: ' . $endpointUrl);

        $signed_fields = implode(',', array_keys($params));

        $response = Http::withHeaders([
            'Content-Type' => 'application/json;charset=\"utf-8\"',
            'Accept' => 'application/json',
            'Cache-Control' => 'no-cache',
            'Authorization' => 'SELCOM ' . base64_encode($this->apiKey),
            'Digest-Method' => 'HS256',
            'Digest' => $this->computeSignature($params, $signed_fields, $requestTimestamp),
            'Timestamp' => $requestTimestamp,
            'Signed-Fields' => $signed_fields,
        ])->post($endpointUrl, $params);

        //Handle null response
        if (!$response) {
            Log::error('Received a null response from selcom');
            Log::error($response);
            return SelcomOrderResponse::failureWithMessage(false, json_encode($response));
        }

        //Handle http status
        $rawResponse = $response->body();
        Log::debug('Selcom response. status: ' . $response->status() . '. body => ' . $rawResponse);

        //Extract response
        $selcomResponseArray = json_decode($rawResponse, true);
        if ($selcomResponseArray['resultcode'] != '000') {
            Log::debug('Selcom request failed: ');
            $selcomResponseObject = SelcomOrderResponse::failureWithMessage(false, $rawResponse);
            $selcomResponseObject->message = $selcomResponseArray['message'] . ". response code:" . $selcomResponseArray['resultcode'];
            return $selcomResponseObject;
        }

        //Transaction was successful
        $selcomOrderResponse = new SelcomOrderResponse();
        $selcomOrderResponse->isSuccess = true;

        $selcomOrderResponse->reference = $selcomResponseArray['reference'];
        $selcomOrderResponse->message = $selcomResponseArray['message'];

        if ($isOrder) {
            //Extract data elements
            $selcomOrderResponse->gatewayBuyerUuid = $selcomResponseArray['data'][0]['gateway_buyer_uuid'];
            $selcomOrderResponse->paymentToken = $selcomResponseArray['data'][0]['payment_token'];
            $selcomOrderResponse->paymentGatewayUrl = $selcomResponseArray['data'][0]['payment_gateway_url'];
            $selcomOrderResponse->paymentGatewayUrlPlain = base64_decode($selcomOrderResponse->paymentGatewayUrl);
            $selcomOrderResponse->qr = $selcomResponseArray['data'][0]['qr'];
        }

        return $selcomOrderResponse;
    }


    public function get(string $url, array $params = [])
    {
        date_default_timezone_set('Africa/Dar_es_Salaam');
        $requestTimestamp = date('c');

        $endpointUrl = $this->baseUrl . $url;

        $signed_fields = implode(',', array_keys($params));


        $response = Http::withHeaders([
            'Content-Type' => 'application/json;charset=\"utf-8\"',
            'Accept' => 'application/json',
            'Cache-Control' => 'no-cache',
            'Authorization' => 'SELCOM ' . base64_encode($this->apiKey),
            'Digest-Method' => 'HS256',
            'Digest' => $this->computeSignature($params, $signed_fields, $requestTimestamp),
            'Timestamp' => $requestTimestamp,
            'Signed-Fields' => $signed_fields,
        ])->get($this->buildUrl($endpointUrl, $params));


        $responseBody = json_decode($response->body(), true);

        Log::debug($responseBody);

        if ($responseBody['resultcode'] != '000') {
            throw new \Exception($responseBody['message']);
        }

        return $responseBody;
    }


    public function delete(string $url, array $params = [])
    {
        date_default_timezone_set('Africa/Dar_es_Salaam');
        $requestTimestamp = date('c');

        $endpointUrl = $this->config['base_url'] . $url;

        $signed_fields = implode(',', array_keys($params));

        $response = Http::withHeaders([
            'Content-Type' => 'application/json;charset=\"utf-8\"',
            'Accept' => 'application/json',
            'Cache-Control' => 'no-cache',
            'Authorization' => 'SELCOM ' . base64_encode($this->apiKey),
            'Digest-Method' => 'HS256',
            'Digest' => $this->computeSignature($params, $signed_fields, $requestTimestamp),
            'Timestamp' => $requestTimestamp,
            'Signed-Fields' => $signed_fields,
        ])->delete($this->buildUrl($endpointUrl, $params));

        $responseBody = json_decode($response->body(), true);

        if ($responseBody['resultcode'] != '000') {
            throw new \Exception($responseBody['message']);
        }

        return $responseBody;

    }


    private function buildUrl(string $url, array $params): string
    {
        $query = http_build_query($params);

        return $url . '?' . $query;
    }


    private function computeSignature($params, $signed_fields, $requestTimestamp): string
    {
        $fieldsOrder = explode(',', $signed_fields);
        $signParams = "timestamp=$requestTimestamp";

        foreach ($fieldsOrder as $key) {
            $signParams .= "&$key=" . $params[$key];
        }

        return base64_encode(hash_hmac('sha256', $signParams, $this->apiSecret, true));
    }
}


