<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS request
        if ($request->getMethod() == "OPTIONS") {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN')
                ->header('Access-Control-Expose-Headers', 'Authorization, X-Total-Count, X-Page, X-Per-Page')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        // Add CORS headers to response
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN');
        $response->headers->set('Access-Control-Expose-Headers', 'Authorization, X-Total-Count, X-Page, X-Per-Page');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }
}