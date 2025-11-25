<?php

namespace App\Modules\Pembelian;

use App\Models\Pembelian;
use App\Models\ItemLokasi;
use App\Models\ArusKas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Pembelian\PembelianRequest;
use App\Modules\Pembelian\PembelianResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PembelianController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pembelian::with(['user', 'supplier', 'lokasi', 'items.material']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('no_pembelian', 'like', "%{$searchTerm}%")
                    ->orWhere('catatan', 'like', "%{$searchTerm}%")
                    ->orWhereHas('supplier', function ($q) use ($searchTerm) {
                        $q->where('nama', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Filter by supplier
        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by lokasi
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal_pembelian', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal_pembelian', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal_pembelian', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal_pembelian', '<=', $request->date_to);
        }

        // Sort by tanggal desc
        $query->orderBy('tanggal_pembelian', 'desc')
            ->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = min(max((int)$perPage, 1), 100);

        $pembelians = $query->paginate($perPage);

        return response()->json([
            'data' => PembelianResource::collection($pembelians->items()),
            'meta' => [
                'current_page' => $pembelians->currentPage(),
                'per_page' => $pembelians->perPage(),
                'total' => $pembelians->total(),
                'last_page' => $pembelians->lastPage(),
                'from' => $pembelians->firstItem(),
                'to' => $pembelians->lastItem(),
            ],
            'links' => [
                'first' => $pembelians->url(1),
                'last' => $pembelians->url($pembelians->lastPage()),
                'prev' => $pembelians->previousPageUrl(),
                'next' => $pembelians->nextPageUrl(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * Semua aksi pembelian menambah stok item_lokasi pada lokasi terkait.
     */
    public function store(PembelianRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = $request->user();
            $userId = $user ? $user->id : 1; // Fallback untuk development
            $dataToCreate = $request->validated();
            $dataToCreate['user_id'] = $userId;

            $lokasiId = isset($dataToCreate['lokasi_id']) && $dataToCreate['lokasi_id'] ? $dataToCreate['lokasi_id'] : 1;
            $dataToCreate['lokasi_id'] = $lokasiId;

            // Cek apakah ada shift aktif untuk user dan lokasi
            $shiftAktif = \App\Models\ShiftKasir::where('user_id', $dataToCreate['user_id'])
                ->where('lokasi_id', $lokasiId)
                ->where('status', 'open')
                ->first();

            if ($shiftAktif) {
                $dataToCreate['shift_id'] = $shiftAktif->id;
            }

            // Create pembelian
            $pembelian = Pembelian::create($dataToCreate);

            // Create items & record stock movement
            foreach ($request->items as $item) {
                $pembelian->items()->create([
                    'material_id' => $item['material_id'],
                    'quantity' => $item['quantity'],
                    'harga_satuan' => $item['harga_satuan'],
                ]);

                // Get current stock
                $currentStock = ItemLokasi::getCurrentStock($lokasiId, $item['material_id']) ?? 0;
                $quantityAfter = $currentStock + $item['quantity'];

                // Record stock movement (masuk)

                $dataToCreate = [
                    'lokasi_id' => $lokasiId,
                    'material_id' => $item['material_id'],
                    'tipe' => 'masuk',
                    'reference_type' => Pembelian::class,
                    'reference_id' => $pembelian->id,
                    'keterangan' => 'Pembelian material dari supplier',
                    'user_id' => $pembelian->user_id,
                    'tanggal' => $pembelian->tanggal_pembelian,
                ];
                if ($lokasiId == '1') {
                    $dataToCreate['quantity_gudang'] = $item['quantity'];
                    $dataToCreate['quantity_gudang_before'] = $currentStock;
                    $dataToCreate['quantity_gudang_after'] = $quantityAfter;
                    $dataToCreate['quantity'] = null;
                    $dataToCreate['quantity_before'] = null;
                    $dataToCreate['quantity_after'] = null;
                } else if ($lokasiId == '2') {
                    $dataToCreate['quantity'] = $item['quantity'];
                    $dataToCreate['quantity_before'] = $currentStock;
                    $dataToCreate['quantity_after'] = $quantityAfter;
                    $dataToCreate['quantity_gudang'] = null;
                    $dataToCreate['quantity_gudang_before'] = null;
                    $dataToCreate['quantity_gudang_after'] = null;
                }
                ItemLokasi::create($dataToCreate);
            }

            // Update total harga
            $pembelian->updateTotalHarga();

            // Create arus kas (pengeluaran dari pembelian)
            // Map metode_pembayaran: cash, transfer, credit -> cash, transfer, kredit
            $metodePembayaranArusKas = $pembelian->metode_pembayaran === 'credit' ? 'kredit' : $pembelian->metode_pembayaran;

            ArusKas::create([
                'user_id' => $pembelian->user_id,
                'lokasi_id' => $lokasiId,
                'shift_id' => $shiftAktif ? $shiftAktif->id : null,
                'jenis' => 'pengeluaran',
                'kategori' => 'pembelian_bahan_baku',
                'sub_kategori' => 'pembelian_bahan',
                'jumlah' => $pembelian->total_harga,
                'deskripsi' => "Pembelian Bahan Baku #{$pembelian->no_pembelian}",
                'tanggal' => $pembelian->tanggal_pembelian,
                'referensi_id' => $pembelian->id,
                'referensi_type' => Pembelian::class,
                'metode_pembayaran' => $metodePembayaranArusKas,
                'status' => 'confirmed'
            ]);

            DB::commit();

            return response()->json([
                'data' => new PembelianResource($pembelian->load(['user', 'supplier', 'lokasi', 'items.material']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat pembelian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $pembelian = Pembelian::with(['user', 'supplier', 'lokasi', 'items.material'])->findOrFail($id);

        return response()->json([
            'data' => new PembelianResource($pembelian)
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Semua perubahan pembelian mengubah stok item_lokasi sesuai perubahan item.
     */
    public function update(PembelianRequest $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $pembelian = Pembelian::findOrFail($id);

            // Simpan snapshot item lama (untuk rollback stok item_lokasi)
            $oldItems = $pembelian->items()->get(['material_id', 'quantity'])->toArray();
            $oldItemQtyMap = [];
            foreach ($oldItems as $oldItem) {
                $oldItemQtyMap[$oldItem['material_id']] = $oldItem['quantity'];
            }
            $lokasiId = $request->input('lokasi_id', $pembelian->lokasi_id); // Fallback lokasi jika user tidak kirim field

            // Update pembelian data
            $dataToUpdate = $request->except('items');
            $pembelian->update($dataToUpdate);
            $pembelian->refresh(); // Refresh untuk mendapatkan data terbaru

            // Update items if provided
            if ($request->has('items')) {
                // Rollback stok: record movement keluar untuk item lama
                foreach ($oldItemQtyMap as $materialId => $qty) {
                    $currentStock = ItemLokasi::getCurrentStock($lokasiId, $materialId);
                    $quantityAfter = max(0, $currentStock - $qty);

                    // Record stock movement (keluar) untuk rollback
                    ItemLokasi::create([
                        'lokasi_id' => $lokasiId,
                        'material_id' => $materialId,
                        'tipe' => 'keluar',
                        'quantity' => -$qty,
                        'quantity_before' => $currentStock,
                        'quantity_after' => $quantityAfter,
                        'reference_type' => Pembelian::class,
                        'reference_id' => $pembelian->id,
                        'keterangan' => 'Rollback pembelian (update)',
                        'user_id' => $pembelian->user_id,
                        'tanggal' => now(),
                    ]);
                }

                // Delete existing items
                $pembelian->items()->delete();

                // Tambah items baru dan record movement masuk
                foreach ($request->items as $item) {
                    $pembelian->items()->create([
                        'material_id' => $item['material_id'],
                        'quantity' => $item['quantity'],
                        'harga_satuan' => $item['harga_satuan'],
                    ]);

                    // Get current stock after rollback
                    $currentStock = ItemLokasi::getCurrentStock($lokasiId, $item['material_id']);
                    $quantityAfter = $currentStock + $item['quantity'];

                    // Record stock movement (masuk) untuk item baru
                    ItemLokasi::create([
                        'lokasi_id' => $lokasiId,
                        'material_id' => $item['material_id'],
                        'tipe' => 'masuk',
                        'quantity' => $item['quantity'],
                        'quantity_before' => $currentStock,
                        'quantity_after' => $quantityAfter,
                        'reference_type' => Pembelian::class,
                        'reference_id' => $pembelian->id,
                        'keterangan' => 'Pembelian material dari supplier (update)',
                        'user_id' => $pembelian->user_id,
                        'tanggal' => $pembelian->tanggal_pembelian,
                    ]);
                }

                // Update total harga
                $pembelian->updateTotalHarga();
            } else {
                // Jika items tidak diupdate, pastikan total_harga tetap akurat
                $pembelian->updateTotalHarga();
            }

            // Refresh untuk mendapatkan total_harga terbaru
            $pembelian->refresh();

            // Update arus kas jika total harga atau metode pembayaran berubah
            $arusKas = ArusKas::where('referensi_type', Pembelian::class)
                ->where('referensi_id', $pembelian->id)
                ->first();

            if ($arusKas) {
                // Map metode_pembayaran: cash, transfer, credit -> cash, transfer, kredit
                $metodePembayaranArusKas = $pembelian->metode_pembayaran === 'credit' ? 'kredit' : $pembelian->metode_pembayaran;

                $arusKas->update([
                    'lokasi_id' => $lokasiId,
                    'jumlah' => $pembelian->total_harga,
                    'deskripsi' => "Pembelian Bahan Baku #{$pembelian->no_pembelian}",
                    'tanggal' => $pembelian->tanggal_pembelian,
                    'metode_pembayaran' => $metodePembayaranArusKas,
                ]);
            } else {
                // Create arus kas jika belum ada (untuk pembelian lama yang belum punya arus kas)
                $metodePembayaranArusKas = $pembelian->metode_pembayaran === 'credit' ? 'kredit' : $pembelian->metode_pembayaran;

                ArusKas::create([
                    'user_id' => $pembelian->user_id,
                    'lokasi_id' => $lokasiId,
                    'jenis' => 'pengeluaran',
                    'kategori' => 'pembelian_bahan_baku',
                    'sub_kategori' => 'bahan_mentah',
                    'jumlah' => $pembelian->total_harga,
                    'deskripsi' => "Pembelian Bahan Baku #{$pembelian->no_pembelian}",
                    'tanggal' => $pembelian->tanggal_pembelian,
                    'referensi_id' => $pembelian->id,
                    'referensi_type' => Pembelian::class,
                    'metode_pembayaran' => $metodePembayaranArusKas,
                    'status' => 'confirmed'
                ]);
            }

            DB::commit();

            return response()->json([
                'data' => new PembelianResource($pembelian->load(['user', 'supplier', 'lokasi', 'items.material']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui pembelian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * Hapus pembelian harus rollback stok item_lokasi.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $pembelian = Pembelian::findOrFail($id);

            // Rollback stok: record movement keluar untuk semua item pembelian
            $items = $pembelian->items()->get(['material_id', 'quantity']);
            $lokasiId = $pembelian->lokasi_id;
            foreach ($items as $item) {
                $currentStock = ItemLokasi::getCurrentStock($lokasiId, $item->material_id);
                $quantityAfter = max(0, $currentStock - $item->quantity);

                // Record stock movement (keluar) untuk rollback
                ItemLokasi::create([
                    'lokasi_id' => $lokasiId,
                    'material_id' => $item->material_id,
                    'tipe' => 'keluar',
                    'quantity' => -$item->quantity,
                    'quantity_before' => $currentStock,
                    'quantity_after' => $quantityAfter,
                    'reference_type' => Pembelian::class,
                    'reference_id' => $pembelian->id,
                    'keterangan' => 'Rollback pembelian (delete)',
                    'user_id' => $pembelian->user_id,
                    'tanggal' => now(),
                ]);
            }

            // Hapus arus kas terkait
            ArusKas::where('referensi_type', Pembelian::class)
                ->where('referensi_id', $pembelian->id)
                ->delete();

            $pembelian->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pembelian berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus pembelian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Pembelian::query();

        // Filter by date range
        if ($request->has('date_from') && $request->date_from && $request->has('date_to') && $request->date_to) {
            // If date_from and date_to are the same, use whereDate for exact match
            if ($request->date_from === $request->date_to) {
                $query->whereDate('tanggal_pembelian', $request->date_from);
            } else {
                // Use whereBetween for date range
                $query->whereBetween('tanggal_pembelian', [$request->date_from, $request->date_to]);
            }
        } elseif ($request->has('date_from') && $request->date_from) {
            $query->where('tanggal_pembelian', '>=', $request->date_from);
        } elseif ($request->has('date_to') && $request->date_to) {
            $query->where('tanggal_pembelian', '<=', $request->date_to);
        }

        $totalPembelian = $query->count();
        $totalPengeluaran = $query->sum('total_harga');

        return response()->json([
            'data' => [
                'total_pembelian' => $totalPembelian,
                'total_pengeluaran' => $totalPengeluaran,
            ]
        ]);
    }
}
