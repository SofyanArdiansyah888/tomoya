<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if categories already exist
        if (Kategori::count() > 0) {
            return;
        }

        $kategories = [
            [
                'nama' => 'Makanan',
                'deskripsi' => 'Kategori untuk semua jenis makanan',
                'is_active' => true,
            ],
            [
                'nama' => 'Minuman',
                'deskripsi' => 'Kategori untuk semua jenis minuman',
                'is_active' => true,
            ],
            [
                'nama' => 'Snack',
                'deskripsi' => 'Kategori untuk makanan ringan dan camilan',
                'is_active' => true,
            ],
            [
                'nama' => 'Dessert',
                'deskripsi' => 'Kategori untuk makanan penutup dan kue',
                'is_active' => true,
            ],
            [
                'nama' => 'Bahan Baku',
                'deskripsi' => 'Kategori untuk bahan baku dan material',
                'is_active' => true,
            ],
        ];

        foreach ($kategories as $kategori) {
            Kategori::create($kategori);
        }
    }
}
