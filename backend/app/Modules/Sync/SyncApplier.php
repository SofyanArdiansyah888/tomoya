<?php

namespace App\Modules\Sync;

use App\Models\ProdukLokasi;
use App\Support\SyncContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menerapkan baris dari node lain ke database lokal.
 *
 * Aturan:
 *  - Baris dicocokkan berdasarkan uuid, FK uuid dipetakan ke id lokal.
 *  - master/transaction: "perubahan terakhir menang" (updated_at). Jika sama, versi cloud menang.
 *  - ledger (pergerakan stok): hanya ditambah. Saldo stok lokal disesuaikan dengan delta-nya.
 *  - Baris yang ditulis di sini diberi synced_at = updated_at supaya tidak dikirim balik.
 */
class SyncApplier
{
    public const MODE_NORMAL = 'normal';
    public const MODE_BOOTSTRAP = 'bootstrap';

    /** Kunci alami yang dipakai untuk mencocokkan baris saat bootstrap. */
    private const NATURAL_KEYS = [
        'users' => ['email'],
        'lokasi' => ['kode'],
        'supplier' => ['kode'],
        'produk' => ['kode', 'slug'],
        'produk_lokasi' => ['lokasi_id', 'produk_id'],
    ];

    private array $columnCache = [];

    /**
     * @param array<int,array<string,mixed>> $rows
     * @return array{inserted:int, updated:int, skipped:int, conflicts:int, failed:int}
     */
    public function apply(string $table, array $rows, string $sourceNode, string $mode = self::MODE_NORMAL, string $direction = 'receive'): array
    {
        $stats = ['inserted' => 0, 'updated' => 0, 'skipped' => 0, 'conflicts' => 0, 'failed' => 0];
        if ($rows === []) {
            return $stats;
        }

        $def = SyncRegistry::get($table);
        $kind = $def['kind'];
        $columns = $this->columns($table);

        return SyncContext::run(function () use ($table, $rows, $sourceNode, $mode, $direction, $def, $kind, $columns, $stats) {
            return DB::transaction(function () use ($table, $rows, $sourceNode, $mode, $direction, $def, $kind, $columns, $stats) {
                $rows = $this->resolveReferences($table, $def, $rows, $direction);

                $uuids = array_values(array_filter(array_column($rows, 'uuid')));
                $existing = [];
                foreach (array_chunk($uuids, 500) as $chunk) {
                    foreach (DB::table($table)->whereIn('uuid', $chunk)->get(['id', 'uuid', 'updated_at', 'synced_at']) as $r) {
                        $existing[$r->uuid] = $r;
                    }
                }

                $deleted = [];
                foreach (array_chunk($uuids, 500) as $chunk) {
                    foreach (DB::table('sync_tombstones')->where('table_name', $table)->whereIn('uuid', $chunk)->get(['uuid', 'deleted_at']) as $t) {
                        $deleted[$t->uuid] = $t->deleted_at;
                    }
                }

                $ledgerInserted = [];

                foreach ($rows as $row) {
                    $uuid = $row['uuid'] ?? null;
                    if (!$uuid) {
                        $stats['skipped']++;
                        continue;
                    }

                    // Data yang sudah dihapus tidak dihidupkan lagi oleh versi lama.
                    if (isset($deleted[$uuid]) && $this->cmp($row['updated_at'] ?? null, $deleted[$uuid]) <= 0) {
                        $stats['skipped']++;
                        continue;
                    }

                    $data = array_intersect_key($row, $columns);
                    unset($data['id']);
                    $data['synced_at'] = $data['updated_at'] ?? null;

                    try {
                        $local = $existing[$uuid] ?? null;

                        if (!$local && $mode === self::MODE_BOOTSTRAP) {
                            $local = $this->matchNaturalKey($table, $data);
                        }

                        if (!$local) {
                            $id = DB::table($table)->insertGetId($data);
                            $stats['inserted']++;
                            if ($kind === SyncRegistry::KIND_LEDGER && $mode === self::MODE_NORMAL) {
                                $ledgerInserted[] = ['id' => $id] + $data;
                            }
                            continue;
                        }

                        if ($kind === SyncRegistry::KIND_LEDGER && $mode === self::MODE_NORMAL) {
                            // Pergerakan stok tidak pernah diubah setelah dibuat.
                            $stats['skipped']++;
                            continue;
                        }

                        $cmp = $this->cmp($data['updated_at'] ?? null, $local->updated_at);
                        $incomingWins = $cmp > 0 || ($cmp === 0 && $sourceNode === 'C') || $mode === self::MODE_BOOTSTRAP;

                        if (!$incomingWins) {
                            $stats['skipped']++;
                            $locallyModified = $local->synced_at === null || $this->cmp($local->updated_at, $local->synced_at) !== 0;
                            if ($cmp < 0 && $locallyModified) {
                                $stats['conflicts']++;
                                SyncState::log('conflict', "Versi dari node {$sourceNode} lebih lama, versi lokal dipertahankan.", [
                                    'incoming_updated_at' => $data['updated_at'] ?? null,
                                    'local_updated_at' => $local->updated_at,
                                ], $direction, $table, $uuid);
                            }
                            continue;
                        }

                        if ($cmp === 0 && $local->synced_at !== null && $this->cmp($local->updated_at, $local->synced_at) === 0) {
                            // Versi sama persis yang sudah pernah diterima.
                            $stats['skipped']++;
                            continue;
                        }

                        if ($cmp > 0 && $local->synced_at !== null && $this->cmp($local->updated_at, $local->synced_at) !== 0) {
                            $stats['conflicts']++;
                            SyncState::log('conflict', "Perubahan lokal ditimpa versi lebih baru dari node {$sourceNode}.", [
                                'incoming_updated_at' => $data['updated_at'] ?? null,
                                'local_updated_at' => $local->updated_at,
                            ], $direction, $table, $uuid);
                        }

                        DB::table($table)->where('id', $local->id)->update($data);
                        $stats['updated']++;
                    } catch (\Throwable $e) {
                        $stats['failed']++;
                        SyncState::log('error', 'Gagal menerapkan baris: ' . $e->getMessage(), [
                            'row' => $row,
                        ], $direction, $table, $uuid);
                    }
                }

                if ($ledgerInserted !== []) {
                    if ($table === 'item_lokasi') {
                        $this->rethreadMaterialChains($ledgerInserted);
                    } elseif ($table === 'produk_lokasi_pergerakan') {
                        $this->applyProdukMovements($ledgerInserted);
                    }
                }

                return $stats;
            });
        });
    }

