<?php

namespace App\Modules\Inventori;

use App\Http\Controllers\Controller;
use App\Models\ProdukLokasi;
use App\Models\Produk;
use App\Models\Lokasi;
use App\Models\ItemLokasi;
use App\Support\StockDivision;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse; 
use App\Http\Resources\ApiResource;

class ProdukLokasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProdukLokasi::with(['lokasi', 'produk']);

        // Filter berdasarkan tipe lokasi jika ada
        if ($request->has('tipe_lokasi')) {
            if ($request->tipe_lokasi === 'gudang') {
                $query->gudang();
            } elseif ($request->tipe_lokasi === 'toko') {
                $query->toko();
            }
        }

        // Filter berdasarkan lokasi_id jika ada
        if ($request->has('lokasi_id')) {
            $query->where('lokasi_id', $request->lokasi_id);
        }
 
        // Filter berdasarkan produk_id jika ada
        if ($request->has('produk_id')) {
            $query->where('produk_id', $request->produk_id);
        }

        $produkLokasis = $query->get();
        return response()->json(ApiResource::collection($produkLokasis));
    }

    /**
     * Get current product stock by location type (for Stok Toko Pastry).
     * When stock_division is set, includes all products in that division (qty 0 if no record).
     */
    public function getCurrentStock(Request $request): JsonResponse
    {
        $tipeLokasi = $request->get('tipe_lokasi', 'toko');
        $lokasiId = $request->get('lokasi_id');
        $stockDivision = $request->get('stock_division');

        $lokasiQuery = Lokasi::where('tipe', $tipeLokasi);
        if ($lokasiId) {
            $lokasiQuery->where('id', $lokasiId);
        }
        $lokasis = $lokasiQuery->get();

        $result = [];

        if ($stockDivision && StockDivision::isValidDivision($stockDivision)) {
            $produks = Produk::with('kategori')
                ->stockDivision($stockDivision)
                ->orderBy('nama')
                ->get();

            foreach ($lokasis as $lokasi) {
                foreach ($produks as $produk) {
                    $result[] = $this->buildProdukStockRow($lokasi, $produk);
                }
            }
        } else {
            $query = ProdukLokasi::with(['lokasi', 'produk.kategori'])
                ->whereHas('lokasi', function ($q) use ($tipeLokasi) {
                    $q->where('tipe', $tipeLokasi);
                });

            if ($lokasiId) {
                $query->where('lokasi_id', $lokasiId);
            }

            foreach ($query->get() as $record) {
                if (!$record->produk || !$record->lokasi) {
                    continue;
                }
                $result[] = $this->buildProdukStockRow($record->lokasi, $record->produk, $record);
            }
        }

        return response()->json(['data' => $result]);
    }

    private function buildProdukStockRow(Lokasi $lokasi, Produk $produk, ?ProdukLokasi $record = null): array
    {
        if ($record === null) {
            $record = ProdukLokasi::where('lokasi_id', $lokasi->id)
                ->where('produk_id', $produk->id)
                ->first();
        }

        $quantity = $record->quantity ?? 0;

        return [
            'lokasi_id' => $lokasi->id,
            'produk_id' => $produk->id,
            'quantity' => $quantity,
            'available_quantity' => $record->available_quantity ?? $quantity,
            'min_stock_level' => $record->min_stock_level ?? 0,
            'lokasi' => [
                'id' => $lokasi->id,
                'nama' => $lokasi->nama,
                'kode' => $lokasi->kode,
                'alamat' => $lokasi->alamat,
                'tipe' => $lokasi->tipe,
            ],
            'produk' => [
                'id' => $produk->id,
                'nama' => $produk->nama,
                'kode' => $produk->kode,
                'harga' => (float) $produk->harga,
                'kategori' => $produk->kategori ? [
                    'id' => $produk->kategori->id,
                    'nama' => $produk->kategori->nama,
                ] : null,
            ],
            'last_updated' => $record?->last_updated_at?->toIso8601String(),
        ];
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'lokasi_id' => 'required|exists:lokasi,id',
            'produk_id' => 'required|exists:produk,id',
            'quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
        ]);

        $produkLokasi = ProdukLokasi::create($request->all());
        return response()->json(new ApiResource($produkLokasi->load(['lokasi', 'produk'])), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $produkLokasi = ProdukLokasi::with(['lokasi', 'produk'])->findOrFail($id);
        return response()->json(new ApiResource($produkLokasi));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'quantity' => 'sometimes|required|integer|min:0',
            'min_stock_level' => 'sometimes|required|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'reorder_point' => 'sometimes|required|integer|min:0',
        ]);

        $produkLokasi = ProdukLokasi::findOrFail($id);
        $produkLokasi->update($request->all());

        return response()->json(new ApiResource($produkLokasi->load(['lokasi', 'produk'])));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $produkLokasi = ProdukLokasi::findOrFail($id);
        $produkLokasi->delete();
        return response()->json(null, 204);
    }

    /**
     * Get low stock products
     */
    public function lowStock(Request $request): JsonResponse
    {
        $query = ProdukLokasi::whereRaw('quantity <= min_stock_level')
            ->with(['lokasi', 'produk']);

        // Filter berdasarkan tipe lokasi jika ada
        if ($request->has('tipe_lokasi')) {
            if ($request->tipe_lokasi === 'gudang') {
                $query->gudang();
            } elseif ($request->tipe_lokasi === 'toko') {
                $query->toko();
            }
        }

        $lowStockProducts = $query->get();
        return response()->json(ApiResource::collection($lowStockProducts));
    }

    /**
     * Get product stock calculated from recipe materials
     * Returns stock quantity for each product based on available materials in recipe
     */
    public function getProductStockByRecipe(Request $request): JsonResponse
    {
        $lokasiId = $request->get('lokasi_id');
        
        if (!$lokasiId) {
            return response()->json(['message' => 'lokasi_id is required'], 400);
        }

        try {
            $pastryCategoryIds = StockDivision::pastryCategoryIds();

            $produks = Produk::with(['resep.recipeMaterials.material', 'kategori'])
                ->where(function ($query) use ($pastryCategoryIds, $lokasiId) {
                    $query->where('stockable', true)
                        ->orWhereIn('kategori_id', $pastryCategoryIds)
                        ->orWhereIn('id', function ($sub) use ($lokasiId) {
                            $sub->select('produk_id')
                                ->from('produk_lokasi')
                                ->where('lokasi_id', $lokasiId);
                        });
                })
                ->get();

            $result = []; 

            foreach ($produks as $produk) {
                $produk->loadMissing('kategori');

                if ($produk->usesProdukLokasiStock((int) $lokasiId)) {
                    $result[] = [
                        'produk_id' => $produk->id,
                        'quantity' => ProdukLokasi::getQuantityAtLocation((int) $lokasiId, (int) $produk->id),
                    ];
                    continue;
                }

                if (!$produk->stockable || !$produk->resep || !$produk->resep->recipeMaterials || $produk->resep->recipeMaterials->isEmpty()) {
                    // Product has no recipe or no materials, stock is 0
                    $result[] = [
                        'produk_id' => $produk->id,
                        'quantity' => 0
                    ];
                    continue;
                }

                $minStock = PHP_INT_MAX;
                $hasInsufficientStock = false;

                // Calculate how many products can be made based on each material
                foreach ($produk->resep->recipeMaterials as $recipeMaterial) {
                    $materialId = $recipeMaterial->material_id;
                    $requiredQuantity = (float)$recipeMaterial->quantity;

                    if ($requiredQuantity <= 0) {
                        continue;
                    }

                    // Get current stock of material at location
                    $materialStock = ItemLokasi::getCurrentStock($lokasiId, $materialId);

                    // Calculate how many products can be made with this material
                    // If material stock is 0, product stock is 0
                    if ($materialStock <= 0) {
                        $minStock = 0;
                        $hasInsufficientStock = true;
                        break;
                    }

                    // Calculate: material_stock / required_quantity_per_product
                    $productsFromMaterial = floor($materialStock / $requiredQuantity);
                    $minStock = min($minStock, $productsFromMaterial);
                }

                // If any material is insufficient, stock is 0
                $finalStock = $hasInsufficientStock ? 0 : ($minStock === PHP_INT_MAX ? 0 : (int)$minStock);

                $result[] = [
                    'produk_id' => $produk->id,
                    'quantity' => $finalStock
                ];
            }

            return response()->json([
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error calculating product stock: ' . $e->getMessage(),
                'error' => $e->getTraceAsString()
            ], 500);
        }
    }
}

