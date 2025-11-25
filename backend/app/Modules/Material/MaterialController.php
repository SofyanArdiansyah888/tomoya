<?php

namespace App\Modules\Material;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Material\MaterialRequest;

class MaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Material::with(['category', 'supplier']);

        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%")
                  ->orWhere('barcode', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $query->orderBy('name', 'asc');
        $materials = $query->get();

        return response()->json([
            'data' => $materials
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MaterialRequest $request): JsonResponse
    {
        $material = Material::create($request->validated());
        return response()->json([
            'data' => $material->load(['category', 'supplier'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $material = Material::with(['category', 'supplier'])->findOrFail($id);
        return response()->json([
            'data' => $material
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MaterialRequest $request, string $id): JsonResponse
    {
        $material = Material::findOrFail($id);
        $material->update($request->validated());
        return response()->json([
            'data' => $material->load(['category', 'supplier'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $material = Material::findOrFail($id);
        $material->delete();
        return response()->json(null, 204);
    }

    /**
     * Get low stock materials
     */
    public function lowStock(): JsonResponse
    {
        $materials = Material::with(['category', 'supplier'])
            ->whereColumn('min_stock', '>', 'current_stock')
            ->orWhere('current_stock', '<=', 0)
            ->get();

        return response()->json([
            'data' => $materials
        ]);
    }
}