    /**
     * Terapkan penghapusan dari node lain.
     *
     * @param array<int,array{table_name:string,uuid:string,origin:string,deleted_at:?string}> $tombstones
     */
    public function applyTombstones(array $tombstones, string $direction = 'receive'): array
    {
        $stats = ['deleted' => 0, 'skipped' => 0, 'failed' => 0];

        SyncContext::run(function () use ($tombstones, $direction, &$stats) {
            // Hapus anak dulu (urutan registry terbalik) supaya FK aman.
            $order = array_flip(array_reverse(SyncRegistry::names()));
            usort($tombstones, fn ($a, $b) => ($order[$a['table_name']] ?? 999) <=> ($order[$b['table_name']] ?? 999));

            foreach ($tombstones as $t) {
                $table = $t['table_name'] ?? '';
                $uuid = $t['uuid'] ?? '';

                if (!in_array($table, SyncRegistry::names(), true) || $uuid === '') {
                    $stats['skipped']++;
                    continue;
                }

                try {
                    DB::transaction(function () use ($table, $uuid, $t, &$stats) {
                        $already = DB::table('sync_tombstones')
                            ->where('table_name', $table)->where('uuid', $uuid)->exists();
                        if (!$already) {
                            DB::table('sync_tombstones')->insert([
                                'table_name' => $table,
                                'uuid' => $uuid,
                                'origin' => $t['origin'] ?? '?',
                                'received' => true,
                                'deleted_at' => $t['deleted_at'] ?? now(),
                            ]);
                        }

                        if (SyncRegistry::get($table)['kind'] === SyncRegistry::KIND_LEDGER) {
                            // Pergerakan stok tidak dihapus lewat sinkron (append-only).
                            $stats['skipped']++;

                            return;
                        }

                        $deleted = DB::table($table)->where('uuid', $uuid)->delete();
                        $deleted ? $stats['deleted']++ : $stats['skipped']++;
                    });
                } catch (\Throwable $e) {
                    $stats['failed']++;
                    SyncState::log('error', 'Gagal menghapus baris: ' . $e->getMessage(), [], $direction, $table, $uuid);
                }
            }
        });

        return $stats;
    }

