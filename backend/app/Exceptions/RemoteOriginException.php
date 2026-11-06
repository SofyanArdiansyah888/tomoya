<?php

namespace App\Exceptions;

use App\Support\SyncNode;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Dilempar saat pengguna mencoba mengubah/menghapus transaksi yang dibuat di node lain.
 */
class RemoteOriginException extends RuntimeException
{
    public function __construct(public readonly string $origin)
    {
        parent::__construct(
            'Data ini dibuat di ' . SyncNode::label($origin) . ' dan hanya bisa diubah atau dihapus di sana.'
        );
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'origin' => $this->origin,
        ], 403);
    }
}
