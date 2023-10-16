<?php

namespace App\Services;


use App\Models\LedgerTransaction;
use App\Models\SmsGateway;
use App\Services\sms\MobishatraSmsService;
use App\Services\sms\MtejaSmsService;
use App\Services\sms\NextSmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationServiceService
{


    public function __construct()
    {

    }

    public static function sendOneSms($msg, $phone): string
    {

        //Check configured message service
        $formattedPhone = self::formatPhoneNumberTZ($phone);

        /** @var SmsGateway|null $smsGateway */
        $smsGateway = SmsGateway::query()->where('is_default', true)->first();
        if (!$smsGateway) {
            Log::error("No default SMS gateway set");
            return "";
        }

        Log::info("configured gateway: " . json_encode($smsGateway));

        if ($smsGateway->provider_code == SmsGateway::$NEXTSMS) {

            //1. NextSMS
//            $msg = $msg. "\n\nREF: NXT".dechex(time());
            NextSmsService::toOne($formattedPhone, $msg);

        } else if ($smsGateway->provider_code == SmsGateway::$MOBISHATRA) {

            //2. Mobishatra
            //$msg = $msg. "\n\nREF: MBS".dechex(time());
            MobishatraSmsService::toOne($formattedPhone, $msg,$smsGateway);

        } else if ($smsGateway->provider_code == SmsGateway::$MTEJA) {

            //3. Mteja
//            $msg = $msg. "\n\nREF: MTJ".dechex(time());
            MtejaSmsService::toOne($formattedPhone, $msg);

        } else {
            Log::error("Unknown default sms gateway");
        }

        return "";


    }

    public static function sendSmsToMultiple(array $phoneNumbers, $message): string
    {

        // todo format all phones
//        $formattedPhone = self::formatPhoneNumberTZ($phone);

        /** @var SmsGateway|null $smsGateway */
        $smsGateway = SmsGateway::query()->where('is_default', true)->first();
        if (!$smsGateway) {
            Log::error("No default SMS gateway set");
            return "";
        }

        Log::info("configured gateway: " . json_encode($smsGateway));

        if ($smsGateway->provider_code == SmsGateway::$NEXTSMS) {

            //1. NextSMS
//            $message = $message . "\n\nREF: NXT" . dechex(time());
            NextSmsService::toMultiple($phoneNumbers, $message);

        } else if ($smsGateway->provider_code == SmsGateway::$MOBISHATRA) {

            //2. Mobishatra
//            $message = $message . "\n\nREF: MBS" . dechex(time());
            MobishatraSmsService::toMultiple($phoneNumbers, $message, $smsGateway);

        } else if ($smsGateway->provider_code == SmsGateway::$MTEJA) {

            //3. Mteja
//            $message = $message . "\n\nREF: MTJ" . dechex(time());
            MtejaSmsService::toMultiple($phoneNumbers, $message);

        } else {
            Log::error("Unknown default sms gateway");
        }

        return "";

    }

    public static function formatPhoneNumberTZ($phone)
    {
        $phone = str_replace(' ', '', $phone); //remove spaces
        $phone = str_replace('+', '', $phone); //remove spaces
        $phone = self::cleanString($phone); //remove spaces

        if (self::startsWith($phone, '255')) {
            return $phone;
        }
        if (self::startsWith($phone, '0')) {
            return '255' . substr($phone, 1);
        }

        return '255' . substr($phone, 0);
    }

    private static function startsWith($string, $startString): bool
    {
        $len = strlen($startString);
        return substr($string, 0, $len) === $startString;
    }

    private static function cleanString($val): string
    {
        return preg_replace('/[^a-zA-Z0-9\s]/', '', $val);
    }


}


