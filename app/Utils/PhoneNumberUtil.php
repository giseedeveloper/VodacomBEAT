<?php

namespace App\Utils;

class PhoneNumberUtil
{

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
