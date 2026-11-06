<?php

namespace App\Modules\Sync;

use Illuminate\Support\Facades\DB;

/**
 * Mengambil baris yang berubah dari database lokal dan mengubahnya
 * ke bentuk yang bisa dikirim (foreign key diganti uuid).
 */
class SyncExporter
{
    /**
     * Ambil perubahan satu tabel setelah cursor.
     *
     * @param array{at:?string,id:int}|null $cursor
     * @param bool $all  true = semua baris (bootstrap), false = hanya perubahan yang dibuat di node ini
     * @return array{rows:array<int,array>, cursor:?array, has_more:bool}
     */
    public function changes(string $table, ?array $cursor, int $limit, bool $all = false): array
    {
        $query = DB::table($table);

        if (!$all) {
            // Baris yang ditulis oleh proses sinkron punya synced_at = updated_at; jangan dikirim balik.
            $query->where(function ($q) {
                $q->whereNull('synced_at')->orWhereColumn('updated_at', '<>', 'synced_at');
            });

            $settle = (int) config('sync.settle_seconds', 5);
            if ($settle > 0) {
                $query->where('updated_at', '<=', now()->subSeconds($settle)->format('Y-m-d H:i:s'));
            }
        }

        $this->applyCursor($query, $cursor);

        $rows = $query->orderBy('updated_at')->orderBy('id')->limit($limit + 1)->get();
        $hasMore = $rows->count() > $limit;
        $rows = $rows->take($limit)->values();

        if ($rows->isEmpty()) {
            return ['rows' => [], 'cursor' => $cursor, 'has_more' => false];
        }

        $last = $rows->last();
        $newCursor = ['at' => (string) $last->updated_at, 'id' => (int) $last->id];

        return [
            'rows' => $this->serialize($table, $rows->map(fn ($r) => (array) $r)->all()),
            'cursor' => $newCursor,
            'has_more' => $hasMore,
        ];
    }

    /**
     * Jumlah baris yang menunggu dikirim (untuk indikator status).
     */
    public function pendingCount(string $table, ?array $cursor): int
    {
        $query = DB::table($table)->where(function ($q) {
            $q->whereNull('synced_at')->orWhereColumn('updated_at', '<>', 'synced_at');
        });
        $this->applyCursor($query, $cursor);

        return $query->count();
    }

    /**
     * Tombstone (penghapusan) yang dibuat di node ini setelah cursor.
     */
    public function tombstones(int $afterId, int $limit): array
    {
        $rows = DB::table('sync_tombstones')
            ->where('received', false)
            ->where('id', '>', $afterId)
            ->orderBy('id')
            ->limit($limit)
            ->get(['id', 'table_name', 'uuid', 'origin', 'deleted_at']);

        return $rows->map(fn ($r) => (array) $r)->all();
    }

    public function snapshot(string $table, int $afterId, int $limit): array
    {
        $rows = DB::table($table)->where('id', '>', $afterId)->orderBy('id')->limit($limit)->get();
        $lastId = $rows->isEmpty() ? $afterId : (int) $rows->last()->id;

        return [
            'rows' => $this->serialize($table, $rows->map(fn ($r) => (array) $r)->all()),
            'last_id' => $lastId,
            'has_more' => $rows->count() >= $limit,
        ];
    }

    private function applyCursor($query, ?array $cursor): void
    {
        if (!$cursor || empty($cursor['at'])) {
            return;
        }

        $query->where(function ($q) use ($cursor) {
            $q->where('updated_at', '>', $cursor['at'])
                ->orWhere(function ($q2) use ($cursor) {
                    $q2->where('updated_at', '=', $cursor['at'])->where('id', '>', (int) ($cursor['id'] ?? 0));
                });
        });
    }

    /**
     * Ganti id lokal (PK & FK) dengan uuid.
     *
     * @param array<int,array<string,mixed>> $rows
     */
    public function serialize(string $table, array $rows): array
    {
        $def = SyncRegistry::get($table);
        $fks = $def['fks'] ?? [];

        // Kumpulkan id per tabel target, lalu ambil uuid-nya sekaligus.
        $idsByTarget = [];
        foreach ($rows as $row) {
            foreach ($fks as $col => $target) {
                if (!empty($row[$col])) {
                    $idsByTarget[$target][] = (int) $row[$col];
                }
            }
            if (isset($def['morph'])) {
                [$typeCol, $idCol] = $def['morph'];
                $target = SyncRegistry::morphTable($row[$typeCol] ?? null);
                if ($target && !empty($row[$idCol])) {
                    $idsByTarget[$target][] = (int) $row[$idCol];
                }
            }
        }

        $uuidMaps = [];
        foreach ($idsByTarget as $target => $ids) {
            $uuidMaps[$target] = [];
            foreach (array_chunk(array_values(array_unique($ids)), 500) as $chunk) {
                $uuidMaps[$target] += DB::table($target)->whereIn('id', $chunk)->pluck('uuid', 'id')->all();
            }
        }

        $out = [];
        foreach ($rows as $row) {
            foreach ($fks as $col => $target) {
                if (array_key_exists($col, $row)) {
                    $row[$col] = $row[$col] ? ($uuidMaps[$target][(int) $row[$col]] ?? null) : null;
                }
            }
            if (isset($def['morph'])) {
                [$typeCol, $idCol] = $def['morph'];
                $target = SyncRegistry::morphTable($row[$typeCol] ?? null);
                if (array_key_exists($idCol, $row)) {
                    $row[$idCol] = ($target && $row[$idCol]) ? ($uuidMaps[$target][(int) $row[$idCol]] ?? null) : null;
                }
            }

            unset($row['id'], $row['synced_at']);
            $out[] = $row;
        }

        return $out;
    }
}
