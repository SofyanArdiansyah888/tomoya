<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Recipe;
use App\Models\Produk;
use App\Models\Material;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if recipes already exist
        if (Recipe::count() > 0) {
            return;
        }

        // Get some products and materials
        $products = Produk::take(3)->get();
        $materials = Material::take(5)->get();

        if ($products->count() > 0 && $materials->count() > 0) {
            $recipes = [
                [
                    'name' => 'Nasi Goreng Spesial',
                    'description' => 'Resep nasi goreng dengan bumbu lengkap',
                    'product_id' => $products->first()->id,
                    'yield_quantity' => 2,
                    'yield_unit' => 'pcs',
                    'cost_per_unit' => 15000,
                    'instructions' => '1. Panaskan minyak, tumis bumbu\n2. Masukkan nasi, aduk rata\n3. Tambahkan telur dan sayuran\n4. Sajikan hangat',
                    'is_active' => true,
                ]
            ];

            foreach ($recipes as $recipeData) {
                $recipe = Recipe::create($recipeData);

                // Add materials to recipe
                if ($materials->count() >= 3) {
                    $recipe->materials()->create([
                        'material_id' => $materials->first()->id,
                        'quantity' => 0.5,
                        'unit' => 'kg',
                        'cost' => 5000,
                    ]);

                    $recipe->materials()->create([
                        'material_id' => $materials->skip(1)->first()->id,
                        'quantity' => 0.1,
                        'unit' => 'kg',
                        'cost' => 2000,
                    ]);

                    $recipe->materials()->create([
                        'material_id' => $materials->skip(2)->first()->id,
                        'quantity' => 0.05,
                        'unit' => 'kg',
                        'cost' => 1000,
                    ]);
                }
            }
        } else {
            $this->command->info('Tidak ada produk atau material yang tersedia. Lewati RecipeSeeder.');
        }
    }
}
