<?php

namespace App\Modules\Resep;

use App\Http\Controllers\Controller;
use App\Models\RecipeMaterial as BahanResep;
use App\Models\Recipe;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Resep\BahanResepRequest;
use App\Http\Resources\ApiResource;

class BahanResepController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BahanResep::with(['resep', 'material']);

        $bahanReseps = $query->get();
        
        return response()->json([
            'data' => ApiResource::collection($bahanReseps)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BahanResepRequest $request): JsonResponse
    {
        $bahanResep = BahanResep::create($request->validated());
        
        return response()->json([
            'data' => new ApiResource($bahanResep->load(['resep', 'material']))
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $bahanResep = BahanResep::with(['resep', 'material'])->findOrFail($id);
        return response()->json([
            'data' => new ApiResource($bahanResep)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BahanResepRequest $request, string $id): JsonResponse
    {
        $bahanResep = BahanResep::findOrFail($id);
        $bahanResep->update($request->validated());
        
        return response()->json([
            'data' => new ApiResource($bahanResep->load(['resep', 'material']))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $bahanResep = BahanResep::findOrFail($id);
        $bahanResep->delete();
        return response()->json(null, 204);
    }

    /**
     * Get bahan resep by recipe ID
     */
    public function byRecipe(string $resepId): JsonResponse
    {
        $bahanReseps = BahanResep::where('recipe_id', $resepId)
            ->with(['resep', 'material'])
            ->get();
        
        return response()->json([
            'data' => ApiResource::collection($bahanReseps)
        ]);
    }

    /**
     * Get bahan resep by product ID
     */
    public function byProduct(string $produkId): JsonResponse
    {
        $produk = Produk::findOrFail($produkId);
        
        if (!$produk->resep_id) {
            return response()->json([
                'data' => []
            ]);
        }

        $bahanReseps = BahanResep::where('recipe_id', $produk->resep_id)
            ->with(['resep', 'material'])
            ->get();
        
        return response()->json([
            'data' => ApiResource::collection($bahanReseps)
        ]);
    }
}

