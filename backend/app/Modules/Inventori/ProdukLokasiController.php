<?php

namespace App\Modules\Inventori;

use App\Http\Controllers\Controller;
use App\Models\ProdukLokasi;
use App\Models\Produk;
use App\Models\ItemLokasi;
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

        $produkLokasis = $query->get();
        return response()->json(ApiResource::collection($produkLokasis));
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
            // Get all stockable products with recipes
            $produks = Produk::where('stockable', true)
                ->whereNotNull('resep_id')
                ->with(['resep.recipeMaterials.material'])
                ->get();

            $result = [];

            foreach ($produks as $produk) {
                if (!$produk->resep || !$produk->resep->recipeMaterials || $produk->resep->recipeMaterials->isEmpty()) {
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

