<?php

namespace App\Modules\ArusKas;

use App\Models\ArusKas;
use App\Models\MasterKas;
use App\Http\Resources\ArusKasResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ArusKasController extends Controller
{
    /**
     * Display a listing of the resource. 
     */
    public function index(Request $request): JsonResponse
    {
        $query = ArusKas::with(['lokasi', 'user', 'masterKas'])->forLaporan();

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        // Filter by jenis
        if ($request->has('jenis') && $request->jenis) {
            $query->where('jenis', $request->jenis);
        }

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }
        
        // Support legacy toko_id filter
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }
 
        if ($request->has('masuk_master_kas') && $request->masuk_master_kas !== '') {
            $query->where('masuk_master_kas', $request->boolean('masuk_master_kas'));
        }


        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deskripsi', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%")
                  ->orWhere('sub_kategori', 'like', "%{$search}%");
            });
        }

        // Sorting — default: data terbaru dulu
        $allowedSortColumns = ['tanggal', 'created_at', 'jumlah', 'id'];
        $sortBy = $request->get('sort_by', 'created_at'); 
        if (!in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }
        $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);
        if ($sortBy !== 'id') {
            $query->orderBy('id', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $arusKas = $query->paginate($perPage);

        return response()->json([
            'data' => ArusKasResource::collection($arusKas->items()),
            'meta' => [
                'current_page' => $arusKas->currentPage(),
                'last_page' => $arusKas->lastPage(),
                'per_page' => $arusKas->perPage(),
                'total' => $arusKas->total(),
                'from' => $arusKas->firstItem(),
                'to' => $arusKas->lastItem(),
            ]
        ]);
    } 

    /**
     * Get cash flow statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $query = ArusKas::query()->forLaporan();
        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal', '<=', $request->date_to);
        }

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }
        
        // Support legacy toko_id filter
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        $totalPemasukan = (clone $query)->where('jenis', 'pemasukan')->sum('jumlah');
        $totalPengeluaran = (clone $query)->where('jenis', 'pengeluaran')->sum('jumlah');
        $totalTransaksi = $query->count();
        $saldoBersih = $totalPemasukan - $totalPengeluaran;

        // Breakdown by kategori
        $breakdownPemasukan = (clone $query)
            ->where('jenis', 'pemasukan')
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori');

        $breakdownPengeluaran = (clone $query)
            ->where('jenis', 'pengeluaran')
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori')
            ->get()
            ->pluck('total', 'kategori');

        return response()->json([
            'data' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'saldo_bersih' => $saldoBersih,
                'total_transaksi' => $totalTransaksi,
                'breakdown_pemasukan' => $breakdownPemasukan,
                'breakdown_pengeluaran' => $breakdownPengeluaran,
            ]
        ]);
    }

    /**
     * Get available filter options
     */
    public function filterOptions(Request $request): JsonResponse
    {
        $kategoris = ArusKas::select('kategori')
            ->distinct()
            ->pluck('kategori');

        $subKategoris = ArusKas::whereNotNull('sub_kategori')
            ->select('sub_kategori')
            ->distinct()
            ->pluck('sub_kategori');

        $lokasis = ArusKas::with('lokasi:id,nama')
            ->select('lokasi_id')
            ->distinct()
            ->get()
            ->pluck('lokasi')
            ->filter()
            ->values();

        return response()->json([
            'data' => [
                'kategoris' => $kategoris,
                'sub_kategoris' => $subKategoris,
                'lokasi' => $lokasis,
                'toko' => $lokasis, // Keep for backward compatibility
                'jenis' => ['pemasukan', 'pengeluaran'],
                'metode_pembayaran' => ['cash', 'card', 'qris', 'other']
            ]
        ]);
    }

    /**
     * Sync arus kas entries to/from master kas via checklist (recap).
     */
    public function syncMasterKas(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:arus_kas,id',
            'action' => 'required|in:add,remove',
        ]);

        $ids = $request->input('ids');
        $action = $request->input('action');
 
        DB::beginTransaction();
        try {
            if ($action === 'add') {
                return $this->addRecapToMasterKas($request, $ids);
            }

            return $this->removeRecapFromMasterKas($ids);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal sinkronisasi master kas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function addRecapToMasterKas(Request $request, array $ids): JsonResponse
    {
        $entries = ArusKas::whereIn('id', $ids)->get();

        if ($entries->count() !== count($ids)) {
            DB::rollBack();
            return response()->json(['message' => 'Beberapa arus kas tidak ditemukan'], 422);
        }

        if ($entries->contains(fn ($e) => $e->masuk_master_kas)) {
            DB::rollBack();
            return response()->json(['message' => 'Semua arus kas harus belum masuk master kas'], 422);
        }

        $jenisList = $entries->pluck('jenis')->unique();
        if ($jenisList->count() > 1) {
            DB::rollBack();
            return response()->json(['message' => 'Recap hanya boleh dari jenis yang sama (pemasukan atau pengeluaran)'], 422);
        }

        $lokasiList = $entries->pluck('lokasi_id')->unique();
        if ($lokasiList->count() > 1) {
            DB::rollBack();
            return response()->json(['message' => 'Recap hanya boleh dari lokasi yang sama'], 422);
        }

        $jenis = $jenisList->first();
        $lokasiId = $lokasiList->first();
        $user = $request->user();
        $userId = $user ? $user->id : $entries->first()->user_id;

        $kategoriList = $entries->pluck('kategori')->unique();
        $subKategoriList = $entries->pluck('sub_kategori')->filter()->unique();

        if ($kategoriList->count() === 1) {
            $kategori = $kategoriList->first();
            $subKategori = $subKategoriList->count() === 1 ? $subKategoriList->first() : null;
        } elseif ($jenis === 'pemasukan' && $entries->every(fn ($e) => $e->kategori === 'pemasukan_kasir')) {
            $kategori = 'pemasukan_kasir';
            $subKategori = 'penjualan_kasir';
        } else {
            $kategori = 'lainnya';
            $subKategori = null;
        }

        $hasCash = $entries->contains(fn ($e) => $this->isCashMetode($e->metode_pembayaran));
        $hasNonCash = $entries->contains(fn ($e) => ! $this->isCashMetode($e->metode_pembayaran));
        if ($hasCash && $hasNonCash) { 
            DB::rollBack();
            return response()->json(['message' => 'Recap hanya boleh dari metode pembayaran yang sama (Cash atau Non Cash)'], 422);
        }
        $metodePembayaran = $this->resolveRecapMetodePembayaran($entries);
 
        $deskripsiParts = $entries->map(fn ($e) => '#' . $e->deskripsi)->implode(', ');
        $deskripsi = "Recap kas {$deskripsiParts}";

        $tanggalMax = $entries->max('tanggal');
        $count = $entries->count();

        $recap = MasterKas::create([
            'user_id' => $userId,
            'lokasi_id' => $lokasiId,
            'shift_id' => null,
            'jenis' => $jenis,
            'kategori' => $kategori,
            'sub_kategori' => $subKategori,
            'jumlah' => $entries->sum('jumlah'),
            'deskripsi' => $deskripsi,
            'tanggal' => $tanggalMax,
            'referensi_id' => null,
            'referensi_type' => 'ArusKasRecap',
            'metode_pembayaran' => $metodePembayaran,
            'status' => true,
            'is_recap' => true,
        ]);

        ArusKas::whereIn('id', $ids)->update([
            'masuk_master_kas' => true,
            'master_kas_id' => $recap->id,
        ]);

        DB::commit();

        return response()->json([
            'message' => "{$count} arus kas berhasil direkap ke 1 master kas",
            'processed' => $count,
            'master_kas_id' => $recap->id,
        ]);
    }

    private function removeRecapFromMasterKas(array $ids): JsonResponse
    {
        $entries = ArusKas::whereIn('id', $ids)->get();

        if ($entries->contains(fn ($e) => !$e->masuk_master_kas)) {
            DB::rollBack();
            return response()->json(['message' => 'Semua arus kas harus sudah masuk master kas'], 422);
        }

        $masterKasIds = $entries->pluck('master_kas_id')->filter()->unique()->values();
        if ($masterKasIds->isEmpty()) {
            DB::rollBack();
            return response()->json(['message' => 'Arus kas terpilih tidak terhubung ke master kas'], 422);
        }

        $resetCount = 0;

        foreach ($masterKasIds as $masterKasId) {
            $masterKas = MasterKas::find($masterKasId);
            if (!$masterKas || !$masterKas->is_recap) {
                continue;
            }

            $resetCount += ArusKas::where('master_kas_id', $masterKasId)->count();

            ArusKas::where('master_kas_id', $masterKasId)->update([
                'masuk_master_kas' => false,
                'master_kas_id' => null,
            ]);

            $masterKas->delete();
        }

        DB::commit();

        return response()->json([
            'message' => 'Recap master kas berhasil dikeluarkan',
            'processed' => $resetCount,
        ]);
    }

    private function isCashMetode(?string $metode): bool
    {
        return $metode === 'cash';
    }

    private function mapArusKasMetodeToMasterKas(?string $metode): string
    {
        if ($this->isCashMetode($metode)) {
            return 'cash';
        }

        $valid = ['transfer', 'qris', 'kredit', 'debit'];
        if (in_array($metode, $valid, true)) {
            return $metode;
        }

        return 'transfer';
    }

    private function resolveRecapMetodePembayaran($entries): string
    {
        $mapped = $entries->map(fn ($e) => $this->mapArusKasMetodeToMasterKas($e->metode_pembayaran));

        if ($mapped->every(fn ($m) => $m === 'cash')) {
            return 'cash';
        }

        $unique = $mapped->unique()->values();
        if ($unique->count() === 1) {
            return $unique->first();
        }

        return 'transfer';
    }
}
