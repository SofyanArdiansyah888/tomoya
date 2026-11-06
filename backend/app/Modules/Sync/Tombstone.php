<?php

namespace App\Modules\Sync;

use App\Support\SyncContext;
use App\Support\SyncNode;
use Illuminate\Support\Facades\DB;

class Tombstone
{
    /**
     * Catat penghapusan yang dilakukan lewat query builder (tanpa event model)
     * supaya ikut tersinkron ke node lain. Panggil SEBELUM baris dihapus.
     */
    public static function recordQuery(string $table, \Illuminate\Database\Query\Builder $query): void
    {
        if (SyncContext::applying() || !in_array($table, SyncRegistry::names(), true)) {
            return;
        }

        $uuids = (clone $query)->whereNotNull('uuid')->pluck('uuid')->all();
        self::record($table, $uuids);
    }

    /** @param string[] $uuids */
    public static function record(string $table, array $uuids): void
    {
        if ($uuids === []) {
            return;
        }

        $now = now();
        $rows = array_map(fn ($uuid) => [
            'table_name' => $table,
            'uuid' => $uuid,
            'origin' => SyncNode::code(),
            'received' => false,
            'deleted_at' => $now,
        ], $uuids);

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('sync_tombstones')->insert($chunk);
        }
    }
}
