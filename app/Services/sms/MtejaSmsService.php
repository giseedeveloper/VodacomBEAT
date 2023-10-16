<?php

namespace App\Services\sms;


use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class MtejaSmsService
{

    public function __construct()
    {

    }

    public static function toOne($phoneNumber, $message): void
    {

        //Append + at the beginning
        $phoneNumber = "+" . $phoneNumber;

        Log::debug("Sending single SMS to $phoneNumber $message");

        if (!is_numeric($phoneNumber)) {
            Log::debug("Phone number is invalid: " . $phoneNumber);
            return;
        }

        self::submitToSmsGateway($phoneNumber, $message);
    }


    public static function toMultiple(array $phoneNumbers, string $message): void
    {
        Log::debug("Sending multiple SMS to  $message");

        $commaSeparatedNumbers = implode(",", $phoneNumbers);

        self::submitToSmsGateway($commaSeparatedNumbers, $message);
    }

    private static function submitToSmsGateway(string $phoneNumbers, string $message): bool|string
    {

        $reference = dechex(time()) . "G" . rand(111, 999);
        $url = Config::get('mteja.sms_url');
        $token = Config::get('mteja.token');
        $appId = (int)Config::get('mteja.app_id');

        $outgoing = array(
            'from' => Config::get('mteja.sender_name'),
            'to' => $phoneNumbers,
            'text' => $message,
            'appId' => $appId,
            "tags" => [
                "marketing"
            ],
            "referenceId" => $reference,
            "requestId" => $reference
        );
        $outgoingJsonBody = json_encode($outgoing);


        //return $outgoingPacked;
        $client = new Client();
        $options = [
            'connect_timeout' => 1500,
            'read_timeout' => 1500,
            'timeout' => 1500,
            'headers' => [
                "Accept" => "application/json",
                "Content-Type" => "application/json",
                "X-App-ID" => $appId,
                "X-API-Key" => $token,
            ],
            'body' => $outgoingJsonBody
        ];

        Log::info("sms via mteja:  url: $url,   body:" . json_encode($options));

        ///Check for sms ON and OFF status
        $smsOnStatus = Config::get('nextsms.url');
        if ($smsOnStatus == '0') {
            Log::info("SMS turned of");
            return $message;
        }

        try {
            $response = $client->post($url, $options);
        } catch (Exception $e) {
            Log::error($e);
            return $e->getMessage();
        }

        $responseData['status'] = $response->getStatusCode(); // 200
        $responseData['reason'] = $response->getReasonPhrase(); // OK
        $responseData['body'] = json_encode($response->getBody()); // OK
        Log::info(json_encode($responseData));
        return true;

    }

    public static function checkBalance(): bool|string
    {

        return "Uknown";

        $url = Config::get('nextsms.balance_url');
        $token = Config::get('nextsms.token');

        //return $outgoingPacked;
        $client = new Client();
        $options = [
            'connect_timeout' => 1500,
            'read_timeout' => 1500,
            'timeout' => 1500,
            'headers' => [
                "Accept" => "application/json",
                "Content-Type" => "application/json",
                "Authorization" => "Basic {$token}"
            ]
        ];

        Log::info("next-sms url: $url, body:" . json_encode($options));

        try {

            $response = $client->get($url, $options);
            $responseBody = $response->getBody()->getContents();
            Log::info("sms-balance-response:".$responseBody);
            return json_decode($responseBody)->sms_balance;

        } catch (GuzzleException $e) {
            Log::error($e);
            Log::error($e->getMessage());
            return "Check Failed";
        } catch (Exception $e) {
            Log::error($e);
            Log::error($e->getMessage());
            return "Check Failed";
        }


        return "Check Failed";
    }

}


