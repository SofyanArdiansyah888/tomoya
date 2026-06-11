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

        // Validasi: tidak boleh ada shift yang masih open untuk user dan lokasi yang sama
        $existingShift = ShiftKasir::where('user_id', $userId)
            ->where('lokasi_id', $request->lokasi_id)
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

        DB::beginTransaction();
        try {
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
                'tanggal_tutup' => now(),
                'status' => 'closed',
                'catatan' => $request->catatan ?? $shift->catatan,
            ]);

            // Calculate selisih: saldo_akhir - (saldo_awal + total cash masuk - total cash keluar)
            // Total cash masuk: penjualan cash (menggunakan uang_dibayar jika ada) + pemasukan cash + arus kas pemasukan cash
            // Untuk pemasukan dan arus kas, gunakan uang_dibayar jika ada, otherwise jumlah
            $totalPemasukanCash = $shift->pemasukan()
                ->where('metode_pembayaran', 'cash')
                ->get()
                ->sum(function ($pemasukan) {
                    return $pemasukan->uang_dibayar ?? $pemasukan->jumlah;
                });
            
            $totalArusKasPemasukanCash = $shift->arusKas()
                ->where('jenis', 'pemasukan')
                ->where('metode_pembayaran', 'cash')
                ->get()
                ->sum(function ($arusKas) {
                    return $arusKas->uang_dibayar ?? $arusKas->jumlah;
                });
            
            $totalCashMasuk = $totals['total_penjualan_cash'] + $totalPemasukanCash + $totalArusKasPemasukanCash;
            
            // Total cash keluar: pengeluaran cash + pembelian cash + arus kas pengeluaran cash
            $totalCashKeluar = $shift->pengeluaran()->where('metode_pembayaran', 'cash')->sum('jumlah') +
                $shift->pembelian()->where('metode_pembayaran', 'cash')->sum('total_harga') +
                $shift->arusKas()->where('jenis', 'pengeluaran')->where('metode_pembayaran', 'cash')->sum('jumlah');

            // Expected saldo akhir = saldo awal + cash masuk - cash keluar
            $expectedSaldoAkhir = $shift->saldo_awal + $totalCashMasuk - $totalCashKeluar;
            
            // Selisih = actual saldo akhir - expected saldo akhir
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
     * Get current active shift for user/lokasi
     */
    public function getCurrentShift(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1;

        $lokasiId = $request->get('lokasi_id');

        $query = ShiftKasir::where('user_id', $userId)
            ->where('status', 'open');

        if ($lokasiId) {
            $query->where('lokasi_id', $lokasiId);
        }

        $shift = $query->with(['user', 'lokasi'])->first();

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
     * Input pemasukan oleh PIC setelah shift kasir ditutup (sekali per shift)
     */
    public function inputPemasukan(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development

        $request->validate([
            'jumlah' => 'required|numeric|min:0.01',
        ]);

        $shift = ShiftKasir::findOrFail($id);

        // if ($shift->status !== 'closed') {
        //     return response()->json([
        //         'message' => 'Shift belum ditutup. Input pemasukan hanya dapat dilakukan setelah closing.'
        //     ], 400);
        // }

        $existing = ArusKas::where('referensi_type', 'ShiftKasir')
            ->where('referensi_id', $shift->id)
            ->where('jenis', 'pemasukan')
            ->where('kategori', 'pemasukan_kasir')
            ->where('sub_kategori', 'penjualan_kasir')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Input pemasukan untuk shift ini sudah dilakukan'
            ], 409);
        }

        DB::beginTransaction();
        try {
            $nomorTutup = $shift->no_shift_kasir;
            $deskripsi = 'Closing Kasir ' . $nomorTutup;

            $arus = ArusKas::create([
                'user_id' => $userId,
                'lokasi_id' => $shift->lokasi_id,
                'shift_id' => $shift->id,
                'jenis' => 'pemasukan',
                'kategori' => 'pemasukan_kasir',
                'sub_kategori' => 'penjualan_kasir',
                'jumlah' => $request->jumlah,
                'deskripsi' => $deskripsi,
                'tanggal' => now()->toDateString(),
                'referensi_id' => $shift->id,
                'referensi_type' => 'ShiftKasir',
                'metode_pembayaran' => 'cash',
                'status' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pemasukan shift berhasil dicatat',
                'data' => $arus
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

