<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS — Cross-Origin Resource Sharing
    |--------------------------------------------------------------------------
    | Aceita chamadas da extensão Chrome (chrome-extension://*) e de localhost
    | durante o desenvolvimento.
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
    ],

    // Regex para aceitar qualquer extensão Chrome
    'allowed_origins_patterns' => [
        '#^chrome-extension://#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,

];