    /**
     * Ganti uuid FK/morph dengan id lokal.
     */
    private function resolveReferences(string $table, array $def, array $rows, string $direction): array
    {
        $fks = $def['fks'] ?? [];
        $uuidsByTarget = [];

        foreach ($rows as $row) {
            foreach ($fks as $col => $target) {
                if (!empty($row[$col])) {
                    $uuidsByTarget[$target][] = $row[$col];
                }
            }
            if (isset($def['morph'])) {
                [$typeCol, $idCol] = $def['morph'];
                $target = SyncRegistry::morphTable($row[$typeCol] ?? null);
                if ($target && !empty($row[$idCol])) {
                    $uuidsByTarget[$target][] = $row[$idCol];
                }
            }
        }

        $idMaps = [];
        foreach ($uuidsByTarget as $target => $uuids) {
            $idMaps[$target] = [];
            foreach (array_chunk(array_values(array_unique($uuids)), 500) as $chunk) {
                $idMaps[$target] += DB::table($target)->whereIn('uuid', $chunk)->pluck('id', 'uuid')->all();
            }
        }

        foreach ($rows as &$row) {
            foreach ($fks as $col => $target) {
                if (!array_key_exists($col, $row) || empty($row[$col])) {
                    continue;
                }
                $id = $idMaps[$target][$row[$col]] ?? null;
                if ($id === null) {
                    SyncState::log('warning', "Referensi {$col} → {$target} ({$row[$col]}) tidak ditemukan, dikosongkan.", [], $direction, $table, $row['uuid'] ?? null);
                }
                $row[$col] = $id;
            }
            if (isset($def['morph'])) {
                [$typeCol, $idCol] = $def['morph'];
                $target = SyncRegistry::morphTable($row[$typeCol] ?? null);
                if (array_key_exists($idCol, $row)) {
                    $row[$idCol] = ($target && !empty($row[$idCol])) ? ($idMaps[$target][$row[$idCol]] ?? null) : null;
                }
            }
        }
        unset($row);

        return $rows;
    }

    private function matchNaturalKey(string $table, array $data): ?object
    {
        $keys = self::NATURAL_KEYS[$table] ?? null;
        if (!$keys) {
            return null;
        }

        // produk_lokasi: kombinasi kolom; lainnya: salah satu kolom unik.
        $query = DB::table($table);
        if ($table === 'produk_lokasi') {
            foreach ($keys as $k) {
                $query->where($k, $data[$k] ?? null);
            }
        } else {
            $hasAny = false;
            $query->where(function ($q) use ($keys, $data, &$hasAny) {
                foreach ($keys as $k) {
                    if (!empty($data[$k])) {
                        $q->orWhere($k, $data[$k]);
                        $hasAny = true;
                    }
                }
            });
            if (!$hasAny) {
                return null;
            }
        }

        return $query->first(['id', 'uuid', 'updated_at', 'synced_at']);
    }

