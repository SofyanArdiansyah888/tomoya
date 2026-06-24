<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\Autentikasi\AutentikasiController;
use App\Modules\Produk\ProdukController;
use App\Modules\Kategori\KategoriController;
use App\Modules\Pesanan\PesananController;
use App\Modules\Pengguna\PenggunaController;
use App\Modules\Lokasi\LokasiController;
use App\Modules\Inventori\ProdukLokasiController;
use App\Modules\Inventori\ItemLokasiController;
use App\Modules\Inventori\MixPreparationController;
use App\Modules\Supplier\SupplierController;
use App\Modules\Material\MaterialController;
use App\Modules\Resep\ResepController;
use App\Modules\Resep\BahanResepController;
use App\Modules\ArusKas\ArusKasController;
use App\Modules\MasterKas\MasterKasController;
use App\Modules\Pemasukan\PemasukanController;
use App\Modules\Pengeluaran\PengeluaranController;
use App\Modules\Pembelian\PembelianController;
use App\Modules\ShiftKasir\ShiftKasirController;
use App\Modules\Hpp\HppController;
use App\Modules\Hpp\HppPenjualanController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/register', [AutentikasiController::class, 'register']);
Route::post('/login', [AutentikasiController::class, 'login']);
 
Route::get('/public/pesanan/terbaru', [PesananController::class, 'publicLatest']);

