<?php

namespace App\Modules\Produk;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Produk\ProdukRequest;
use App\Http\Resources\ApiResource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProdukController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Produk::with(['kategori', 'supplier', 'resep']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('kode', 'like', "%{$searchTerm}%")
                  ->orWhereHas('kategori', function ($categoryQuery) use ($searchTerm) {
                      $categoryQuery->where('nama', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by kategori_id
        if ($request->has('kategori_id') && $request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Filter by is_active
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by favorite
        if ($request->has('favorite') && $request->boolean('favorite')) {
            $query->where('favorite', true);
        }

        $produks = $query->get();
        
        return response()->json([
            'data' => ApiResource::collection($produks)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProdukRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Auto-generate kode if not provided
        if (empty($data['kode'])) {
            $data['kode'] = $this->generateProductCode();
        }
        
        $produk = Produk::create($data);
        return response()->json([
            'data' => new ApiResource($produk->load(['kategori', 'supplier', 'resep']))
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $produk = Produk::with(['kategori', 'supplier', 'resep'])->findOrFail($id);
        return response()->json([
            'data' => new ApiResource($produk)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProdukRequest $request, string $id): JsonResponse
    {
        $produk = Produk::findOrFail($id);
        $data = $request->validated();
        
        // Auto-generate kode if not provided and current kode is empty
        if (empty($data['kode']) && empty($produk->kode)) {
            $data['kode'] = $this->generateProductCode();
        }
        
        $produk->update($data);
        return response()->json([
            'data' => new ApiResource($produk->load(['kategori', 'supplier', 'resep']))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $produk = Produk::findOrFail($id);
        $produkId = (int) $produk->id;
 
        if ($message = $this->buildItemPesananBlockMessage($produkId)) {
            return response()->json(['message' => $message], 422);
        }

        try {
            DB::transaction(function () use ($produkId) {
                DB::table('produk_lokasi')->where('produk_id', $produkId)->delete();
                // Bersihkan item pesanan yatim (pesanan sudah tidak ada)
                DB::table('item_pesanan')->where('produk_id', $produkId)->delete();
                DB::table('produk')->where('id', $produkId)->delete();
            });

            return response()->json(null, 204);
        } catch (Throwable $e) {
            return response()->json([
                'message' => $this->resolveDeleteErrorMessage($e, $produkId),
            ], 422);
        }
    }

    /**
     * Blokir hapus hanya jika produk masih dipakai di pesanan yang masih ada.
     */
    private function buildItemPesananBlockMessage(int $produkId): ?string
    {
        $linkedPesanan = DB::table('item_pesanan')
            ->join('pesanan', 'pesanan.id', '=', 'item_pesanan.pesanan_id')
            ->where('item_pesanan.produk_id', $produkId)
            ->select('pesanan.no_pesanan')
            ->distinct()
            ->pluck('no_pesanan')
            ->filter()
            ->values();

        if ($linkedPesanan->isEmpty()) {
            return null;
        }

        $itemCount = DB::table('item_pesanan')
            ->join('pesanan', 'pesanan.id', '=', 'item_pesanan.pesanan_id')
            ->where('item_pesanan.produk_id', $produkId)
            ->count();

        $displayNos = $linkedPesanan->take(5)->implode(', ');
        $message = "Produk tidak dapat dihapus karena masih digunakan dalam {$itemCount} item pesanan ({$displayNos}";

        if ($linkedPesanan->count() > 5) {
            $message .= ', dan ' . ($linkedPesanan->count() - 5) . ' pesanan lainnya';
        }

        return $message . ').';
    }

    private function resolveDeleteErrorMessage(Throwable $e, int $produkId): string
    {
        if ($message = $this->buildItemPesananBlockMessage($produkId)) {
            return $message;
        }

        return 'Produk tidak dapat dihapus karena masih digunakan di data lain.';
    }

    /**
     * Toggle favorite status of a product
     */
    public function toggleFavorite(string $id): JsonResponse
    {
        $produk = Produk::findOrFail($id);
        $produk->favorite = !$produk->favorite;
        $produk->save();
        
        return response()->json([
            'data' => new ApiResource($produk->load(['kategori', 'supplier', 'resep']))
        ]);
    }

    /**
     * Generate unique product code
     */
    private function generateProductCode(): string
    {
        $prefix = 'PRD';
        $lastProduct = Produk::orderBy('id', 'desc')->first();
        
        if ($lastProduct && $lastProduct->kode) {
            // Extract number from last kode
            preg_match('/' . preg_quote($prefix) . '(\d+)/', $lastProduct->kode, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
        } else {
            $lastNumber = 0;
        }
        
        $newNumber = $lastNumber + 1;
        $kode = $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        
        // Ensure uniqueness
        while (Produk::where('kode', $kode)->exists()) {
            $newNumber++;
            $kode = $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        }
        
        return $kode;
    }
}
