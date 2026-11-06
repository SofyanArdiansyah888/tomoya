<?php

namespace App\Modules\Sync;

use App\Support\SyncNode;
use Illuminate\Support\Facades\DB;

/**
 * Logika sisi penerima (dipakai endpoint server) dan pengumpul data (dipakai server & client).
 */
class SyncService
{
    public function __construct(
        private readonly SyncExporter $exporter,
        private readonly SyncApplier $applier,
    ) {
    }

    /**
     * Terima batch dari node lain.
     *
     * @param array<int,array{table:string,rows:array}> $batches
     */
    public function receive(string $sourceNode, array $batches, array $tombstones, string $mode, string $direction = 'receive'): array
    {
        $order = array_flip(array_merge(SyncRegistry::names(), array_keys(SyncRegistry::bootstrapSnapshots())));
        usort($batches, fn ($a, $b) => ($order[$a['table']] ?? 999) <=> ($order[$b['table']] ?? 999));

        $results = [];
        foreach ($batches as $batch) {
            $table = (string) ($batch['table'] ?? '');
            if (!SyncRegistry::has($table)) {
                $results[$table] = ['error' => 'tabel tidak dikenal'];
                continue;
            }
            $isSnapshot = SyncRegistry::get($table)['kind'] === 'snapshot';
            if (!$isSnapshot && !in_array($table, SyncRegistry::names(), true)) {
                // Tabel belum ada / belum dimigrasi di sini: tolak (failed) supaya pengirim menahan datanya.
                $count = count($batch['rows'] ?? []);
                SyncState::log('error', "Tabel {$table} tidak ada atau belum punya kolom sync di database ini. Jalankan migration (sync:remote migrate-fresh untuk database cloud yang tidak lengkap).", [], $direction, $table);
                $results[$table] = ['inserted' => 0, 'updated' => 0, 'skipped' => 0, 'conflicts' => 0, 'failed' => $count, 'missing_table' => true];
                continue;
            }
            if ($isSnapshot && $mode !== SyncApplier::MODE_BOOTSTRAP) {
                $results[$table] = ['error' => 'snapshot hanya untuk bootstrap'];
                continue;
            }

            $results[$table] = $this->applier->apply($table, $batch['rows'] ?? [], $sourceNode, $mode, $direction);
        }

        $tombResult = $tombstones ? $this->applier->applyTombstones($tombstones, $direction) : null;

        $this->summarizeFailures($results, $direction);

        return ['tables' => $results, 'tombstones' => $tombResult];
    }

    /**
     * Kumpulkan perubahan untuk dikirim ke peminta (pull).
     *
     * @param array<string,array{at:?string,id:int}> $cursors
     */
    public function collect(array $cursors, int $tombstoneCursor, int $limit, string $mode, array $snapshotCursors = []): array
    {
        $all = $mode === SyncApplier::MODE_BOOTSTRAP;
        $tables = [];
        $hasMore = false;
        $budget = $limit;

        foreach (SyncRegistry::names() as $table) {
            if ($budget <= 0) {
                $hasMore = true;
                break;
            }

            $chunk = $this->exporter->changes($table, $cursors[$table] ?? null, $budget, $all);
            if ($chunk['rows'] !== []) {
                $tables[] = ['table' => $table, 'rows' => $chunk['rows'], 'cursor' => $chunk['cursor']];
                $budget -= count($chunk['rows']);
            }
            if ($chunk['has_more']) {
                $hasMore = true;
                // Tabel ini belum selesai; tabel berikutnya menunggu putaran berikut supaya urutan FK aman.
                break;
            }
        }

        $snapshots = [];
        if ($all && !$hasMore) {
            foreach (array_keys(SyncRegistry::bootstrapSnapshots()) as $table) {
                $snap = $this->exporter->snapshot($table, (int) ($snapshotCursors[$table] ?? 0), $limit);
                if ($snap['rows'] !== []) {
                    $snapshots[] = ['table' => $table, 'rows' => $snap['rows'], 'last_id' => $snap['last_id']];
                }
                $hasMore = $hasMore || $snap['has_more'];
            }
        }

        $tombstones = $all ? [] : $this->exporter->tombstones($tombstoneCursor, $limit);
        $newTombCursor = $tombstones ? (int) end($tombstones)['id'] : $tombstoneCursor;
        if (count($tombstones) >= $limit) {
            $hasMore = true;
        }

        return [
            'node' => SyncNode::code(),
            'server_time' => now()->toIso8601String(),
            'tables' => $tables,
            'snapshots' => $snapshots,
            'tombstones' => array_map(fn ($t) => [
                'table_name' => $t['table_name'],
                'uuid' => $t['uuid'],
                'origin' => $t['origin'],
                'deleted_at' => $t['deleted_at'],
            ], $tombstones),
            'tombstone_cursor' => $newTombCursor,
            'has_more' => $hasMore,
        ];
    }

    /** Apakah database ini masih kosong dari data transaksi/master (aman untuk bootstrap)? */
    public function isEmptyForBootstrap(): bool
    {
        return DB::table('pesanan')->count() === 0 && DB::table('produk')->count() === 0;
    }

    private function summarizeFailures(array $results, string $direction): void
    {
        $failed = 0;
        foreach ($results as $r) {
            $failed += (int) ($r['failed'] ?? 0);
        }
        if ($failed > 0) {
            SyncState::log('warning', "{$failed} baris gagal diterapkan, lihat log error.", [], $direction);
        }
    }
}
