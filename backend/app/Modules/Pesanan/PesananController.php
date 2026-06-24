<?php

namespace App\Modules\Pesanan;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\ItemPesanan;
use App\Models\ArusKas;
use App\Models\ItemLokasi;
use App\Models\Produk;
use App\Support\ProdukStockMovement;
use App\Models\Material;
use App\Models\ShiftKasir;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\ApiResource;
use App\Http\Resources\PesananResource;
use App\Http\Resources\PublicPesananResource;

class PesananController extends Controller
{ 
    private function resolveUserId(Request $request): int
    {
        return $request->user()?->id ?? 1;
    } 

    /**
     * Non-cash tercatat langsung di arus_kas; cash hanya saat tutup shift.
     */
    private function shouldRecordPenjualanArusKas(Pesanan $pesanan): bool
    {
        return $pesanan->payment_status === 'bayar'
            && $pesanan->metode_pembayaran !== 'cash';
    }

    private function syncPenjualanArusKas(Pesanan $pesanan, int $userId): void
    {
        $existing = ArusKas::where('referensi_type', 'Pesanan')
            ->where('referensi_id', $pesanan->id)
            ->first();

        if (!$this->shouldRecordPenjualanArusKas($pesanan)) {
            $existing?->delete();
            return;
        }

        $payload = [
            'user_id' => $userId,
            'lokasi_id' => $pesanan->lokasi_id,
            'shift_id' => $pesanan->shift_id,
            'jenis' => 'pemasukan',
            'kategori' => 'pemasukan_kasir',
            'jumlah' => $pesanan->total_jumlah,
            'subtotal' => $pesanan->subtotal ?? $pesanan->total_jumlah,
            'uang_dibayar' => $pesanan->uang_dibayar,
            'kembalian' => $pesanan->kembalian,
            'deskripsi' => "Penjualan Kasir #{$pesanan->no_pesanan}",
            'tanggal' => $pesanan->tanggal_penjualan
                ? $pesanan->tanggal_penjualan->toDateString()
                : now()->toDateString(),
            'referensi_id' => $pesanan->id,
            'referensi_type' => 'Pesanan',
            'metode_pembayaran' => $pesanan->metode_pembayaran,
            'status' => true,
        ];

        if ($existing) {
            $existing->update($payload);
        } else {
            ArusKas::create($payload);
        }
    }

    /**
     * Hitung HPP per unit untuk item pesanan berdasarkan resep dan kondisi kopi.
     */
    private function calculateItemHpp(Produk $produk, array $item): float
    {
        $resep = $produk->resep;
        if (!$resep || !$resep->recipeMaterials) {
            return 0.0;
        }

        $coffeeGrams = isset($item['coffee_grams']) ? (float) $item['coffee_grams'] : null;
        $targetMaterialId = isset($item['target_material_id']) ? (int) $item['target_material_id'] : null;

        $totalCost = 0.0;
        foreach ($resep->recipeMaterials as $recipeMaterial) {
            if (!$recipeMaterial || !$recipeMaterial->material) {
                continue;
            }

            $material = $recipeMaterial->material;
            $qtyPerProduct = (float) $recipeMaterial->quantity;

            // Jika material kopi dan ada input coffee_grams (atau target material kopi), pakai qty custom
            if ($coffeeGrams !== null && ($material->is_bahan_kopi || ($targetMaterialId && $material->id === $targetMaterialId))) {
                $qtyPerProduct = $coffeeGrams;
            }

            $unitHpp = $material->getEffectiveUnitHpp();
            $totalCost += $qtyPerProduct * $unitHpp;
        }

        return round($totalCost, 2);
    }

