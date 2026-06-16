<?php

namespace App\Modules\Pengeluaran;

use App\Models\Pengeluaran;
use App\Models\MasterKas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Pengeluaran\PengeluaranRequest;
use App\Modules\Pengeluaran\PengeluaranResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PengeluaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pengeluaran::with(['user', 'lokasi']);

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

        // Exclude kategori
        if ($request->has('exclude_kategori') && $request->exclude_kategori) {
            $query->where('kategori', '!=', $request->exclude_kategori);
        }

        // Filter by sub_kategori
        if ($request->has('sub_kategori') && $request->sub_kategori) {
            $query->where('sub_kategori', $request->sub_kategori);
        }


        // Filter by toko
        if ($request->has('toko_id') && $request->toko_id) {
            $query->where('toko_id', $request->toko_id);
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

        $pengeluarans = $query->get();

        return response()->json([
            'data' => PengeluaranResource::collection($pengeluarans)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PengeluaranRequest $request): JsonResponse
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

            $pengeluaran = Pengeluaran::create($dataToCreate);
 
            // Create master kas (pengeluaran)
            MasterKas::create([
                'user_id' => $pengeluaran->user_id,
                'lokasi_id' => $lokasiId,
                'shift_id' => $shiftAktif ? $shiftAktif->id : null,
                'jenis' => 'pengeluaran',
                'kategori' => $pengeluaran->kategori,
                'sub_kategori' => null,
                'jumlah' => $pengeluaran->jumlah,
                'deskripsi' => $pengeluaran->nama . ($pengeluaran->deskripsi ? ': ' . $pengeluaran->deskripsi : ''),
                'tanggal' => $pengeluaran->tanggal,
                'referensi_id' => $pengeluaran->id,
                'referensi_type' => Pengeluaran::class,
                'metode_pembayaran' => $pengeluaran->metode_pembayaran,
                'status' => true,
            ]);

            DB::commit();

            return response()->json([
                'data' => new PengeluaranResource($pengeluaran->load(['user', 'lokasi']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $pengeluaran = Pengeluaran::with(['user', 'lokasi'])->findOrFail($id);

        return response()->json([
            'data' => new PengeluaranResource($pengeluaran)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PengeluaranRequest $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $pengeluaran = Pengeluaran::findOrFail($id);
            $dataToUpdate = $request->validated();

            // Map toko_id to lokasi_id for backward compatibility
            if (isset($dataToUpdate['toko_id']) && !isset($dataToUpdate['lokasi_id'])) {
                $dataToUpdate['lokasi_id'] = $dataToUpdate['toko_id'];
                unset($dataToUpdate['toko_id']);
            }

            $pengeluaran->update($dataToUpdate);
            $pengeluaran->refresh();

            $lokasiId = $pengeluaran->lokasi_id;

            // Update master kas if exists
            $masterKas = MasterKas::where('referensi_type', Pengeluaran::class)
                ->where('referensi_id', $pengeluaran->id)
                ->first();

            if ($masterKas) {
                $masterKas->update([
                    'lokasi_id' => $lokasiId,
                    'kategori' => $pengeluaran->kategori,
                    'sub_kategori' => null,
                    'jumlah' => $pengeluaran->jumlah,
                    'deskripsi' => $pengeluaran->nama . ($pengeluaran->deskripsi ? ': ' . $pengeluaran->deskripsi : ''),
                    'tanggal' => $pengeluaran->tanggal,
                    'metode_pembayaran' => $pengeluaran->metode_pembayaran,
                ]);
            } else {
                MasterKas::create([
                    'user_id' => $pengeluaran->user_id,
                    'lokasi_id' => $lokasiId,
                    'jenis' => 'pengeluaran',
                    'kategori' => $pengeluaran->kategori,
                    'sub_kategori' => null,
                    'jumlah' => $pengeluaran->jumlah,
                    'deskripsi' => $pengeluaran->nama . ($pengeluaran->deskripsi ? ': ' . $pengeluaran->deskripsi : ''),
                    'tanggal' => $pengeluaran->tanggal,
                    'referensi_id' => $pengeluaran->id,
                    'referensi_type' => Pengeluaran::class,
                    'metode_pembayaran' => $pengeluaran->metode_pembayaran,
                    'status' => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'data' => new PengeluaranResource($pengeluaran->load(['user', 'lokasi']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui pengeluaran',
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

            $pengeluaran = Pengeluaran::findOrFail($id);

            // Hapus master kas terkait
            MasterKas::where('referensi_type', Pengeluaran::class)
                ->where('referensi_id', $pengeluaran->id)
                ->delete();

            $pengeluaran->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pengeluaran berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for pengeluaran
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Pengeluaran::where('is_active', true); // Only count active pengeluaran

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

        // Exclude kategori
        if ($request->has('exclude_kategori') && $request->exclude_kategori) {
            $query->where('kategori', '!=', $request->exclude_kategori);
        }

        // Calculate totals using clone to avoid query execution issues
        $totalPengeluaran = (clone $query)->sum('jumlah');
        $totalTransaksi = (clone $query)->count();

        // Get breakdown by kategori using fresh query
        $pengeluaranByKategoriQuery = (clone $query)
            ->select('kategori', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori');

        $pengeluaranByKategoriResults = $pengeluaranByKategoriQuery->get();
        $pengeluaranByKategori = [];

        foreach ($pengeluaranByKategoriResults as $result) {
            $pengeluaranByKategori[$result->kategori] = (float) $result->total;
        }

        return response()->json([
            'data' => [
                'total_pengeluaran' => (float) ($totalPengeluaran ?? 0),
                'total_transaksi' => (int) ($totalTransaksi ?? 0),
                'pengeluaran_by_kategori' => $pengeluaranByKategori
            ]
        ]);
    }
}
