<?php

namespace App\Modules\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Supplier\SupplierRequest;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::with(['produk']);
        
        // Search by nama, kode, or alamat
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('kode', 'like', "%{$searchTerm}%")
                  ->orWhere('alamat', 'like', "%{$searchTerm}%");
            });
        }
        
        // Filter by is_active
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Sort by nama
        $query->orderBy('nama', 'asc');
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = min(max((int)$perPage, 1), 100); // Limit between 1 and 100
        
        $suppliers = $query->paginate($perPage);
        
        return response()->json([
            'data' => $suppliers->items(),
            'meta' => [
                'current_page' => $suppliers->currentPage(),
                'per_page' => $suppliers->perPage(),
                'total' => $suppliers->total(),
                'last_page' => $suppliers->lastPage(),
                'from' => $suppliers->firstItem(),
                'to' => $suppliers->lastItem(),
            ],
            'links' => [
                'first' => $suppliers->url(1),
                'last' => $suppliers->url($suppliers->lastPage()),
                'prev' => $suppliers->previousPageUrl(),
                'next' => $suppliers->nextPageUrl(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SupplierRequest $request): JsonResponse
    {
        $supplier = Supplier::create($request->validated());
        return response()->json([
            'data' => $supplier->load(['produk'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $supplier = Supplier::with(['produk'])->findOrFail($id);
        return response()->json([
            'data' => $supplier
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SupplierRequest $request, string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($request->validated());
        return response()->json([
            'data' => $supplier->load(['produk'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return response()->json(null, 204);
    }

    /**
     * Get suppliers with their products count
     */
    public function withProductsCount(): JsonResponse
    {
        $suppliers = Supplier::withCount('produk')->get();
        return response()->json($suppliers);
    }

    /**
     * Get suppliers with their recipes count
     * Note: Recipes are accessed through produk relationship
     */
    public function withRecipesCount(): JsonResponse
    {
        // Get suppliers with count of produk that have resep
        $suppliers = Supplier::withCount([
            'produk as produk_with_resep_count' => function ($query) {
                $query->whereNotNull('resep_id');
            }
        ])->get();
        return response()->json($suppliers);
    }
}
