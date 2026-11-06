<?php

namespace App\Modules\Sync;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Autentikasi antar-server memakai token bersama (SYNC_TOKEN), bukan login pengguna.
 */
class SyncTokenMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('sync.token');

        if ($expected === '' || strlen($expected) < 16) {
            return response()->json(['message' => 'Sinkronisasi belum dikonfigurasi (SYNC_TOKEN).'], 503);
        }

        if (!hash_equals($expected, (string) $request->header('X-Sync-Token'))) {
            return response()->json(['message' => 'Token sinkron tidak valid.'], 401);
        }

        return $next($request);
    }
}
