<?php

namespace App\Services\sms;


use App\Models\SmsGateway;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MobishatraSmsService
{

    public function __construct()
    {

    }

    public static function toMultiple(array $phoneNumbers, string $messageContent,SmsGateway $smsGateway)
    {

        $recipients = implode(",", $phoneNumbers);

        $smsServerUrl = Config::get('mobishatra.url');
        $user = Config::get('mobishatra.username');
        $password = Config::get('mobishatra.password');
        $senderId = $smsGateway->sender_id;

        $params = [
            'user' => $user,
            'pwd' => $password,
            'CountryCode' => 'ALL',
            'msgtext' => $messageContent,
            'senderid' => $senderId,
            'mobileno' => $recipients,
        ];

        Log::info("Submitting message to mobishatra: $smsServerUrl. params: " . json_encode($params));

        $response = Http::get($smsServerUrl, $params);

        Log::info($response->status());
        Log::info($response->body());

        return $response;
    }

    public static function toOne(string $phoneNumbers, string $messageContent,SmsGateway $smsGateway)
    {

        $recipients = [$phoneNumbers];

        self::toMultiple($recipients, $messageContent,$smsGateway);

    }

    public static function checkBalance(): bool|string
    {

        $url = Config::get('mobishatra.balance_url');

        //return $outgoingPacked;
        $client = new Client();

        Log::info("mobishatra balance-url: $url " );

        try {

            $response = $client->get($url);
            $responseBody = $response->getBody()->getContents();
            Log::info("mobishatra sms-balance-response:".$responseBody);
            return $responseBody;

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


