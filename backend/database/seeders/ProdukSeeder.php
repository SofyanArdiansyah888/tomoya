<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produk;
use App\Models\Kategori;
use App\Models\Supplier;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if products already exist
        if (Produk::count() > 0) {
            return;
        }

        // Get categories and suppliers
        $makanan = Kategori::where('nama', 'Makanan')->first();
        $minuman = Kategori::where('nama', 'Minuman')->first();
        $snack = Kategori::where('nama', 'Snack')->first();
        $dessert = Kategori::where('nama', 'Dessert')->first();
        
        $supplier = Supplier::first();

        $produks = [
            [
                'nama' => 'Nasi Goreng Spesial',
                'slug' => 'nasi-goreng-spesial',
                'kode' => 'PRD0001',
                'deskripsi' => 'Nasi goreng dengan telur, ayam, dan sayuran segar',
                'harga' => 25000,
                'kategori_id' => $makanan->id,
                'supplier_id' => $supplier->id,
                'is_active' => true,
            ],
        ];

        foreach ($produks as $produk) {
            Produk::create($produk);
        }
    }
}
