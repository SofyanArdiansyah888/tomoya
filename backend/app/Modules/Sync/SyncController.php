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
