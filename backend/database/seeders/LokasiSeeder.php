<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lokasi;

class LokasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if lokasi already exist
        if (Lokasi::count() > 0) {
            return;
        }

        // Satukan gudang dan toko dalam satu array
        $lokasiList = [
            [
                'nama' => 'Gudang Pusat',
                'kode' => 'GDG001',
                'alamat' => 'Jl. Raya Industri No. 100, Jakarta Pusat',
                'tipe' => 'gudang',
                'is_active' => true,
            ],
            [
                'nama' => 'Tomoya Coffee - Thamrin',
                'kode' => 'TKO001',
                'alamat' => 'Jl. MH Thamrin No. 1, Jakarta Pusat',
                'tipe' => 'toko',
                'is_active' => true,
            ]
        ];

        foreach ($lokasiList as $lokasi) {
            Lokasi::create($lokasi);
        }
    }
}