    private function normalizeOrderItemsStructure($items): array
    {
        return collect($items)->map(function ($item) {
            $isModel = is_object($item);

            return [
                'produk_id' => (int) ($isModel ? $item->produk_id : ($item['produk_id'] ?? 0)),
                'quantity' => (int) ($isModel ? $item->quantity : ($item['quantity'] ?? 0)),
                'harga_satuan' => round((float) ($isModel ? $item->harga : ($item['harga_satuan'] ?? $item['harga'] ?? 0)), 2),
                'coffee_grams' => $isModel
                    ? (isset($item->coffee_grams) ? round((float) $item->coffee_grams, 2) : null)
                    : (isset($item['coffee_grams']) ? round((float) $item['coffee_grams'], 2) : null),
                'coffee_strength' => $isModel
                    ? ($item->coffee_strength ?? null)
                    : ($item['coffee_strength'] ?? null),
            ];
        })->sortBy(fn ($row) => implode('-', [
            $row['produk_id'],
            $row['quantity'],
            $row['harga_satuan'],
            $row['coffee_grams'] ?? 'null',
            $row['coffee_strength'] ?? 'null',
        ]))->values()->all();
    } 

    /**
     * Normalisasi item pesanan untuk perbandingan perubahan (termasuk catatan).
     */
    private function normalizeOrderItems($items): array
    {
        return collect($items)->map(function ($item) {
            $isModel = is_object($item);
            $catatan = $isModel ? ($item->catatan ?? null) : ($item['catatan'] ?? null);
            $catatan = is_string($catatan) && trim($catatan) !== '' ? trim($catatan) : null;

            return [
                'produk_id' => (int) ($isModel ? $item->produk_id : ($item['produk_id'] ?? 0)),
                'quantity' => (int) ($isModel ? $item->quantity : ($item['quantity'] ?? 0)),
                'harga_satuan' => round((float) ($isModel ? $item->harga : ($item['harga_satuan'] ?? $item['harga'] ?? 0)), 2),
                'coffee_grams' => $isModel
                    ? null
                    : (isset($item['coffee_grams']) ? round((float) $item['coffee_grams'], 2) : null),
                'coffee_strength' => $isModel
                    ? ($item->coffee_strength ?? null)
                    : ($item['coffee_strength'] ?? null),
                'catatan' => $catatan,
            ];
        })->sortBy(fn ($row) => implode('-', [
            $row['produk_id'],
            $row['quantity'],
            $row['harga_satuan'],
            $row['coffee_grams'] ?? 'null',
            $row['coffee_strength'] ?? 'null',
            $row['catatan'] ?? 'null',
        ]))->values()->all();
    }

    private function orderItemsStructureChanged($existingItems, array $newItems): bool
    {
        return $this->normalizeOrderItemsStructure($existingItems)
            !== $this->normalizeOrderItemsStructure($newItems);
    }

    private function orderItemsHaveChanged($existingItems, array $newItems): bool
    {
        return $this->normalizeOrderItems($existingItems) !== $this->normalizeOrderItems($newItems);
    }

    private function syncItemCatatan(Pesanan $pesanan, array $items): void
    {
        $existing = $pesanan->itemPesanan()->orderBy('id')->get();

        foreach ($items as $index => $item) {
            $row = $existing->get($index);
            if (!$row) {
                continue;
            }

            $catatan = isset($item['catatan']) && is_string($item['catatan']) && trim($item['catatan']) !== ''
                ? trim($item['catatan'])
                : null;

            if ($row->catatan !== $catatan) {
                $row->update(['catatan' => $catatan]);
            }
        }
    }
 
    /**
     * Batalkan efek stok bersih pesanan (reverse pergerakan keluar yang masih tersisa).
     */ 
    private function reverseOrderStockMovements(Pesanan $pesanan, int $userId): void
    {
        $this->reverseOrderMaterialStockMovements($pesanan, $userId);
        $this->reverseOrderProdukStock($pesanan, $userId);
    }

