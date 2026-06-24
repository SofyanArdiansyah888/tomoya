<?php

namespace App\Modules\Inventori;

use App\Http\Controllers\Controller;
use App\Models\ItemLokasi;
use App\Models\Lokasi;
use App\Models\MixPreparation;
use App\Models\Pembelian;
use Illuminate\Http\Request; 
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ApiResource;
use App\Models\Material;
use App\Support\StockDivision;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;

class ItemLokasiController extends Controller
{
    /**
     * Get current stock by location type (gudang/toko)
     * Returns aggregated stock data grouped by lokasi_id and material_id
     */
    public function getCurrentStock(Request $request): JsonResponse
    {
        $tipeLokasi = $request->get('tipe_lokasi', 'gudang'); // default gudang
        $lokasiId = $request->get('lokasi_id');
        $stockDivision = $request->get('stock_division');

        // Get all locations of the specified type
        $lokasiQuery = Lokasi::where('tipe', $tipeLokasi);
        if ($lokasiId) {
            $lokasiQuery->where('id', $lokasiId);
        }
        $lokasis = $lokasiQuery->get();

        $result = [];

        if ($stockDivision && StockDivision::isValidDivision($stockDivision)) {
            $materials = Material::with('category') 
                ->stockDivision($stockDivision)
                ->orderBy('name')
                ->get();

            foreach ($lokasis as $lokasi) {
                foreach ($materials as $material) {
                    $result[] = $this->buildCurrentStockRow($lokasi, $material, $tipeLokasi);
                }
            }
        } else {
            foreach ($lokasis as $lokasi) {
                $materialIds = ItemLokasi::where('lokasi_id', $lokasi->id)
                    ->distinct()
                    ->pluck('material_id')
                    ->toArray();

                foreach ($materialIds as $materialId) {
                    $material = Material::with('category')->find($materialId);

                    if ($material) {
                        $result[] = $this->buildCurrentStockRow($lokasi, $material, $tipeLokasi);
                    }
                }
            }
        }

        return response()->json([
            'data' => $result
        ]);
    }

    private function buildCurrentStockRow(Lokasi $lokasi, Material $material, string $tipeLokasi): array
    {
        $currentStock = $tipeLokasi === 'gudang'
            ? ItemLokasi::getCurrentGudangStock($lokasi->id, $material->id)
            : ItemLokasi::getCurrentStock($lokasi->id, $material->id);

        $latestRecord = ItemLokasi::where('lokasi_id', $lokasi->id)
            ->where('material_id', $material->id)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        return [
            'lokasi_id' => $lokasi->id,
            'material_id' => $material->id,
            'quantity' => $currentStock,
            'lokasi' => [
                'id' => $lokasi->id,
                'nama' => $lokasi->nama,
                'kode' => $lokasi->kode,
                'alamat' => $lokasi->alamat,
                'tipe' => $lokasi->tipe,
            ],
            'material' => [
                'id' => $material->id,
                'name' => $material->name,
                'sku' => $material->sku,
                'unit' => $material->unit,
                'purchase_price' => (float) $material->purchase_price,
                'min_stock' => $material->min_stock ?? 0,
                'unit_gudang' => $material->unit_gudang,
                'min_stok_gudang' => $material->min_stok_gudang ?? 0,
                'nilai_konversi' => $material->nilai_konversi ?? 0,
                'barcode' => $material->barcode ?? '',
                'is_active' => $material->is_active ?? false,
                'category_id' => $material->category_id,
                'category' => $material->category ? [
                    'id' => $material->category->id,
                    'nama' => $material->category->nama,
                ] : null,
            ],
            'last_updated' => $latestRecord && $latestRecord->tanggal ? $latestRecord->tanggal->toIso8601String() : null,
        ];
    }

