<?php

namespace App\Modules\Kategori;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Kategori\KategoriRequest;

class KategoriController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Kategori::with('produk');
        
        // Search by nama or deskripsi
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('deskripsi', 'like', "%{$searchTerm}%");
            });
        }
        
        // Filter by is_active
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Sort by nama
        $query->orderBy('created_at', 'asc');
        
        $kategoris = $query->get();
        
        return response()->json([
            'data' => $kategoris
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(KategoriRequest $request): JsonResponse
    {
        $kategori = Kategori::create($request->validated());
        return response()->json([
            'data' => $kategori
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $kategori = Kategori::with('produk')->findOrFail($id);
        return response()->json([
            'data' => $kategori
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(KategoriRequest $request, string $id): JsonResponse
    {
        $kategori = Kategori::findOrFail($id);
        $kategori->update($request->validated());
        return response()->json([
            'data' => $kategori
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $kategori = Kategori::findOrFail($id);
        $kategori->delete();
        return response()->json(null, 204);
    }
}
