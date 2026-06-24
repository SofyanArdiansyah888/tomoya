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
            self::ensurePastryCategories();
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
 
        foreach ([
            ['nama' => 'Pastry', 'deskripsi' => 'Bahan baku pastry', 'is_active' => true],
            ['nama' => 'Cake', 'deskripsi' => 'Bahan baku kue/cake', 'is_active' => true],
        ] as $kategori) {
            Kategori::firstOrCreate(['nama' => $kategori['nama']], $kategori);
        }
    }

    /**
     * Ensure pastry division categories exist (safe to call on existing DB).
     */
    public static function ensurePastryCategories(): void
    {
        foreach ([
            ['nama' => 'Pastry', 'deskripsi' => 'Bahan baku pastry', 'is_active' => true],
            ['nama' => 'Cake', 'deskripsi' => 'Bahan baku kue/cake', 'is_active' => true],
        ] as $kategori) {
            Kategori::firstOrCreate(['nama' => $kategori['nama']], $kategori);
        }
    }
}