    /**
     * Get stock history for a specific location and material
     */
    public function getStockHistory(Request $request): JsonResponse
    {
        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'material_id' => 'required|exists:material,id',
        ]);

        $history = ItemLokasi::where('lokasi_id', $request->lokasi_id)
            ->where('material_id', $request->material_id)
            ->with(['lokasi', 'material', 'user'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(ApiResource::collection($history));
    }

    /**
     * Get all stock movements (pergerakan stok)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ItemLokasi::with([
            'lokasi', 
            'material',
            'user',
            'reference' => fn (MorphTo $morphTo) => $morphTo->morphWith([
                MixPreparation::class => ['outputProduk', 'outputMaterial'],
                Pembelian::class => [],
            ]),
        ]);

        // Filter by lokasi_id if provided
        if ($request->has('lokasi_id') && $request->lokasi_id) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        // Filter by material_id if provided
        if ($request->has('material_id') && $request->material_id) {
            $query->where('material_id', $request->material_id);
        }

        // Filter by tipe lokasi (gudang/toko)
        if ($request->has('tipe_lokasi') && $request->tipe_lokasi) {
            if ($request->tipe_lokasi === 'gudang') {
                $query->gudang();
            } elseif ($request->tipe_lokasi === 'toko') {
                $query->toko();
            }
        }

        // Filter by tipe movement (masuk/keluar/transfer/adjustment)
        if ($request->has('tipe') && $request->tipe) {
            $query->where('tipe', $request->tipe);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('tanggal', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('tanggal', '<=', $request->date_to);
        }

        // Order by tanggal desc (newest first)
        $query->orderBy('tanggal', 'desc')
              ->orderBy('id', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = min(max((int)$perPage, 1), 100);

        $movements = $query->paginate($perPage);

        return response()->json([
            'data' => ApiResource::collection($movements->items()),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'per_page' => $movements->perPage(),
                'total' => $movements->total(),
                'last_page' => $movements->lastPage(),
                'from' => $movements->firstItem(),
                'to' => $movements->lastItem(),
            ],
            'links' => [
                'first' => $movements->url(1),
                'last' => $movements->url($movements->lastPage()),
                'prev' => $movements->previousPageUrl(),
                'next' => $movements->nextPageUrl(),
            ]
        ]);
    }

    /**
     * Transfer stock from gudang to toko
     */
    public function transferStock(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development
        $request->validate([
            'lokasi_tujuan_id' => 'required|exists:lokasi,id',
            'material_id' => 'required|exists:material,id',
            'quantity' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get default gudang (id = 1) or first active gudang
            $lokasiAsal = Lokasi::gudang()
                ->where('is_active', true)
                ->orderBy('id', 'asc')
                ->first();

            if (!$lokasiAsal) {
                return response()->json([
                    'message' => 'Tidak ada gudang aktif ditemukan'
                ], 400);
            }

            $lokasiTujuan = Lokasi::findOrFail($request->lokasi_tujuan_id);

            // Validate lokasi types
            if ($lokasiTujuan->tipe !== 'toko') {
                return response()->json([
                    'message' => 'Lokasi tujuan harus berupa toko'
                ], 400);
            }

            // Check stock availability at source (gudang) - use quantity_gudang
            $currentGudangStock = ItemLokasi::getCurrentGudangStock($lokasiAsal->id, $request->material_id);
            
            if ($currentGudangStock < $request->quantity) {
                return response()->json([
                    'message' => 'Stok gudang tidak mencukupi. Stok tersedia: ' . $currentGudangStock
                ], 400);
            }

            // Record movement keluar from gudang
            // Update quantity_gudang fields for gudang, quantity fields remain null
            $quantityGudangAfter = $currentGudangStock - $request->quantity;
            ItemLokasi::create([
                'lokasi_id' => $lokasiAsal->id,
                'material_id' => $request->material_id,
                'tipe' => 'keluar',
                'quantity' => null, // Not used for gudang transfer
                'quantity_before' => null, // Not used for gudang transfer
                'quantity_after' => null, // Not used for gudang transfer
                'quantity_gudang' => -$request->quantity, // Negative for keluar
                'quantity_gudang_before' => $currentGudangStock,
                'quantity_gudang_after' => $quantityGudangAfter,
                'reference_type' => null,
                'reference_id' => null,
                'keterangan' => $request->keterangan || "Transfer stok ke {$lokasiTujuan->nama}",
                'user_id' =>  $userId,
                'tanggal' => now(),
            ]);

            // Record movement masuk to toko
            $nilaiKonversi = Material::find($request->material_id)->nilai_konversi ?? 0;
            $quantityBefore = ItemLokasi::getCurrentStock($request->lokasi_tujuan_id, $request->material_id);
            $quantityAfter = $quantityBefore + $request->quantity * $nilaiKonversi;
            ItemLokasi::create([
                'lokasi_id' => $request->lokasi_tujuan_id,
                'material_id' => $request->material_id,
                'tipe' => 'masuk',
                'quantity' => $request->quantity * $nilaiKonversi,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reference_type' => null,
                'reference_id' => null,
                'keterangan' => $request->keterangan || "Transfer stok dari {$lokasiAsal->nama}",
                'user_id' =>  $userId,
                'tanggal' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Transfer stok berhasil dilakukan',
                'data' => [
                    'lokasi_asal' => $lokasiAsal->nama,
                    'lokasi_tujuan' => $lokasiTujuan->nama,
                    'material_id' => $request->material_id,
                    'quantity' => $request->quantity,
                    'stok_gudang_setelah' => $quantityGudangAfter,
                    'stok_tujuan_setelah' => $quantityAfter,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal melakukan transfer stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adjust stock at toko
     */
    public function adjustStock(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development
        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'material_id' => 'required|exists:material,id',
            'quantity' => 'required|integer', // Can be positive or negative
            'keterangan' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $lokasi = Lokasi::findOrFail($request->lokasi_id);

            // Validate lokasi type must be toko
            if ($lokasi->tipe !== 'toko') {
                return response()->json([
                    'message' => 'Lokasi harus berupa toko'
                ], 400);
            }

            // Get current stock
            $currentStock = ItemLokasi::getCurrentStock($request->lokasi_id, $request->material_id);
            
            // Calculate new stock after adjustment
            $quantityAfter = $currentStock + $request->quantity;

            // Prevent negative stock
            if ($quantityAfter < 0) {
                return response()->json([
                    'message' => 'Stok tidak boleh negatif. Stok saat ini: ' . $currentStock
                ], 400);
            }

            // Record adjustment movement for toko
            ItemLokasi::create([
                'lokasi_id' => $request->lokasi_id,
                'material_id' => $request->material_id,
                'tipe' => 'adjustment',
                'quantity' => $request->quantity, // Can be positive or negative
                'quantity_before' => $currentStock,
                'quantity_after' => $quantityAfter,
                'quantity_gudang' => null, // Not used for toko adjustment
                'quantity_gudang_before' => null,
                'quantity_gudang_after' => null,
                'reference_type' => null,
                'reference_id' => null,
                'keterangan' => $request->keterangan,
                'user_id' => $userId,
                'tanggal' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Adjustment stok toko berhasil dilakukan',
                'data' => [
                    'lokasi' => $lokasi->nama,
                    'material_id' => $request->material_id,
                    'quantity_adjustment' => $request->quantity,
                    'stok_sebelum' => $currentStock,
                    'stok_sesudah' => $quantityAfter,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal melakukan adjustment stok toko',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adjust stock at gudang
     * Only updates quantity_gudang fields, quantity fields remain null
     */
    public function adjustGudangStock(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user ? $user->id : 1; // Fallback untuk development
        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'material_id' => 'required|exists:material,id',
            'quantity' => 'required|integer', // Can be positive or negative
            'keterangan' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $lokasi = Lokasi::findOrFail($request->lokasi_id);

            // Validate lokasi type must be gudang
            if ($lokasi->tipe !== 'gudang') {
                return response()->json([
                    'message' => 'Lokasi harus berupa gudang'
                ], 400);
            }

            // Get current gudang stock
            $currentGudangStock = ItemLokasi::getCurrentGudangStock($request->lokasi_id, $request->material_id);
            
            // Calculate new gudang stock after adjustment
            $quantityGudangAfter = $currentGudangStock + $request->quantity;

            // Prevent negative stock
            if ($quantityGudangAfter < 0) {
                return response()->json([
                    'message' => 'Stok gudang tidak boleh negatif. Stok gudang saat ini: ' . $currentGudangStock
                ], 400);
            }

            // Record adjustment movement for gudang
            // Only quantity_gudang fields are filled, quantity fields remain null
            ItemLokasi::create([
                'lokasi_id' => $request->lokasi_id,
                'material_id' => $request->material_id,
                'tipe' => 'adjustment',
                'quantity' => null, // Not used for gudang adjustment
                'quantity_before' => null, // Not used for gudang adjustment
                'quantity_after' => null, // Not used for gudang adjustment
                'quantity_gudang' => $request->quantity, // Adjustment value
                'quantity_gudang_before' => $currentGudangStock,
                'quantity_gudang_after' => $quantityGudangAfter,
                'reference_type' => null,
                'reference_id' => null,
                'keterangan' => $request->keterangan,
                'user_id' => $userId,
                'tanggal' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Adjustment stok gudang berhasil dilakukan',
                'data' => [
                    'lokasi' => $lokasi->nama,
                    'material_id' => $request->material_id,
                    'quantity_adjustment' => $request->quantity,
                    'stok_gudang_sebelum' => $currentGudangStock,
                    'stok_gudang_sesudah' => $quantityGudangAfter,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal melakukan adjustment stok gudang',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock materials by location type (gudang/toko)
     * Returns materials where current_stock <= min_stock
     */
    public function getLowStockMaterials(Request $request): JsonResponse
    {
        $tipeLokasi = $request->get('tipe_lokasi'); // 'gudang' or 'toko'
        $lokasiId = $request->get('lokasi_id');

        // Get all locations of the specified type
        $lokasiQuery = Lokasi::where('is_active', true);
        
        if ($tipeLokasi) {
            $lokasiQuery->where('tipe', $tipeLokasi);
        }
        
        if ($lokasiId) {
            $lokasiQuery->where('id', $lokasiId);
        }
        
        $lokasis = $lokasiQuery->get();

        $result = [];

        // Get all active materials instead of only those in item_lokasi
        $materials = Material::where('is_active', true)->get();

        foreach ($lokasis as $lokasi) {
            foreach ($materials as $material) {
                // Get current stock using the appropriate helper method
                // For gudang, use getCurrentGudangStock; for toko, use getCurrentStock
                $currentStock = $tipeLokasi === 'gudang' 
                    ? ItemLokasi::getCurrentGudangStock($lokasi->id, $material->id)
                    : ItemLokasi::getCurrentStock($lokasi->id, $material->id);

                // Use appropriate min_stock based on location type
                // For gudang, use min_stok_gudang; for toko, use min_stock
                $minStock = $tipeLokasi === 'gudang' 
                    ? ($material->min_stok_gudang ?? 0)
                    : ($material->min_stock ?? 0);
                
                // Check if stock is low (current_stock <= min_stock)
                // Include if:
                // 1. min_stock > 0 AND current_stock <= min_stock (normal case)
                // 2. OR current_stock = 0 (always show out of stock materials)
                if (($minStock > 0 && $currentStock <= $minStock) || $currentStock === 0) {
                    // Get latest item_lokasi record for last_updated timestamp
                    $latestRecord = ItemLokasi::where('lokasi_id', $lokasi->id)
                        ->where('material_id', $material->id)
                        ->orderBy('tanggal', 'desc')
                        ->orderBy('id', 'desc')
                        ->first();
                    
                    // Determine unit based on location type
                    $unit = $tipeLokasi === 'gudang' 
                        ? ($material->unit_gudang ?? '')
                        : ($material->unit ?? '');
                    
                    $result[] = [
                        'lokasi_id' => $lokasi->id,
                        'material_id' => $material->id,
                        'current_stock' => $currentStock,
                        'min_stock' => $minStock,
                        'lokasi' => [
                            'id' => $lokasi->id,
                            'nama' => $lokasi->nama,
                            'kode' => $lokasi->kode,
                            'alamat' => $lokasi->alamat,
                            'tipe' => $lokasi->tipe,
                        ],
                        'material' => [
                            'id' => $material->id,
                            'name' => $material->name,
                            'sku' => $material->sku,
                            'unit' => $unit,
                            'unit_gudang' => $material->unit_gudang ?? '',
                            'purchase_price' => (float) $material->purchase_price,
                            'min_stock' => $minStock,
                            'min_stok_gudang' => $material->min_stok_gudang ?? 0,
                            'category_id' => $material->category_id, 
                        ], 
                        'last_updated' => $latestRecord && $latestRecord->tanggal ? $latestRecord->tanggal->toIso8601String() : null,
                    ];
                }
            }
        }

        // Sort by current_stock ascending (lowest first)
        usort($result, function ($a, $b) {
            return $a['current_stock'] <=> $b['current_stock'];
        });

        return response()->json([
            'data' => $result
        ]);
    }
}