    /**
     * Kembalikan stok material dari item_lokasi saat pesanan diubah/dibatalkan.
     */
    private function reverseOrderMaterialStockMovements(Pesanan $pesanan, int $userId): void
    {
        $netByMaterial = ItemLokasi::where('reference_type', Pesanan::class)
            ->where('reference_id', $pesanan->id)
            ->selectRaw('material_id, SUM(quantity) as net_quantity')
            ->groupBy('material_id')
            ->get();

        foreach ($netByMaterial as $row) {
            $netQuantity = (float) $row->net_quantity;
            if ($netQuantity >= 0) {
                continue;
            }

            $returnQty = abs($netQuantity);
            $currentStock = ItemLokasi::getCurrentStock($pesanan->lokasi_id, $row->material_id);
            $quantityAfter = $currentStock + $returnQty;

            ItemLokasi::create([
                'lokasi_id' => $pesanan->lokasi_id,
                'material_id' => $row->material_id,
                'tipe' => 'masuk',
                'quantity' => $returnQty,
                'quantity_before' => $currentStock,
                'quantity_after' => $quantityAfter,
                'reference_type' => Pesanan::class,
                'reference_id' => $pesanan->id,
                'keterangan' => "Rollback penjualan (Pesanan #{$pesanan->no_pesanan} - Update)",
                'user_id' => $userId,
                'tanggal' => now(),
            ]);
        }
    }

    /**
     * Kembalikan stok produk pastry (produk_lokasi) saat pesanan diubah/dibatalkan.
     */
    private function reverseOrderProdukStock(Pesanan $pesanan, int $userId): void
    { 
        foreach ($pesanan->itemPesanan as $item) {
            $produk = $item->produk ?? Produk::with('kategori')->find($item->produk_id);

            if (!$produk || !$produk->usesProdukLokasiStock((int) $pesanan->lokasi_id)) {
                continue;
            }

            ProdukStockMovement::recordOrderReversal(
                (int) $pesanan->lokasi_id,
                (int) $produk->id,
                (int) $item->quantity,
                $pesanan,
                $userId,
            );
        }
    }

    /**
     * Kurangi stok material untuk satu item pesanan.
     */
    private function deductStockForOrderItem(Pesanan $pesanan, Produk $produk, array $item, int $userId, string $keteranganSuffix = ''): void
    {
        $produk->loadMissing('kategori');

        if ($produk->usesProdukLokasiStock((int) $pesanan->lokasi_id)) {
            $this->deductProdukLokasiStock($pesanan, $produk, $item, $userId, $keteranganSuffix);

            return;
        }

        if (!$produk->stockable || !$produk->resep || !$produk->resep->recipeMaterials) {
            return;
        }

        $coffeeGrams = isset($item['coffee_grams']) ? (float) $item['coffee_grams'] : null;
        $targetMaterialId = isset($item['target_material_id']) ? (int) $item['target_material_id'] : null;
        $flaggedCoffeeMaterialId = null;

        foreach ($produk->resep->recipeMaterials as $rm) {
            if ($rm && $rm->material && ($rm->material->is_bahan_kopi ?? false)) {
                $flaggedCoffeeMaterialId = $rm->material_id;
                break;
            }
        }

        foreach ($produk->resep->recipeMaterials as $recipeMaterial) {
            if (!$recipeMaterial || !$recipeMaterial->material_id) {
                continue;
            }

            $materialId = $recipeMaterial->material_id;
            $requiredQuantityPerProduct = (float) $recipeMaterial->quantity;

            if ($coffeeGrams !== null && (($targetMaterialId && $materialId === $targetMaterialId) || ($flaggedCoffeeMaterialId && $materialId === $flaggedCoffeeMaterialId))) {
                $requiredQuantityPerProduct = $coffeeGrams;
            }

            $totalRequiredQuantity = $requiredQuantityPerProduct * $item['quantity'];
            $currentStock = ItemLokasi::getCurrentStock($pesanan->lokasi_id, $materialId);
            $quantityAfter = $currentStock - $totalRequiredQuantity;

            ItemLokasi::create([
                'lokasi_id' => $pesanan->lokasi_id,
                'material_id' => $materialId,
                'tipe' => 'keluar',
                'quantity' => -$totalRequiredQuantity,
                'quantity_before' => $currentStock,
                'quantity_after' => $quantityAfter,
                'reference_type' => Pesanan::class,
                'reference_id' => $pesanan->id,
                'keterangan' => "Penjualan produk {$produk->nama} (Pesanan #{$pesanan->no_pesanan}{$keteranganSuffix})",
                'user_id' => $userId,
                'tanggal' => now(),
            ]);
        }
    }
 
