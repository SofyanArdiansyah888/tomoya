<?php

namespace App\Traits;

use App\Exceptions\RemoteOriginException;
use App\Modules\Sync\SyncRegistry;
use App\Support\SyncContext;
use App\Support\SyncNode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Dipakai oleh semua model yang disinkronkan antara PC kasir dan cloud.
 *
 * - Mengisi `uuid` dan `origin` saat dibuat.
 * - Mencatat tombstone saat dihapus supaya penghapusan ikut tersinkron.
 * - Menolak ubah/hapus transaksi yang dibuat di node lain.
 */
trait HasSyncUuid
{
    public static function bootHasSyncUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            if (empty($model->origin)) {
                $model->origin = SyncNode::code();
            }
        });

        static::updating(function ($model) {
            $model->guardSyncOrigin();
        });

        static::deleting(function ($model) {
            $model->guardSyncOrigin();
        });

        static::deleted(function ($model) {
            if (SyncContext::applying() || empty($model->uuid)) {
                return;
            }

            $table = $model->getTable();
            if (!in_array($table, SyncRegistry::names(), true)) {
                return;
            }

            DB::table('sync_tombstones')->insert([
                'table_name' => $table,
                'uuid' => $model->uuid,
                'origin' => SyncNode::code(),
                'received' => false,
                'deleted_at' => now(),
            ]);
        });
    }

    public function isFromThisNode(): bool
    {
        return empty($this->origin) || $this->origin === SyncNode::code();
    }

    protected function guardSyncOrigin(): void
    {
        if (SyncContext::applying() || $this->isFromThisNode()) {
            return;
        }

        $table = $this->getTable();
        if (!in_array($table, SyncRegistry::names(), true)) {
            return;
        }

        if (SyncRegistry::get($table)['kind'] === SyncRegistry::KIND_TRANSACTION) {
            throw new RemoteOriginException((string) $this->origin);
        }
    }
}
