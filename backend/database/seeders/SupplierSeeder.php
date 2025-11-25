<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if suppliers already exist
        if (Supplier::count() > 0) {
            return;
        }

        $suppliers = [
            [
                'nama' => 'PT Sumber Pangan Indonesia',
                'kode' => 'SUP0001',
                'alamat' => 'Jl. Raya Jakarta No. 123, Jakarta Pusat',
                'telepon' => '021-12345678',
                'email' => 'info@sumberpangan.co.id',
                'is_active' => true,
            ],
            [
                'nama' => 'CV Bahan Baku Segar',
                'kode' => 'SUP0002',
                'alamat' => 'Jl. Pasar Minggu Raya No. 456, Jakarta Selatan',
                'telepon' => '021-87654321',
                'email' => 'order@bahansegars.com',
                'is_active' => true,
            ],
            [
                'nama' => 'UD Tani Makmur',
                'kode' => 'SUP0003',
                'alamat' => 'Jl. Kebun Raya No. 789, Bogor',
                'telepon' => '021-11223344',
                'email' => 'tani@makmur.com',
                'is_active' => true,
            ],
            [
                'nama' => 'PT Distributor Makanan',
                'kode' => 'SUP0004',
                'alamat' => 'Jl. Industri Raya No. 321, Tangerang',
                'telepon' => '021-55667788',
                'email' => 'sales@distributormakanan.co.id',
                'is_active' => true,
            ],
            [
                'nama' => 'CV Supplier Minuman',
                'kode' => 'SUP0005',
                'alamat' => 'Jl. Minuman Segar No. 654, Depok',
                'telepon' => '021-99887766',
                'email' => 'order@supplierminuman.com',
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
