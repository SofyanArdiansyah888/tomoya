<?php

namespace App\Modules\Sync;

use App\Support\SyncNode;
use Carbon\Carbon;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Dijalankan di PC kasir (role client): kirim perubahan ke cloud & ambil perubahan dari cloud.
 */
class SyncClient
{
    /** Batas putaran per eksekusi supaya satu run tidak berjalan terlalu lama. */
    private const MAX_ROUNDS = 50;

    /** @var callable|null */
    private $output = null;

    public function __construct(
        private readonly SyncExporter $exporter,
        private readonly SyncService $service,
    ) {
    }

    public function onOutput(callable $callback): self
    {
        $this->output = $callback;

        return $this;
    }

    /** Push lalu pull. Mencatat status untuk indikator UI. */
    public function run(): array
    {
        SyncState::put('client:last_attempt_at', now()->toIso8601String());

        try {
            $push = $this->push();
            $pull = $this->pull();

            SyncState::put('client:last_success_at', now()->toIso8601String());
            SyncState::put('client:last_error', null);

            return ['push' => $push, 'pull' => $pull];
        } catch (\Throwable $e) {
            SyncState::put('client:last_error', [
                'message' => $e->getMessage(),
                'at' => now()->toIso8601String(),
            ]);
            throw $e;
        }
    }

    public function push(string $mode = SyncApplier::MODE_NORMAL, bool $force = false): array
    {
        $bootstrap = $mode === SyncApplier::MODE_BOOTSTRAP;
        $prefix = $bootstrap ? 'bootpush:' : 'push:';
        $limit = $this->batchSize();
        $sent = [];

        foreach (SyncRegistry::names() as $table) {
            for ($round = 0; $round < self::MAX_ROUNDS * 20; $round++) {
                $cursor = SyncState::get($prefix . 'cursor:' . $table);
                $chunk = $this->exporter->changes($table, $cursor, $limit, $bootstrap);
                if ($chunk['rows'] === []) {
                    break;
                }

                $response = $this->post('/api/sync/push', [
                    'mode' => $mode,
                    'force' => $force,
                    'batches' => [['table' => $table, 'rows' => $chunk['rows']]],
                ]);
                $this->reportFailures('push', $table, $response['tables'][$table] ?? []);
                $this->assertNoFailures('push', $table, $response['tables'][$table] ?? []);

                SyncState::put($prefix . 'cursor:' . $table, $chunk['cursor']);
                $sent[$table] = ($sent[$table] ?? 0) + count($chunk['rows']);
                $this->say("push {$table}: " . count($chunk['rows']) . ' baris');

                if (!$chunk['has_more']) {
                    break;
                }
            }
        }

        if ($bootstrap) {
            foreach (array_keys(SyncRegistry::bootstrapSnapshots()) as $table) {
                $lastId = 0;
                do {
                    $snap = $this->exporter->snapshot($table, $lastId, $limit);
                    if ($snap['rows'] !== []) {
                        $this->post('/api/sync/push', [
                            'mode' => $mode,
                            'force' => $force,
                            'batches' => [['table' => $table, 'rows' => $snap['rows']]],
                        ]);
                        $sent[$table] = ($sent[$table] ?? 0) + count($snap['rows']);
                        $this->say("push snapshot {$table}: " . count($snap['rows']) . ' baris');
                    }
                    $lastId = $snap['last_id'];
                } while ($snap['has_more']);
            }

            // Lanjutkan sinkron normal dari titik akhir bootstrap.
            foreach (SyncRegistry::names() as $table) {
                SyncState::put('push:cursor:' . $table, SyncState::get('bootpush:cursor:' . $table));
            }
            SyncState::put('push:tombstone_cursor', (int) DB::table('sync_tombstones')->max('id'));
            SyncState::forget('bootpush:');
        } else {
            for ($round = 0; $round < self::MAX_ROUNDS; $round++) {
                $tombCursor = (int) SyncState::get('push:tombstone_cursor', 0);
                $tombstones = $this->exporter->tombstones($tombCursor, $limit);
                if ($tombstones === []) {
                    break;
                }

                $this->post('/api/sync/push', ['mode' => $mode, 'tombstones' => $tombstones]);
                SyncState::put('push:tombstone_cursor', (int) end($tombstones)['id']);
                $sent['_hapus'] = ($sent['_hapus'] ?? 0) + count($tombstones);
                $this->say('push hapus: ' . count($tombstones));
            }
        }

        SyncState::put('client:last_push_at', now()->toIso8601String());

        return $sent;
    }

