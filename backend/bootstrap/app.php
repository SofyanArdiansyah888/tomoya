<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Required for Cloudflare Tunnel / reverse proxy HTTPS detection
        $middleware->trustProxies(at: '*');
 
        $middleware->alias([
            'api.auth' => \App\Http\Middleware\ApiAuth::class,
        ]);
        // Enable CORS for API routes - use both Laravel's HandleCors and custom Cors middleware
        $middleware->api(prepend: [
            \App\Http\Middleware\Cors::class,
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
