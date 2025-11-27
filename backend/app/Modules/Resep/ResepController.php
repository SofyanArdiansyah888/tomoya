<?php

namespace App\Modules\Resep;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\Produk;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Resep\ResepRequest;
use App\Http\Resources\ApiResource;
use Illuminate\Support\Facades\DB;

class ResepController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::with(['materials']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('is_kopi') && $request->is_kopi !== '') {
            $query->where('is_kopi', $request->boolean('is_kopi'));
        }

        $recipes = $query->get();
        
        return response()->json([
            'data' => ApiResource::collection($recipes)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ResepRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $materials = $data['materials'] ?? [];
            unset($data['materials']);

            $recipe = Recipe::create($data);

            // Create recipe materials
            foreach ($materials as $material) {
                $recipe->materials()->attach($material['material_id'], [
                    'quantity' => $material['quantity'],
                    'unit' => $material['unit'],
                    'cost' => $material['cost'] ?? null,
                ]);
            }

            DB::commit();
            
            return response()->json([
                'data' => new ApiResource($recipe->load(['materials']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat resep: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $recipe = Recipe::with(['materials'])->findOrFail($id);
        return response()->json([
            'data' => new ApiResource($recipe)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ResepRequest $request, string $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $recipe = Recipe::findOrFail($id);
            $data = $request->validated();
            $materials = $data['materials'] ?? [];
            unset($data['materials']);

            $recipe->update($data);

            // Sync recipe materials
            $recipe->materials()->detach();
            foreach ($materials as $material) {
                $recipe->materials()->attach($material['material_id'], [
                    'quantity' => $material['quantity'],
                    'unit' => $material['unit'],
                    'cost' => $material['cost'] ?? null,
                ]);
            }

            DB::commit();
            
            return response()->json([
                'data' => new ApiResource($recipe->load(['materials']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal mengupdate resep: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $recipe = Recipe::findOrFail($id);
        $recipe->delete();
        return response()->json(null, 204);
    }

    /**
     * Calculate recipe cost
     */
    public function calculateCost(string $id): JsonResponse
    {
        $recipe = Recipe::with(['materials'])->findOrFail($id);
        
        $totalCost = 0;
        foreach ($recipe->materials as $material) {
            $totalCost += ($material->pivot->quantity * ($material->pivot->cost ?? 0));
        }

        return response()->json([
            'recipe_id' => $recipe->id,
            'recipe_name' => $recipe->name,
            'total_cost' => $totalCost,
            'yield_quantity' => $recipe->yield_quantity,
            'cost_per_unit' => $recipe->yield_quantity > 0 ? $totalCost / $recipe->yield_quantity : 0
        ]);
    }

    /**
     * Get products list for recipe
     */
    public function getProducts(): JsonResponse
    {
        $products = Produk::where('stockable', true)->get();
        return response()->json([
            'data' => ApiResource::collection($products)
        ]);
    }

    /**
     * Get materials list for recipe
     */
    public function getMaterials(): JsonResponse
    {
        $materials = Material::where('is_active', true)->get();
        return response()->json([
            'data' => ApiResource::collection($materials)
        ]);
    }
}