    public function pull(string $mode = SyncApplier::MODE_NORMAL): array
    {
        $bootstrap = $mode === SyncApplier::MODE_BOOTSTRAP;
        $prefix = $bootstrap ? 'bootpull:' : 'pull:';
        $received = [];

        for ($round = 0; $round < self::MAX_ROUNDS * ($bootstrap ? 100 : 1); $round++) {
            $cursors = [];
            foreach (SyncRegistry::names() as $table) {
                $c = SyncState::get($prefix . 'cursor:' . $table);
                if ($c) {
                    $cursors[$table] = $c;
                }
            }
            $snapshotCursors = [];
            foreach (array_keys(SyncRegistry::bootstrapSnapshots()) as $table) {
                $snapshotCursors[$table] = (int) SyncState::get($prefix . 'snapshot:' . $table, 0);
            }

            $response = $this->post('/api/sync/pull', [
                'mode' => $mode,
                'cursors' => (object) $cursors,
                'snapshot_cursors' => (object) $snapshotCursors,
                'tombstone_cursor' => (int) SyncState::get($prefix . 'tombstone_cursor', 0),
                'limit' => $this->batchSize(),
            ]);

            $sourceNode = (string) ($response['node'] ?? 'C');
            $batches = array_merge($response['tables'] ?? [], $response['snapshots'] ?? []);

            $result = $this->service->receive($sourceNode, $batches, $response['tombstones'] ?? [], $mode, $bootstrap ? 'bootstrap' : 'pull');

            foreach ($response['tables'] ?? [] as $batch) {
                $this->reportFailures('pull', $batch['table'], $result['tables'][$batch['table']] ?? []);
                $this->assertNoFailures('pull', $batch['table'], $result['tables'][$batch['table']] ?? []);
                SyncState::put($prefix . 'cursor:' . $batch['table'], $batch['cursor']);
                $received[$batch['table']] = ($received[$batch['table']] ?? 0) + count($batch['rows']);
                $this->say("pull {$batch['table']}: " . count($batch['rows']) . ' baris');
            }
            foreach ($response['snapshots'] ?? [] as $batch) {
                SyncState::put($prefix . 'snapshot:' . $batch['table'], (int) $batch['last_id']);
                $received[$batch['table']] = ($received[$batch['table']] ?? 0) + count($batch['rows']);
                $this->say("pull snapshot {$batch['table']}: " . count($batch['rows']) . ' baris');
            }
            if (!empty($response['tombstones'])) {
                $received['_hapus'] = ($received['_hapus'] ?? 0) + count($response['tombstones']);
                $this->say('pull hapus: ' . count($response['tombstones']));
            }
            SyncState::put($prefix . 'tombstone_cursor', (int) ($response['tombstone_cursor'] ?? 0));

            if (empty($response['has_more'])) {
                break;
            }
        }

        if ($bootstrap) {
            foreach (SyncRegistry::names() as $table) {
                SyncState::put('pull:cursor:' . $table, SyncState::get('bootpull:cursor:' . $table));
            }
            SyncState::forget('bootpull:');
        }

        SyncState::put('client:last_pull_at', now()->toIso8601String());

        return $received;
    }

    /** Cek koneksi & selisih jam. */
    public function ping(): array
    {
        $response = $this->http()->get($this->url('/api/sync/ping'));
        if (!$response->successful()) {
            throw new RuntimeException('Ping gagal: HTTP ' . $response->status() . ' ' . $response->body());
        }

        $data = $response->json();
        if (!is_array($data) || !isset($data['server_time'])) {
            throw new RuntimeException('Ping gagal: balasan server tidak valid - ' . mb_substr(strip_tags($response->body()), 0, 300));
        }
        $data['skew_seconds'] = abs(Carbon::parse($data['server_time'])->getTimestamp() - now()->getTimestamp());

        return $data;
    }

    private function post(string $path, array $payload): array
    {
        $payload = ['node' => SyncNode::code(), 'client_time' => now()->toIso8601String()] + $payload;

        $response = $this->http()->post($this->url($path), $payload);

        if (!$response->successful()) {
            $message = $response->json('message') ?? mb_substr($response->body(), 0, 300);
            throw new RuntimeException("Sinkron gagal ({$path}): HTTP {$response->status()} - {$message}");
        }

        // Balasan harus JSON dari endpoint sync; halaman error hosting (HTML 200) tidak boleh
        // dianggap sukses karena cursor akan maju tanpa data benar-benar diterima.
        $data = $response->json();
        if (!is_array($data) || !isset($data['server_time'])) {
            throw new RuntimeException("Sinkron gagal ({$path}): balasan server tidak valid - " . mb_substr(strip_tags($response->body()), 0, 300));
        }

        return $data;
    }

    private function http(): PendingRequest
    {
        $token = (string) config('sync.token');
        if (!config('sync.remote_url') || strlen($token) < 16) {
            throw new RuntimeException('SYNC_REMOTE_URL dan SYNC_TOKEN (minimal 16 karakter) wajib diisi di .env.');
        }

        return Http::acceptJson()
            ->asJson()
            ->withHeaders(['X-Sync-Token' => $token])
            ->timeout((int) config('sync.http_timeout', 30))
            ->connectTimeout(10);
    }

    private function url(string $path): string
    {
        return config('sync.remote_url') . $path;
    }

    private function batchSize(): int
    {
        return max(1, (int) config('sync.batch_size', 200));
    }

    private function reportFailures(string $direction, string $table, array $stats): void
    {
        if (!empty($stats['failed'])) {
            $this->say("  ! {$table}: {$stats['failed']} baris gagal diterapkan (lihat sync_logs)");
        }
        if (!empty($stats['conflicts'])) {
            $this->say("  ~ {$table}: {$stats['conflicts']} konflik (lihat sync_logs)");
        }
    }

    /**
     * Jika ada baris gagal, hentikan tanpa memajukan cursor supaya data tidak hilang;
     * batch yang sama akan dicoba lagi di putaran berikutnya.
     */
    private function assertNoFailures(string $direction, string $table, array $stats): void
    {
        if (!empty($stats['failed'])) {
            $where = $direction === 'push' ? 'server tujuan' : 'database lokal';
            throw new RuntimeException("{$stats['failed']} baris {$table} gagal diterapkan di {$where}. Sinkron tabel ini ditahan dan akan dicoba lagi; lihat sync_logs.");
        }
    }

    private function say(string $line): void
    {
        if ($this->output) {
            ($this->output)($line);
        }
    }
}