// Protected routes
Route::middleware(['auth:sanctum', 'api.auth'])->group(function () {
    // User routes 
    Route::get('/user', [AutentikasiController::class, 'me']);
    Route::post('/logout', [AutentikasiController::class, 'logout']);

    // Kategori API
    Route::apiResource('kategori', KategoriController::class);

    // Produk API
    Route::apiResource('produk', ProdukController::class);
    Route::post('produk/{id}/toggle-favorite', [ProdukController::class, 'toggleFavorite']);


    // Pesanan API
    Route::apiResource('pesanan', PesananController::class);

    // Pengguna API
    Route::apiResource('pengguna', PenggunaController::class);

    // Lokasi API
    Route::apiResource('lokasi', LokasiController::class);
    Route::get('lokasi/gudang', [LokasiController::class, 'gudang']);
    Route::get('lokasi/toko', [LokasiController::class, 'toko']);
 
    // Produk Lokasi API 
    Route::get('produk-lokasi/stock-by-recipe', [ProdukLokasiController::class, 'getProductStockByRecipe']);
    Route::get('produk-lokasi/low-stock', [ProdukLokasiController::class, 'lowStock']);
    Route::get('produk-lokasi/current-stock', [ProdukLokasiController::class, 'getCurrentStock']);
    Route::get('produk-lokasi/pergerakan', [ProdukLokasiController::class, 'getPergerakan']);
    Route::post('produk-lokasi/adjust', [ProdukLokasiController::class, 'adjustStock']);
    Route::apiResource('produk-lokasi', ProdukLokasiController::class);

    // Item Lokasi API (Material Stock)
    Route::get('item-lokasi', [ItemLokasiController::class, 'index']);
    Route::get('item-lokasi/current-stock', [ItemLokasiController::class, 'getCurrentStock']);
    Route::get('item-lokasi/low-stock', [ItemLokasiController::class, 'getLowStockMaterials']);
    Route::get('item-lokasi/history', [ItemLokasiController::class, 'getStockHistory']);
    Route::post('item-lokasi/transfer', [ItemLokasiController::class, 'transferStock']);
    Route::post('item-lokasi/adjust', [ItemLokasiController::class, 'adjustStock']); // For toko only
    Route::post('item-lokasi/adjust-gudang', [ItemLokasiController::class, 'adjustGudangStock']); // For gudang only
    // Mix Preparation API
    Route::get('mix-preparation', [MixPreparationController::class, 'index']);
    Route::get('mix-preparation/{id}', [MixPreparationController::class, 'show']);
    Route::post('mix-preparation', [MixPreparationController::class, 'create']);

    // Supplier API
    Route::apiResource('supplier', SupplierController::class);
    Route::get('supplier/products/count', [SupplierController::class, 'withProductsCount']);
    Route::get('supplier/recipes/count', [SupplierController::class, 'withRecipesCount']);

    // Material API
    Route::apiResource('material', MaterialController::class);
    Route::get('material/low-stock', [MaterialController::class, 'lowStock']);

    // Recipe API
    Route::apiResource('recipes', ResepController::class);
    Route::get('recipes/{id}/calculate-cost', [ResepController::class, 'calculateCost']);
    Route::get('recipes/products/list', [ResepController::class, 'getProducts']);
    Route::get('recipes/materials/list', [ResepController::class, 'getMaterials']);

    // Recipe Ingredients API
    Route::apiResource('bahan-resep', BahanResepController::class);
    Route::get('bahan-resep/recipe/{resepId}', [BahanResepController::class, 'byRecipe']);
    Route::get('bahan-resep/product/{produkId}', [BahanResepController::class, 'byProduct']);

    // HPP API
    Route::get('hpp/material', [HppController::class, 'indexMaterials']);
    Route::get('hpp/material/{id}', [HppController::class, 'showMaterial']);
    Route::get('hpp/recipes', [HppController::class, 'indexRecipes']);
    Route::get('hpp/recipe/{id}', [HppController::class, 'showRecipe']);
    Route::get('hpp/penjualan', [HppPenjualanController::class, 'index']);

    // Arus Kas API
    Route::get('arus-kas', [ArusKasController::class, 'index']);
    Route::get('arus-kas/stats', [ArusKasController::class, 'stats']);
    Route::get('arus-kas/filter-options', [ArusKasController::class, 'filterOptions']);
    Route::post('arus-kas/sync-master-kas', [ArusKasController::class, 'syncMasterKas']);
 
    // Master Kas API
    Route::get('master-kas', [MasterKasController::class, 'index']);
    Route::get('master-kas/stats', [MasterKasController::class, 'stats']);
    Route::get('master-kas/filter-options', [MasterKasController::class, 'filterOptions']);

    // Pengeluaran API
    Route::get('pengeluaran/statistics', [PengeluaranController::class, 'statistics']);
    Route::apiResource('pengeluaran', PengeluaranController::class);

    // Pemasukan API
    Route::get('pemasukan/statistics', [PemasukanController::class, 'statistics']);
    Route::apiResource('pemasukan', PemasukanController::class);

    // Pembelian API
    Route::get('pembelian/stats/overview', [PembelianController::class, 'statistics']);
    Route::apiResource('pembelian', PembelianController::class);

    // Shift Kasir API
    Route::post('shift-kasir/buka', [ShiftKasirController::class, 'bukaKasir']);
    Route::post('shift-kasir/{id}/tutup', [ShiftKasirController::class, 'tutupKasir']);
    Route::get('shift-kasir/current', [ShiftKasirController::class, 'getCurrentShift']);
    Route::get('shift-kasir', [ShiftKasirController::class, 'index']);
    Route::get('shift-kasir/{id}', [ShiftKasirController::class, 'show']);
    Route::post('shift-kasir/{id}/input-pemasukan', [ShiftKasirController::class, 'inputPemasukan']);
    Route::options('shift-kasir/{id}/input-pemasukan', function () {
        return response()->noContent();
    });

    // Dashboard data
    Route::get('dashboard/stats', function () {
        return response()->json([
            'total_produk' => \App\Models\Produk::count(),
            'total_kategori' => \App\Models\Kategori::count(),
            'total_supplier' => \App\Models\Supplier::count(),
            'total_resep' => \App\Models\Recipe::count(),
            'total_lokasi' => \App\Models\Lokasi::count(),
            'total_gudang' => \App\Models\Lokasi::gudang()->count(),
            'total_toko' => \App\Models\Lokasi::toko()->count(),
            'low_stock_produk' => \App\Models\ProdukLokasi::whereRaw('quantity <= min_stock_level')->count(),
        ]);
    });
});
