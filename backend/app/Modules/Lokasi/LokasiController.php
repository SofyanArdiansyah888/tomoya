<?php

namespace App\Modules\Lokasi;

use App\Http\Controllers\Controller;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ApiResource;

class LokasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lokasi::with(['produkLokasi.produk']);

        // Filter berdasarkan tipe jika ada
        if ($request->has('tipe')) {
            $query->where('tipe', $request->tipe);
        }

        $lokasis = $query->get();
        return response()->json(ApiResource::collection($lokasis));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:lokasi,kode',
            'alamat' => 'required|string',
            'tipe' => 'required|in:gudang,toko',
            'is_active' => 'boolean',
        ]);

        $lokasi = Lokasi::create($request->all());
        return response()->json(new ApiResource($lokasi->load(['produkLokasi.produk'])), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $lokasi = Lokasi::with(['produkLokasi.produk'])->findOrFail($id);
        return response()->json(new ApiResource($lokasi));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'kode' => 'sometimes|required|string|max:50|unique:lokasi,kode,' . $id,
            'alamat' => 'sometimes|required|string',
            'tipe' => 'sometimes|required|in:gudang,toko',
            'is_active' => 'boolean',
        ]);

        $lokasi = Lokasi::findOrFail($id);
        $lokasi->update($request->all());

        return response()->json(new ApiResource($lokasi->load(['produkLokasi.produk'])));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $lokasi = Lokasi::findOrFail($id);
        $lokasi->delete();
        return response()->json(null, 204);
    }

    /**
     * Get gudang only
     */
    public function gudang(): JsonResponse
    {
        $gudangs = Lokasi::gudang()
            ->where('is_active', true)
            ->orderBy('nama', 'asc')
            ->get();
        return response()->json(ApiResource::collection($gudangs));
    }

    /**
     * Get toko only
     */
    public function toko(): JsonResponse
    {
        $tokos = Lokasi::toko()->with(['produkLokasi.produk'])->get();
        return response()->json(ApiResource::collection($tokos));
    }
}