    /**
     * Kurangi stok produk jadi pastry di produk_lokasi (tanpa blokir jika stok kurang).
     */
    private function deductProdukLokasiStock(Pesanan $pesanan, Produk $produk, array $item, int $userId, string $suffix = ''): void
    {
        $qty = (int) $item['quantity'];

        ProdukStockMovement::recordOrderDeduction(
            (int) $pesanan->lokasi_id,
            (int) $produk->id,
            $qty,
            $pesanan,
            $userId,
            $suffix,
        );
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Default shop location ID is 2
        $defaultLokasiId = 2;
        
        // Get all orders from default location (shop)
        $query = Pesanan::where('lokasi_id', $defaultLokasiId)
            ->with(['itemPesanan.produk.kategori', 'lokasi', 'user']);

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('tanggal_penjualan', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('tanggal_penjualan', '<=', $request->date_to);
        }

        // Filter by payment status
        if ($request->has('status') && $request->status) {
            $query->where('payment_status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('catatan', 'like', "%{$search}%")
                  ->orWhereHas('itemPesanan', function ($q) use ($search) {
                      $q->where('catatan', 'like', "%{$search}%");
                  })
                  ->orWhereHas('itemPesanan.produk', function ($q) use ($search) {
                      $q->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'tanggal_penjualan');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $pesanans = $query->paginate($perPage);

        return response()->json([
            'data' => PesananResource::collection($pesanans->items()),
            'meta' => [
                'current_page' => $pesanans->currentPage(),
                'last_page' => $pesanans->lastPage(),
                'per_page' => $pesanans->perPage(),
                'total' => $pesanans->total(),
                'from' => $pesanans->firstItem(),
                'to' => $pesanans->lastItem(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Handle items - can be array or JSON string (from FormData)
        $items = $request->items;
        if (is_string($items)) {
            $items = json_decode($items, true);
            $request->merge(['items' => $items]);
        }
        
        $request->validate([
            'alamat_pengiriman' => 'nullable|string',
            'catatan' => 'nullable|string',
            'nama_client' => 'nullable|string|max:255',
            'gambar_qris' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'lokasi_id' => 'required|exists:lokasi,id',
            'metode_pembayaran' => 'required|in:cash,card,qris,other',
            'status' => 'nullable|in:bayar,belum_bayar',
            'subtotal' => 'nullable|numeric|min:0',
            'uang_dibayar' => 'nullable|numeric|min:0',
            'kembalian' => 'nullable|numeric|min:0',
            'items' => 'required|array',
            'items.*.produk_id' => 'required|exists:produk,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'required|numeric|min:0',
            'items.*.coffee_strength' => 'nullable|in:strong,medium,soft,other',
            'items.*.coffee_grams' => 'nullable|numeric|min:0',
            'items.*.target_material_id' => 'nullable|exists:material,id',
            'items.*.catatan' => 'nullable|string|max:500',
        ]);

        // Calculate total from items (already parsed above)
        $totalJumlah = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['harga_satuan'];
        });

        // Calculate subtotal (default to totalJumlah if not provided)
        $subtotal = $request->subtotal ?? $totalJumlah;

        // Validate payment amount for cash payment
        if ($request->metode_pembayaran === 'cash' && $request->status === 'bayar') {
            if ($request->uang_dibayar === null || $request->uang_dibayar <= 0) {
                return response()->json([
                    'message' => 'Masukkan jumlah uang yang dibayar!'
                ], 422);
            }
            if ($request->uang_dibayar < $subtotal) {
                return response()->json([
                    'message' => 'Uang dibayar tidak boleh kurang dari total!'
                ], 422);
            }
        }

        // Calculate kembalian if uang_dibayar is provided and metode_pembayaran is cash
        $uangDibayar = $request->uang_dibayar;
        $kembalian = null;
        if ($uangDibayar !== null && $request->metode_pembayaran === 'cash') {
            $kembalian = max(0, $uangDibayar - $totalJumlah);
        } elseif ($request->kembalian !== null) {
            $kembalian = $request->kembalian;
        }

        $userId = $this->resolveUserId($request);
        $shiftAktif = ShiftKasir::findActiveForLokasi((int) $request->lokasi_id, $userId);

        // Handle gambar QRIS upload
        $gambarQrisPath = null;
        if ($request->hasFile('gambar_qris') && $request->metode_pembayaran === 'qris') {
            $file = $request->file('gambar_qris');
            $filename = 'qris_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/qris', $filename);
            $gambarQrisPath = 'qris/' . $filename;
        }

        // Get payment status, default to 'belum_bayar'
        $statusPembayaran = $request->status ?? 'belum_bayar';

        // Mulai database transaction
        DB::beginTransaction();
        
        try {
            // 1. Buat pesanan
            $pesanan = Pesanan::create([
                'user_id' => $userId,
                'lokasi_id' => $request->lokasi_id,
                'shift_id' => $shiftAktif ? $shiftAktif->id : null,
                'total_jumlah' => $totalJumlah,
                'subtotal' => $subtotal,
                'uang_dibayar' => $uangDibayar,
                'kembalian' => $kembalian,
                'payment_status' => $statusPembayaran,
                'alamat_pengiriman' => $request->alamat_pengiriman ?? '',
                'catatan' => null,
                'nama_client' => $request->nama_client,
                'gambar_qris' => $gambarQrisPath,
                'metode_pembayaran' => $request->metode_pembayaran,
                'tanggal_penjualan' => now(),
            ]);

            // 2. Buat item pesanan dan kurangi stok material
            foreach ($request->items as $item) {
                $produk = Produk::with(['resep.recipeMaterials.material', 'kategori'])->find($item['produk_id']);
                if (!$produk) {
                    DB::rollback();
                    return response()->json([
                        'message' => "Produk dengan ID {$item['produk_id']} tidak ditemukan",
                    ], 404);
                }

                // Ambil HPP per unit dengan mempertimbangkan coffee_grams/target kopi
                $hppPerUnit = $this->calculateItemHpp($produk, $item);

                ItemPesanan::create([
                    'pesanan_id' => $pesanan->id,
                    'produk_id' => $item['produk_id'],
                    'quantity' => $item['quantity'],
                    'harga' => $item['harga_satuan'],
                    'hpp' => $hppPerUnit,
                    'coffee_strength' => $item['coffee_strength'] ?? null,
                    'catatan' => !empty($item['catatan']) ? trim($item['catatan']) : null,
                ]);

                $this->deductStockForOrderItem($pesanan, $produk, $item, $userId);
            }

            if ($statusPembayaran === 'bayar') {
                $this->syncPenjualanArusKas($pesanan->fresh(), $userId);
            }

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'data' => new PesananResource($pesanan->load(['itemPesanan.produk.kategori', 'lokasi']))
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal membuat pesanan: ' . $e->getMessage()], 500);
        } 
    }
 
    /**
     * Pesanan terbaru untuk layar display pelanggan (public, tanpa auth).
     */
    public function publicLatest(): JsonResponse
    {
        $pesanan = Pesanan::with(['itemPesanan.produk', 'lokasi'])
            ->orderByDesc('created_at')
            ->first();

        return response()->json([
            'data' => $pesanan ? new PublicPesananResource($pesanan) : null,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    { 
        $pesanan = Pesanan::with(['itemPesanan.produk.kategori', 'lokasi', 'user'])->findOrFail($id);
        return response()->json([
            'data' => new PesananResource($pesanan)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Handle items - can be array or JSON string (from FormData)
        $items = $request->items;
        if (is_string($items)) {
            $items = json_decode($items, true);
            $request->merge(['items' => $items]);
        }

        $pesanan = Pesanan::with(['itemPesanan'])->findOrFail($id);
        
        // Cek payment_status - hanya izinkan update jika belum_bayar
        if ($pesanan->payment_status !== 'belum_bayar') {
            return response()->json([
                'message' => 'Pesanan yang sudah dibayar tidak dapat diubah. Hanya pesanan dengan status belum bayar yang dapat diupdate.'
            ], 400);
        }
        
        $oldStatus = $pesanan->payment_status;
        // Validate request
        $validationRules = [
            'status' => 'required|in:bayar,belum_bayar',
            'alamat_pengiriman' => 'nullable|string',
            'catatan' => 'nullable|string',
            'nama_client' => 'nullable|string|max:255',
            'gambar_qris' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'metode_pembayaran' => 'nullable|in:cash,card,qris,other',
            'subtotal' => 'nullable|numeric|min:0',
            'uang_dibayar' => 'nullable|numeric|min:0',
            'kembalian' => 'nullable|numeric|min:0',
        ];

        // Only allow editing items if payment_status is 'belum_bayar'
        if ($pesanan->payment_status === 'belum_bayar' && $request->has('items')) {
            $validationRules['items'] = 'array';
            $validationRules['items.*.produk_id'] = 'required|exists:produk,id';
            $validationRules['items.*.quantity'] = 'required|integer|min:1';
            $validationRules['items.*.harga_satuan'] = 'required|numeric|min:0';
            $validationRules['items.*.coffee_strength'] = 'nullable|in:strong,medium,soft,other';
            $validationRules['items.*.coffee_grams'] = 'nullable|numeric|min:0';
            $validationRules['items.*.target_material_id'] = 'nullable|exists:material,id';
            $validationRules['items.*.catatan'] = 'nullable|string|max:500';
        }

        $request->validate($validationRules);

        $userId = $this->resolveUserId($request);
        $newStatus = $request->status;

        // Calculate subtotal and kembalian if provided
        $subtotal = $request->has('subtotal') ? $request->subtotal : $pesanan->subtotal;
        $uangDibayar = $request->has('uang_dibayar') ? $request->uang_dibayar : $pesanan->uang_dibayar;
        $kembalian = null;
        
        // Recalculate kembalian if uang_dibayar is provided and metode_pembayaran is cash
        $metodePembayaran = $request->has('metode_pembayaran') ? $request->metode_pembayaran : $pesanan->metode_pembayaran;
        $totalJumlah = $pesanan->total_jumlah;
        
        if ($request->has('items')) {
            // Recalculate total if items are updated
            $totalJumlah = collect($request->items)->sum(function ($item) {
                return $item['quantity'] * $item['harga_satuan'];
            });
        }
        
        // Use subtotal for kembalian calculation if available, otherwise use total_jumlah
        $amountForKembalian = $subtotal ?? $totalJumlah;
        
        if ($uangDibayar !== null && $metodePembayaran === 'cash') {
            $kembalian = max(0, $uangDibayar - $amountForKembalian);
        } elseif ($request->has('kembalian')) {
            $kembalian = $request->kembalian;
        } else {
            $kembalian = $pesanan->kembalian;
        }

        DB::beginTransaction();
        
        try {
            // Handle status change from 'belum_bayar' to 'bayar' - assign shift if needed
            if ($oldStatus === 'belum_bayar' && $newStatus === 'bayar') {
                $shiftAktif = ShiftKasir::findActiveForLokasi((int) $pesanan->lokasi_id, $userId);

                if ($shiftAktif && !$pesanan->shift_id) {
                    $pesanan->shift_id = $shiftAktif->id;
                    $pesanan->save();
                }
            }

            // Handle items update when struktur berubah, atau sync catatan saja
            $structureChanged = $request->has('items')
                && $this->orderItemsStructureChanged($pesanan->itemPesanan, $request->items);

            if ($pesanan->payment_status === 'belum_bayar' && $structureChanged) {
                $this->reverseOrderStockMovements($pesanan, $userId);

                $pesanan->itemPesanan()->delete();

                $totalJumlah = collect($request->items)->sum(function ($item) {
                    return $item['quantity'] * $item['harga_satuan'];
                });

                foreach ($request->items as $item) {
                    $produk = Produk::with(['resep.recipeMaterials.material', 'kategori'])->find($item['produk_id']);

                    if (!$produk) {
                        DB::rollback();
                        return response()->json([
                            'message' => "Produk dengan ID {$item['produk_id']} tidak ditemukan",
                        ], 404);
                    }

                    $hppPerUnit = $this->calculateItemHpp($produk, $item);

                    ItemPesanan::create([
                        'pesanan_id' => $pesanan->id, 
                        'produk_id' => $item['produk_id'],
                        'quantity' => $item['quantity'],
                        'harga' => $item['harga_satuan'], 
                        'hpp' => $hppPerUnit,
                        'coffee_strength' => $item['coffee_strength'] ?? null,
                        'catatan' => !empty($item['catatan']) ? trim($item['catatan']) : null,
                    ]);

                    $this->deductStockForOrderItem($pesanan, $produk, $item, $userId, ' - Update');
                }
 
                $pesanan->total_jumlah = $totalJumlah;
                if ($request->has('subtotal')) {
                    $pesanan->subtotal = $request->subtotal;
                } else {
                    $pesanan->subtotal = $totalJumlah;
                }
            } elseif ($pesanan->payment_status === 'belum_bayar' && $request->has('items')) {
                $this->syncItemCatatan($pesanan, $request->items);
            }

            // Handle gambar QRIS upload
            $gambarQrisPath = $pesanan->gambar_qris;
            if ($request->hasFile('gambar_qris') && $request->metode_pembayaran === 'qris') {
                $file = $request->file('gambar_qris');
                $filename = 'qris_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('public/qris', $filename);
                $gambarQrisPath = 'qris/' . $filename;
            }

            // Update pesanan fields
            $updateData = [];
            if ($request->has('status')) {
                $updateData['payment_status'] = $newStatus;
            }
            if ($request->has('alamat_pengiriman')) {
                $updateData['alamat_pengiriman'] = $request->alamat_pengiriman;
            }
            if ($request->has('catatan')) {
                $updateData['catatan'] = $request->catatan;
            }
            if ($request->has('nama_client')) {
                $updateData['nama_client'] = $request->nama_client;
            }
            if ($request->has('metode_pembayaran')) {
                $updateData['metode_pembayaran'] = $request->metode_pembayaran;
            }
            if ($gambarQrisPath !== $pesanan->gambar_qris) {
                $updateData['gambar_qris'] = $gambarQrisPath;
            }
            if ($request->has('subtotal')) {
                $updateData['subtotal'] = $subtotal;
            }
            if ($request->has('uang_dibayar')) {
                $updateData['uang_dibayar'] = $uangDibayar;
            }
            if ($request->has('kembalian') || ($uangDibayar !== null && $metodePembayaran === 'cash')) {
                $updateData['kembalian'] = $kembalian;
            }

            $pesanan->update($updateData);
            $pesanan->refresh();
            $this->syncPenjualanArusKas($pesanan, $userId);

            DB::commit();

            return response()->json([
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'message' => 'Pesanan berhasil diperbarui',
                'data' => new PesananResource($pesanan->load(['itemPesanan.produk.kategori', 'lokasi']))
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal memperbarui pesanan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $pesanan = Pesanan::findOrFail($id);
        $pesanan->delete();
        return response()->json(null, 204);
    }
}
