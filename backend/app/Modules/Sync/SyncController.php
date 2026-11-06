<?php

namespace App\Modules\Sync;

use App\Http\Controllers\Controller;
use App\Support\SyncNode;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __construct(private readonly SyncService $service)
    {
    }

    /** Cek koneksi & jam server. */
    public function ping(): JsonResponse
    {
        return response()->json([
            'node' => SyncNode::code(),
            'role' => config('sync.role'),
            'server_time' => now()->toIso8601String(),
        ]);
    }

    /** Client mengirim perubahannya ke server. */
    public function push(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'node' => 'required|string|max:4',
            'client_time' => 'required|string',
            'mode' => 'nullable|in:normal,bootstrap',
            'force' => 'nullable|boolean',
            'batches' => 'nullable|array',
            'batches.*.table' => 'required|string',
            'batches.*.rows' => 'present|array',
            'tombstones' => 'nullable|array',
        ]);

        if ($error = $this->checkPeer($validated['node'], $validated['client_time'])) {
            return $error;
        }

        $mode = $validated['mode'] ?? SyncApplier::MODE_NORMAL;
        if ($mode === SyncApplier::MODE_BOOTSTRAP && !($validated['force'] ?? false)
            && !SyncState::get('bootstrap:receiving') && !$this->service->isEmptyForBootstrap()) {
            return response()->json([
                'message' => 'Database tujuan tidak kosong. Bootstrap push dibatalkan (gunakan --force jika yakin).',
            ], 409);
        }
        if ($mode === SyncApplier::MODE_BOOTSTRAP) {
            // Tandai supaya batch bootstrap berikutnya tidak ditolak karena database sudah terisi batch pertama.
            SyncState::put('bootstrap:receiving', true);
        } else {
            SyncState::put('bootstrap:receiving', false);
        }

        $result = $this->service->receive(
            $validated['node'],
            $validated['batches'] ?? [],
            $validated['tombstones'] ?? [],
            $mode,
        );

        SyncState::put('peer:last_push_at', now()->toIso8601String());

        return response()->json(['server_time' => now()->toIso8601String()] + $result);
    }

    /** Client mengambil perubahan dari server. */
    public function pull(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'node' => 'required|string|max:4',
            'client_time' => 'required|string',
            'mode' => 'nullable|in:normal,bootstrap',
            'cursors' => 'nullable|array',
            'snapshot_cursors' => 'nullable|array',
            'tombstone_cursor' => 'nullable|integer',
            'limit' => 'nullable|integer|min:1|max:1000',
        ]);

        if ($error = $this->checkPeer($validated['node'], $validated['client_time'])) {
            return $error;
        }

        $result = $this->service->collect(
            $validated['cursors'] ?? [],
            (int) ($validated['tombstone_cursor'] ?? 0),
            (int) ($validated['limit'] ?? config('sync.batch_size', 200)),
            $validated['mode'] ?? SyncApplier::MODE_NORMAL,
            $validated['snapshot_cursors'] ?? [],
        );

        return response()->json($result);
    }

    /**
     * Jalankan migration di instance ini (hosting tanpa SSH).
     * Butuh SYNC_TOKEN + SYNC_ALLOW_MAINTENANCE=true. migrate_fresh butuh konfirmasi eksplisit.
     */
    public function maintenance(Request $request): JsonResponse
    {
        if (!config('sync.allow_maintenance')) {
            return response()->json(['message' => 'Maintenance tidak diizinkan. Set SYNC_ALLOW_MAINTENANCE=true di .env server.'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:status,migrate,migrate_fresh',
            'confirm' => 'nullable|string',
        ]);

        @set_time_limit(600);
        $action = $validated['action'];

        if ($action === 'migrate_fresh' && ($validated['confirm'] ?? '') !== 'HAPUS SEMUA DATA') {
            return response()->json(['message' => 'migrate_fresh butuh confirm = "HAPUS SEMUA DATA".'], 422);
        }

        $command = match ($action) {
            'status' => ['migrate:status', []],
            'migrate' => ['migrate', ['--force' => true]],
            'migrate_fresh' => ['migrate:fresh', ['--force' => true]],
        };

        try {
            $exit = \Illuminate\Support\Facades\Artisan::call($command[0], $command[1]);
            $output = \Illuminate\Support\Facades\Artisan::output();
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal: ' . $e->getMessage(),
                'server_time' => now()->toIso8601String(),
            ], 500);
        }

        if ($action !== 'status') {
            // Catatan: migrate:fresh mengosongkan sync_logs juga; log ini muncul setelahnya.
            SyncState::log('info', "Maintenance {$action} dijalankan (exit {$exit}).", [], 'maintenance');
        }

        return response()->json([
            'action' => $action,
            'exit_code' => $exit,
            'output' => $output,
            'server_time' => now()->toIso8601String(),
        ], $exit === 0 ? 200 : 500);
    }

    /** Status sinkron untuk ditampilkan di UI (butuh login pengguna). */
    public function status(SyncStatus $status): JsonResponse
    {
        return response()->json($status->toArray());
    }

    private function checkPeer(string $node, string $clientTime): ?JsonResponse
    {
        if (strtoupper($node) === SyncNode::code()) {
            return response()->json(['message' => 'Kode node client sama dengan server (' . SyncNode::code() . '). Periksa SYNC_NODE_CODE.'], 422);
        }

        try {
            $skew = abs(Carbon::parse($clientTime)->getTimestamp() - now()->getTimestamp());
        } catch (\Throwable) {
            return response()->json(['message' => 'client_time tidak valid.'], 422);
        }

        if ($skew > (int) config('sync.max_clock_skew', 120)) {
            SyncState::log('error', "Jam client berselisih {$skew} detik dari server, sinkron ditolak.", [], 'receive');

            return response()->json([
                'message' => "Jam PC berselisih {$skew} detik dengan server. Atur jam Windows (sinkron otomatis) lalu coba lagi.",
                'server_time' => now()->toIso8601String(),
            ], 409);
        }

        SyncState::put('peer:last_seen_at', now()->toIso8601String());
        SyncState::put('peer:node', strtoupper($node));

        return null;
    }
}
