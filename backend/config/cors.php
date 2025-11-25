<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Tidak gunakan '*' jika pakai credentials
    'allowed_origins' => env('CORS_ALLOWED_ORIGINS')
        ? explode(',', env('CORS_ALLOWED_ORIGINS'))
        : [],

    // Pakai patterns untuk dev dan domain tertentu (harus pakai regex delimiters)
    // Origin CORS format: scheme://host:port (tanpa path)
    'allowed_origins_patterns' => [
        '#^http://localhost(:\d+)?$#u',
        '#^http://127\.0\.0\.1(:\d+)?$#u',
        '#^https://.*cahayasportcenter\.com$#u',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization', 'X-Total-Count', 'X-Page', 'X-Per-Page'],

    'max_age' => 86400,

    // Di development, set false untuk menghindari konflik dengan custom Cors middleware
    // Di production, bisa true karena sudah di-handle oleh .htaccess
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),
];

