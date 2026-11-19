<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'izipay' => [
        'username' => env('IZIPAY_USERNAME'),
        'password' => env('IZIPAY_PASSWORD'),
        'public_key' => env('IZIPAY_PUBLIC_KEY'),
        'hmac_key' => env('IZIPAY_HMAC_KEY'),
        'api_url' => env('IZIPAY_API_URL', 'https://api.micuentaweb.pe'),
        'static_url' => env('IZIPAY_STATIC_URL', 'https://static.micuentaweb.pe'),
    ],

];
