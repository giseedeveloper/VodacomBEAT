<?php

namespace App\Services\sms;


use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class NextSmsService
{

    public function __construct()
    {

    }


    public static function toOne($phoneNumber, $message): bool|string
    {

        Log::info("");

        $url = Config::get('nextsms.sms_url');
        $credentials = Config::get('nextsms.token');

        Log::info("Sending SMS using next-sms to $phoneNumber $message. url:$url , token:$credentials");

        if (!is_numeric($phoneNumber)) {
            Log::error("Phone number is invalid: " . $phoneNumber);
            return "failed";
        }

        ///Check for sms ON and OFF status
        if (Config::get('nextsms.enabled') != 1) {
            Log::warning("NEXT SMS not enabled: set NEXT_SMS_ENABLED=1 to enable the service ");
            return "no-op";
        }

        $outgoing = array(
            'from' => Config::get('nextsms.sender_name'),
            'to' => $phoneNumber,
            'text' => $message
        );
        $outgoingJSON = json_encode($outgoing);

        return self::submitMessage($outgoingJSON);
    }


    public static function toMultiple(array $phoneNumbers, $message)
    {
        Log::info("");
        Log::info("Sending SMS using next-sms to " . json_encode($phoneNumbers));
        $outgoing = array(
            'from' => Config::get('nextsms.sender_name'),
            'to' => $phoneNumbers,
            'text' => $message
        );
        $outgoingJSON = json_encode($outgoing);

        return self::submitMessageToGateway($outgoingJSON);
    }

    private static function submitMessageToGateway(string $requestBody): bool|string
    {


        $credentials = Config::get('nextsms.token');
        $url = Config::get('nextsms.sms_url');
        $token = Config::get('nextsms.token');

        ///Check for sms ON and OFF status
        if (Config::get('nextsms.enabled') != 1) {
            Log::warning("NEXT SMS not enabled: set NEXT_SMS_ENABLED=1 to enable the service ");
            return "no-op";
        }

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
            ],
            'body' => $requestBody
        ];

        Log::info("next-sms url: $url, credentials: $credentials body:" . json_encode($options));

        try {
            $response = $client->post($url, $options);
        } catch (Exception $e) {
            Log::error($e);
            Log::error($e->getMessage());
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


