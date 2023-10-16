<?php


return [

    'reference_prefix' => env('SELCOM_REFERENCE_PREFIX', ''),

    'auth' => [
        'vendor' => env('SELCOM_VENDOR', 'TILL60917564'),
        'pin' => env('SELCOM_PIN', '4470'),
        'api_key' => env('SELCOM_API_KEY', 'MOBIAD-BAE4439D874CAFF7'),
        'api_secret' => env('SELCOM_API_SECRET', '8PE3412A-7J3F0K7F-2A254AF-0P636D54'),
    ],

    'urls' => [
        'base' => env('SELCOM_BASE_URL', ''),

        'webhook' => env('SELCOM_WEBHOOK_URL', ''),
        'redirect' => env('SELCOM_REDIRECT_URL', ''),
        'cancel' => env('SELCOM_CANCEL_URL', '')
    ],


];

