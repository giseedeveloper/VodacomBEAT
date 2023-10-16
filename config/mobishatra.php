<?php

return [

    'url' => env('MOBISHATRA_URL', ''),
    'balance_url' => env('MOBISHATRA_BALANCE_URL', ''),
    'username' => env('MOBISHATRA_USERNAME', ''),
    'password' => env('MOBISHATRA_PASSWORD', ''),
    'sender_id' => env('MOBISHATRA_SENDER_ID', ''),
    'sms_chunk' => env('MOBISHATRA_CHUNK_SIZE', 100)

];
