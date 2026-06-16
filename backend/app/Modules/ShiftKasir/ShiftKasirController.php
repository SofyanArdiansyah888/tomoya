<?php

namespace App\Modules\ShiftKasir;

use App\Http\Controllers\Controller;
use App\Models\ShiftKasir;
use App\Models\ArusKas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\ShiftKasir\BukaKasirRequest;
use App\Modules\ShiftKasir\TutupKasirRequest;
use App\Modules\ShiftKasir\ShiftKasirResource;

class ShiftKasirController extends Controller
{
    /**
     * Buka kasir - create new shift
     */
    public function bukaKasir(BukaKasirRequest $request): JsonResponse
    {
        // Get user ID
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development

        // Validasi: tidak boleh ada shift open di lokasi yang sama
        $existingShift = ShiftKasir::where('lokasi_id', $request->lokasi_id)
            ->where('status', 'open')
            ->first();

        if ($existingShift) {
            return response()->json([
                'message' => 'Masih ada shift yang belum ditutup untuk lokasi ini. Silakan tutup shift sebelumnya terlebih dahulu.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $shift = ShiftKasir::create([
                'user_id' => $userId,
                'lokasi_id' => $request->lokasi_id,
                'saldo_awal' => $request->saldo_awal,
                'tanggal_buka' => now(),
                'status' => 'open',
                'catatan' => $request->catatan,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Shift kasir berhasil dibuka',
                'data' => new ShiftKasirResource($shift->load(['user', 'lokasi']))
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Gagal membuka shift kasir: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tutup kasir - close shift and calculate totals
     */
    public function tutupKasir(TutupKasirRequest $request, string $id): JsonResponse
    {
        $shift = ShiftKasir::findOrFail($id);

        if ($shift->status === 'closed') {
            return response()->json([
                'message' => 'Shift ini sudah ditutup sebelumnya.'
            ], 400);
        } 

        $user = $request->user();
        $userId = $user ? $user->id : 1;

        DB::beginTransaction();
        try {
            $shift->update([
                'tanggal_tutup' => now(),
                'status' => 'closed',
            ]);

            // Calculate totals from all transactions
            $totals = $shift->calculateTotals();

            // Update shift with totals and saldo akhir
            $shift->update([
                'saldo_akhir' => $request->saldo_akhir,
                'total_penjualan_cash' => $totals['total_penjualan_cash'],
                'total_penjualan_card' => $totals['total_penjualan_card'],
                'total_penjualan_qris' => $totals['total_penjualan_qris'],
                'total_penjualan_other' => $totals['total_penjualan_other'],
                'total_penjualan' => $totals['total_penjualan'],
                'total_pembelian' => $totals['total_pembelian'],
                'total_pemasukan' => $totals['total_pemasukan'],
                'total_pengeluaran' => $totals['total_pengeluaran'],
                'total_arus_kas' => $totals['total_arus_kas'],
                'catatan' => $request->catatan ?? $shift->catatan,
            ]);

            // Calculate selisih dari arus cash fisik (tanpa double-count arus_kas mirror)
            $cashFlow = $shift->calculateCashFlow();
            $expectedSaldoAkhir = $cashFlow['expected_saldo_akhir'];
            $selisih = $request->saldo_akhir - $expectedSaldoAkhir;

            $shift->update(['selisih' => $selisih]);

            DB::commit();

            return response()->json([
                'message' => 'Shift kasir berhasil ditutup',
                'data' => new ShiftKasirResource($shift->load(['user', 'lokasi', 'pesanan', 'pembelian', 'pemasukan', 'pengeluaran', 'arusKas']))
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Gagal menutup shift kasir: ' . $e->getMessage()
            ], 500);
        }
    }
 
    /**
     * Get current active shift for lokasi (bukan per user login).
     * Shift kasir adalah per lokasi — user lain yang login tetap melihat shift aktif yang sama.
     */
    public function getCurrentShift(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1;

        $lokasiId = $request->get('lokasi_id');
 
        if ($lokasiId) {
            $shift = ShiftKasir::findActiveForLokasi((int) $lokasiId, $userId);
        } else {
            // Tanpa lokasi_id: cari shift open user dulu, lalu shift open terbaru di semua lokasi
            $shift = ShiftKasir::where('user_id', $userId)
                ->where('status', 'open')
                ->orderByDesc('id')
                ->first();

            if (!$shift) {
                $shift = ShiftKasir::where('status', 'open')
                    ->orderByDesc('id')
                    ->first();
            }
        }

        if ($shift) {
            $shift->load(['user', 'lokasi']);
        }

        if (!$shift) {
            return response()->json([
                'data' => null,
                'message' => 'Tidak ada shift aktif'
            ], 200);
        }

        return response()->json([
            'data' => new ShiftKasirResource($shift)
        ]);
    }

    /**
     * Display a listing of shifts
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1;

        $query = ShiftKasir::with(['user', 'lokasi']);

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        // else {
        //     $query->where('user_id', $userId);
        // }

        // Filter by lokasi
        if ($request->has('lokasi_id')) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('tanggal_buka', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('tanggal_buka', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'tanggal_buka');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $shifts = $query->paginate($perPage);

        return response()->json([
            'data' => ShiftKasirResource::collection($shifts->items()),
            'meta' => [
                'current_page' => $shifts->currentPage(),
                'last_page' => $shifts->lastPage(),
                'per_page' => $shifts->perPage(),
                'total' => $shifts->total(),
                'from' => $shifts->firstItem(),
                'to' => $shifts->lastItem(),
            ]
        ]);
    }

    /**
     * Display the specified shift
     */
    public function show(string $id): JsonResponse
    {
        $shift = ShiftKasir::with([
            'user',
            'lokasi',
            'pesanan',
            'pembelian',
            'pemasukan',
            'pengeluaran',
            'arusKas'
        ])->findOrFail($id);

        return response()->json([
            'data' => new ShiftKasirResource($shift)
        ]);
    }

    /**
     * Input pemasukan closing shift (penjualan tunai) — satu kali per shift.
     */
    public function inputPemasukan(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $shift = ShiftKasir::findOrFail($id);

        if ($shift->status !== 'closed') {
            return response()->json([
                'message' => 'Shift belum ditutup. Input pemasukan hanya dapat dilakukan setelah closing.'
            ], 400);
        }

        if ($shift->closingArusKasQuery()->exists()) {
            return response()->json([
                'message' => 'Pemasukan shift sudah diinput untuk shift ini.'
            ], 400);
        }

        $user = $request->user();
        $userId = $user ? $user->id : 1;
 
        DB::beginTransaction();
        try {
            $closing = ArusKas::create([
                'user_id' => $userId,
                'lokasi_id' => $shift->lokasi_id,
                'shift_id' => $shift->id,
                'jenis' => 'pemasukan',
                'kategori' => 'pemasukan_kasir',
                'sub_kategori' => 'penjualan_kasir',
                'jumlah' => $request->jumlah,
                'deskripsi' => 'Closing Kasir ' . $shift->no_shift_kasir . ' (Cash)',
                'tanggal' => now()->toDateString(),
                'referensi_id' => $shift->id,
                'referensi_type' => 'ShiftKasir',
                'metode_pembayaran' => 'cash',
                'status' => true,
            ]);

            $totals = $shift->fresh()->calculateTotals();
            $shift->update(['total_arus_kas' => $totals['total_arus_kas']]);

            DB::commit();

            return response()->json([
                'message' => 'Pemasukan shift berhasil dicatat',
                'data' => $closing
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal mencatat pemasukan shift',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