    /**
     * Susun ulang quantity_before/after rantai stok material setelah pergerakan
     * dari node lain disisipkan (urut tanggal, id). Saldo = jumlah delta.
     */
    private function rethreadMaterialChains(array $inserted): void
    {
        $chains = [];
        foreach ($inserted as $row) {
            $chain = ($row['quantity_gudang_after'] ?? null) !== null && ($row['quantity_after'] ?? null) === null ? 'gudang' : 'toko';
            $key = $row['lokasi_id'] . ':' . $row['material_id'] . ':' . $chain;
            $tanggal = (string) ($row['tanggal'] ?? $row['created_at']);
            if (!isset($chains[$key]) || $this->cmp($tanggal, $chains[$key]['from']) < 0) {
                $chains[$key] = [
                    'lokasi_id' => (int) $row['lokasi_id'],
                    'material_id' => (int) $row['material_id'],
                    'chain' => $chain,
                    'from' => $tanggal,
                ];
            }
        }

        foreach ($chains as $c) {
            self::rethreadMaterialChain($c['lokasi_id'], $c['material_id'], $c['chain'], $c['from']);
        }
    }

    /**
     * @return int jumlah baris yang nilainya berubah
     */
    public static function rethreadMaterialChain(int $lokasiId, int $materialId, string $chain, ?string $from = null, bool $dryRun = false): int
    {
        [$beforeCol, $afterCol] = $chain === 'gudang'
            ? ['quantity_gudang_before', 'quantity_gudang_after']
            : ['quantity_before', 'quantity_after'];

        $base = fn () => DB::table('item_lokasi')
            ->where('lokasi_id', $lokasiId)
            ->where('material_id', $materialId)
            ->whereNotNull($afterCol);

        $balance = 0;
        if ($from !== null) {
            $balance = (int) ($base()->where('tanggal', '<', $from)
                ->orderByDesc('tanggal')->orderByDesc('id')
                ->value($afterCol) ?? 0);
        }

        $query = $base();
        if ($from !== null) {
            $query->where('tanggal', '>=', $from);
        }

        $changed = 0;
        foreach ($query->orderBy('tanggal')->orderBy('id')->get(['id', $beforeCol, $afterCol]) as $r) {
            $delta = (int) $r->{$afterCol} - (int) ($r->{$beforeCol} ?? 0);
            $newBefore = $balance;
            $newAfter = $balance + $delta;

            if ((int) $r->{$beforeCol} !== $newBefore || (int) $r->{$afterCol} !== $newAfter || $r->{$beforeCol} === null) {
                $changed++;
                if (!$dryRun) {
                    // Tanpa menyentuh updated_at: nilai ini turunan lokal, tidak perlu disinkronkan.
                    DB::table('item_lokasi')->where('id', $r->id)->update([
                        $beforeCol => $newBefore,
                        $afterCol => $newAfter,
                    ]);
                }
            }

            $balance = $newAfter;
        }

        return $changed;
    }

    /**
     * Terapkan delta pergerakan stok produk dari node lain ke saldo produk_lokasi lokal.
     */
    private function applyProdukMovements(array $inserted): void
    {
        foreach ($inserted as $row) {
            if (empty($row['lokasi_id']) || empty($row['produk_id'])) {
                continue;
            }

            $delta = ($row['quantity_after'] !== null && $row['quantity_before'] !== null)
                ? (int) $row['quantity_after'] - (int) $row['quantity_before']
                : (int) ($row['quantity'] ?? 0);

            $before = ProdukLokasi::getQuantityAtLocation((int) $row['lokasi_id'], (int) $row['produk_id']);
            ProdukLokasi::adjustQuantity((int) $row['lokasi_id'], (int) $row['produk_id'], $delta, true);

            DB::table('produk_lokasi_pergerakan')->where('id', $row['id'])->update([
                'quantity_before' => $before,
                'quantity_after' => $before + $delta,
            ]);
        }
    }

    private function columns(string $table): array
    {
        return $this->columnCache[$table] ??= array_flip(Schema::getColumnListing($table));
    }

    /** Bandingkan dua timestamp (null dianggap paling lama). */
    private function cmp(?string $a, ?string $b): int
    {
        if ($a === $b) {
            return 0;
        }
        if ($a === null) {
            return -1;
        }
        if ($b === null) {
            return 1;
        }

        return Carbon::parse($a)->getTimestamp() <=> Carbon::parse($b)->getTimestamp();
    }
}
