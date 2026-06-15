<?php

namespace App\Modules\Pemasukan;

use App\Models\Pemasukan;
use App\Models\MasterKas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Pemasukan\PemasukanRequest;
use App\Modules\Pemasukan\PemasukanResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PemasukanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pemasukan::with(['user', 'lokasi']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                    ->orWhere('deskripsi', 'like', "%{$searchTerm}%")
                    ->orWhere('referensi', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by sub_kategori
        if ($request->has('sub_kategori') && $request->sub_kategori) {
            $query->where('sub_kategori', $request->sub_kategori);
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
        if ($request->has('tanggal_dari') && $request->tanggal_dari) {
            $query->where('tanggal', '>=', $request->tanggal_dari);
        }

        if ($request->has('tanggal_sampai') && $request->tanggal_sampai) {
            $query->where('tanggal', '<=', $request->tanggal_sampai);
        }

        // Filter by is_active
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sort by tanggal desc
        $query->orderBy('tanggal', 'desc');

        $pemasukans = $query->get();

        return response()->json([
            'data' => PemasukanResource::collection($pemasukans)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PemasukanRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = $request->user();
            $userId = $user ? $user->id : 1; // Fallback untuk development
            $dataToCreate = $request->validated();
            $dataToCreate['user_id'] = $userId;

            // Map toko_id to lokasi_id for backward compatibility
            if (isset($dataToCreate['toko_id']) && !isset($dataToCreate['lokasi_id'])) {
                $dataToCreate['lokasi_id'] = $dataToCreate['toko_id'];
                unset($dataToCreate['toko_id']);
            }

            $lokasiId = $dataToCreate['lokasi_id'] ?? 1;

            // Cek apakah ada shift aktif untuk user dan lokasi
            $shiftAktif = \App\Models\ShiftKasir::where('user_id', $dataToCreate['user_id'])
                ->where('lokasi_id', $lokasiId)
                ->where('status', 'open')
                ->first();

            if ($shiftAktif) {
                $dataToCreate['shift_id'] = $shiftAktif->id;
            }

            $pemasukan = Pemasukan::create($dataToCreate);
 
            // Map kategori pemasukan to kategori master kas
            $kategoriMasterKas = $this->mapKategoriPemasukanToMasterKas($pemasukan->kategori);

            // Create master kas (pemasukan)
            MasterKas::create([
                'user_id' => $pemasukan->user_id,
                'lokasi_id' => $lokasiId,
                'shift_id' => $shiftAktif ? $shiftAktif->id : null,
                'jenis' => 'pemasukan',
                'kategori' => $kategoriMasterKas,
                'sub_kategori' => null,
                'jumlah' => $pemasukan->jumlah,
                'deskripsi' => $pemasukan->nama . ($pemasukan->deskripsi ? ': ' . $pemasukan->deskripsi : ''),
                'tanggal' => $pemasukan->tanggal,
                'referensi_id' => $pemasukan->id,
                'referensi_type' => Pemasukan::class,
                'metode_pembayaran' => $pemasukan->metode_pembayaran,
                'status' => true,
            ]);
 
            DB::commit();

            return response()->json([
                'data' => new PemasukanResource($pemasukan->load(['user', 'lokasi']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat pemasukan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map kategori pemasukan to kategori arus kas
     */
    private function mapKategoriPemasukanToMasterKas(string $kategoriPemasukan): string
    {
        // Kategori pemasukan sekarang sudah sama dengan kategori arus kas
        $mapping = [
            'pemasukan_kasir' => 'pemasukan_kasir',
            'pemasukan_non_kasir' => 'pemasukan_non_kasir',
            'lainnya' => 'lainnya',
        ];

        return $mapping[$kategoriPemasukan] ?? 'lainnya';
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $pemasukan = Pemasukan::with(['user', 'lokasi'])->findOrFail($id);

        return response()->json([
            'data' => new PemasukanResource($pemasukan)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PemasukanRequest $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $pemasukan = Pemasukan::findOrFail($id);
            $dataToUpdate = $request->validated();

            // Map toko_id to lokasi_id for backward compatibility
            if (isset($dataToUpdate['toko_id']) && !isset($dataToUpdate['lokasi_id'])) {
                $dataToUpdate['lokasi_id'] = $dataToUpdate['toko_id'];
                unset($dataToUpdate['toko_id']);
            }

            $pemasukan->update($dataToUpdate);
            $pemasukan->refresh();

            $lokasiId = $pemasukan->lokasi_id;

            // Update master kas if exists
            $masterKas = MasterKas::where('referensi_type', Pemasukan::class)
                ->where('referensi_id', $pemasukan->id)
                ->first();

            if ($masterKas) {
                $kategoriMasterKas = $this->mapKategoriPemasukanToMasterKas($pemasukan->kategori);

                $masterKas->update([
                    'lokasi_id' => $lokasiId,
                    'kategori' => $kategoriMasterKas,
                    'sub_kategori' => null,
                    'jumlah' => $pemasukan->jumlah,
                    'deskripsi' => $pemasukan->nama . ($pemasukan->deskripsi ? ': ' . $pemasukan->deskripsi : ''),
                    'tanggal' => $pemasukan->tanggal,
                    'metode_pembayaran' => $pemasukan->metode_pembayaran,
                ]);
            } else {
                $kategoriMasterKas = $this->mapKategoriPemasukanToMasterKas($pemasukan->kategori);

                MasterKas::create([
                    'user_id' => $pemasukan->user_id,
                    'lokasi_id' => $lokasiId,
                    'jenis' => 'pemasukan',
                    'kategori' => $kategoriMasterKas,
                    'sub_kategori' => null,
                    'jumlah' => $pemasukan->jumlah,
                    'deskripsi' => $pemasukan->nama . ($pemasukan->deskripsi ? ': ' . $pemasukan->deskripsi : ''),
                    'tanggal' => $pemasukan->tanggal,
                    'referensi_id' => $pemasukan->id,
                    'referensi_type' => Pemasukan::class,
                    'metode_pembayaran' => $pemasukan->metode_pembayaran,
                    'status' => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'data' => new PemasukanResource($pemasukan->load(['user', 'lokasi']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui pemasukan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $pemasukan = Pemasukan::findOrFail($id);

            // Hapus master kas terkait
            MasterKas::where('referensi_type', Pemasukan::class)
                ->where('referensi_id', $pemasukan->id)
                ->delete();

            $pemasukan->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pemasukan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus pemasukan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for pemasukan
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Pemasukan::where('is_active', true); // Only count active pemasukan

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        // Support legacy toko_id filter
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('lokasi_id', $request->toko_id);
        }

        // Filter by date range
        if ($request->has('tanggal_dari') && $request->tanggal_dari) {
            $query->where('tanggal', '>=', $request->tanggal_dari);
        }

        if ($request->has('tanggal_sampai') && $request->tanggal_sampai) {
            $query->where('tanggal', '<=', $request->tanggal_sampai);
        }

        // Calculate totals using clone to avoid query execution issues
        $totalPemasukan = (clone $query)->sum('jumlah');
        $totalTransaksi = (clone $query)->count();

        // Get breakdown by kategori using fresh query
        $pemasukanByKategoriQuery = (clone $query)
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori');

        $pemasukanByKategoriResults = $pemasukanByKategoriQuery->get();
        $pemasukanByKategori = [];

        foreach ($pemasukanByKategoriResults as $result) {
            $pemasukanByKategori[$result->kategori] = (float) $result->total;
        }

        return response()->json([
            'data' => [
                'total_pemasukan' => (float) ($totalPemasukan ?? 0),
                'total_transaksi' => (int) ($totalTransaksi ?? 0),
                'pemasukan_by_kategori' => $pemasukanByKategori
            ]
        ]);
    }
}
