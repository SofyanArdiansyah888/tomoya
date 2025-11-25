<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\Lokasi;
use App\Models\ProdukLokasi;

class SeedProduk extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:produk';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed sample products and categories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding products and categories...');

        // Create categories
        $kategori1 = Kategori::create([
            'nama' => 'Elektronik',
            'slug' => 'elektronik',
            'deskripsi' => 'Produk elektronik dan gadget',
            'is_active' => true,
        ]);

        $kategori2 = Kategori::create([
            'nama' => 'Fashion',
            'slug' => 'fashion',
            'deskripsi' => 'Pakaian dan aksesoris',
            'is_active' => true,
        ]);

        $kategori3 = Kategori::create([
            'nama' => 'Makanan',
            'slug' => 'makanan',
            'deskripsi' => 'Makanan dan minuman',
            'is_active' => true,
        ]);

        // Create products
        $produk1 = Produk::create([
            'nama' => 'Smartphone Samsung Galaxy A54',
            'slug' => 'smartphone-samsung-galaxy-a54',
            'deskripsi' => 'Smartphone Android dengan kamera 50MP',
            'harga' => 4500000,
            'kategori_id' => $kategori1->id,
            'stok_quantity' => 50,
            'is_active' => true,
        ]);

        $produk2 = Produk::create([
            'nama' => 'Laptop ASUS VivoBook 15',
            'slug' => 'laptop-asus-vivobook-15',
            'deskripsi' => 'Laptop Windows 11 dengan processor Intel i5',
            'harga' => 8500000,
            'kategori_id' => $kategori1->id,
            'stok_quantity' => 25,
            'is_active' => true,
        ]);

        $produk3 = Produk::create([
            'nama' => 'Kaos Polo Uniqlo',
            'slug' => 'kaos-polo-uniqlo',
            'deskripsi' => 'Kaos polo katun premium',
            'harga' => 199000,
            'kategori_id' => $kategori2->id,
            'stok_quantity' => 100,
            'is_active' => true,
        ]);

        $produk4 = Produk::create([
            'nama' => 'Nasi Goreng Spesial',
            'slug' => 'nasi-goreng-spesial',
            'deskripsi' => 'Nasi goreng dengan telur, ayam, dan sayuran',
            'harga' => 25000,
            'kategori_id' => $kategori3->id,
            'stok_quantity' => 200,
            'is_active' => true,
        ]);

        // Create warehouse
        $gudang = Lokasi::create([
            'nama' => 'Gudang Utama Jakarta',
            'kode' => 'GUD001',
            'alamat' => 'Jl. Raya Jakarta No. 123, Jakarta Selatan',
            'tipe' => 'gudang',
            'is_active' => true,
        ]);

        // Create shop
        $toko = Lokasi::create([
            'nama' => 'Toko Utama Jakarta',
            'kode' => 'TOK001',
            'alamat' => 'Jl. Sudirman No. 456, Jakarta Pusat',
            'tipe' => 'toko',
            'is_active' => true,
        ]);

        // Create inventory for warehouse
        ProdukLokasi::create([
            'lokasi_id' => $gudang->id,
            'produk_id' => $produk1->id,
            'quantity' => 50,
            'min_stock_level' => 10,
            'max_stock_level' => 100,
            'reorder_point' => 15,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $gudang->id,
            'produk_id' => $produk2->id,
            'quantity' => 25,
            'min_stock_level' => 5,
            'max_stock_level' => 50,
            'reorder_point' => 8,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $gudang->id,
            'produk_id' => $produk3->id,
            'quantity' => 100,
            'min_stock_level' => 20,
            'max_stock_level' => 200,
            'reorder_point' => 30,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $gudang->id,
            'produk_id' => $produk4->id,
            'quantity' => 200,
            'min_stock_level' => 50,
            'max_stock_level' => 500,
            'reorder_point' => 75,
        ]);

        // Create inventory for shop
        ProdukLokasi::create([
            'lokasi_id' => $toko->id,
            'produk_id' => $produk1->id,
            'quantity' => 10,
            'min_stock_level' => 5,
            'max_stock_level' => 20,
            'reorder_point' => 8,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $toko->id,
            'produk_id' => $produk2->id,
            'quantity' => 5,
            'min_stock_level' => 2,
            'max_stock_level' => 10,
            'reorder_point' => 3,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $toko->id,
            'produk_id' => $produk3->id,
            'quantity' => 20,
            'min_stock_level' => 10,
            'max_stock_level' => 50,
            'reorder_point' => 15,
        ]);

        ProdukLokasi::create([
            'lokasi_id' => $toko->id,
            'produk_id' => $produk4->id,
            'quantity' => 50,
            'min_stock_level' => 20,
            'max_stock_level' => 100,
            'reorder_point' => 30,
        ]);

        $this->info('Products and categories seeded successfully!');
    }
}
