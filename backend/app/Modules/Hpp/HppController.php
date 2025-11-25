<?php

namespace App\Modules\Hpp;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Recipe;
use App\Http\Resources\HppMaterialResource;
use App\Http\Resources\HppRecipeResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HppController extends Controller
{
    /**
     * Get list of all materials with their HPP
     */
    public function indexMaterials(Request $request): JsonResponse
    {
        try {
            $query = Material::with(['category', 'supplier']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('sku', 'like', "%{$searchTerm}%")
                      ->orWhere('barcode', 'like', "%{$searchTerm}%");
                });
            }

            // Filter by active status
            if ($request->has('is_active') && $request->is_active !== '') {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Filter by category
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by supplier
            if ($request->has('supplier_id') && $request->supplier_id) {
                $query->where('supplier_id', $request->supplier_id);
            }

            // Filter by HPP availability
            if ($request->has('has_hpp') && $request->has_hpp !== '') {
                if ($request->boolean('has_hpp')) {
                    // Only materials with HPP (have purchase history)
                    $query->whereHas('itemPembelian');
                } else {
                    // Only materials without HPP
                    $query->whereDoesntHave('itemPembelian');
                }
            }

            $query->orderBy('name', 'asc');
            $materials = $query->get();

            return response()->json([
                'data' => HppMaterialResource::collection($materials)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error loading HPP materials',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get HPP detail for a specific material
     */
    public function showMaterial(string $id): JsonResponse
    {
        $material = Material::with(['category', 'supplier'])->findOrFail($id);
        
        return response()->json([
            'data' => new HppMaterialResource($material)
        ]);
    }

    /**
     * Get list of all recipes with their HPP
     */
    public function indexRecipes(Request $request): JsonResponse
    {
        try {
            $query = Recipe::with(['materials', 'recipeMaterials.material']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }

            // Filter by active status
            if ($request->has('is_active') && $request->is_active !== '') {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $query->orderBy('name', 'asc');
            $recipes = $query->get();

            return response()->json([
                'data' => HppRecipeResource::collection($recipes)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error loading HPP recipes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get HPP detail for a specific recipe
     */
    public function showRecipe(string $id): JsonResponse
    {
        $recipe = Recipe::with(['materials', 'recipeMaterials.material'])->findOrFail($id);
        
        // Ensure recipeMaterials relationship is loaded for calculateHpp
        if (!$recipe->relationLoaded('recipeMaterials')) {
            $recipe->load('recipeMaterials.material');
        }
        
        return response()->json([
            'data' => new HppRecipeResource($recipe)
        ]);
    }
}

