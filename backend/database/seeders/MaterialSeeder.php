<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Material;
use App\Models\Kategori;
use App\Models\Supplier;

class MaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if materials already exist
        if (Material::count() > 0) {
            return;
        }

        // Get first category and supplier for materials
        $kategori = Kategori::where('nama', 'Bahan Baku')->first();
        $supplier = Supplier::first();

        // Data material minuman, contoh 4 saja
        $materials = [
            [
                'name' => 'Kopi Bubuk',
                'sku' => 'KB-001',
                'description' => 'Kopi bubuk robusta kemasan 1 kg untuk minuman kopi.',
                'category_id' => $kategori->id,
                'supplier_id' => $supplier->id,
                'purchase_price' => 70000,
                'unit' => 'kg',
                'min_stock' => 10,
                'barcode' => '1234567890200',
                'is_active' => true,
            ],
            [
                'name' => 'Teh Celup',
                'sku' => 'TC-001',
                'description' => 'Teh celup kemasan 50 pcs untuk minuman teh.',
                'category_id' => $kategori->id,
                'supplier_id' => $supplier->id,
                'purchase_price' => 25000,
                'unit' => 'box',
                'min_stock' => 8,
                'barcode' => '1234567890201',
                'is_active' => true,
            ],
            [
                'name' => 'Susu Full Cream',
                'sku' => 'SFC-001',
                'description' => 'Susu cair full cream kemasan 1 liter.',
                'category_id' => $kategori->id,
                'supplier_id' => $supplier->id,
                'purchase_price' => 19000,
                'unit' => 'liter',
                'min_stock' => 12,
                'barcode' => '1234567890202',
                'is_active' => true,
            ],
            [
                'name' => 'Coklat Bubuk',
                'sku' => 'CB-001',
                'description' => 'Coklat bubuk kemasan 500 gram untuk minuman coklat.',
                'category_id' => $kategori->id,
                'supplier_id' => $supplier->id,
                'purchase_price' => 35000,
                'unit' => 'pak',
                'min_stock' => 6,
                'barcode' => '1234567890203',
                'is_active' => true,
            ],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }
    }
}
