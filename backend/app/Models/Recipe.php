<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $table = 'recipes';
    
    protected $fillable = [
        'name',
        'description',
        'yield_quantity',
        'yield_unit',
        'cost_per_unit',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'yield_quantity' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function recipeMaterials(): HasMany
    {
        return $this->hasMany(RecipeMaterial::class);
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class, 'recipe_materials')
                    ->withPivot(['quantity', 'unit', 'cost'])
                    ->withTimestamps();
    }

    /**
     * Calculate HPP (Harga Pokok Penjualan) for this recipe
     * Based on latest HPP of each material used in the recipe
     * 
     * @return array Returns array with total_hpp, cost_per_unit, and breakdown
     */
    public function calculateHpp(): array
    {
        $totalHpp = 0;
        $breakdown = [];

        foreach ($this->recipeMaterials as $recipeMaterial) {
            $material = $recipeMaterial->material;
            $materialHppRaw = $material ? $material->getLatestHpp() : null;
            $conversion = $material && $material->nilai_konversi ? (float) $material->nilai_konversi : 0.0;
            $materialHpp = ($materialHppRaw !== null && $conversion > 0)
                ? ($materialHppRaw / $conversion)
                : null;
            
            // Use material HPP if available, otherwise use stored cost
            $costPerUnit = $materialHpp ?? ($recipeMaterial->cost ?? 0);
            $quantity = (float) $recipeMaterial->quantity;
            $subtotal = $costPerUnit * $quantity;

            $totalHpp += $subtotal;

            $breakdown[] = [
                'material_id' => $recipeMaterial->material_id,
                'material_name' => $material ? $material->name : 'Unknown',
                'quantity' => $quantity,
                'unit' => $recipeMaterial->unit,
                'hpp_per_unit' => $materialHpp,
                'cost_per_unit' => $costPerUnit,
                'subtotal' => $subtotal,
            ];
        }

        $costPerUnit = $this->yield_quantity > 0 ? $totalHpp / $this->yield_quantity : 0;

        return [
            'total_hpp' => $totalHpp,
            'cost_per_unit' => $costPerUnit,
            'yield_quantity' => $this->yield_quantity,
            'yield_unit' => $this->yield_unit,
            'breakdown' => $breakdown,
        ];
    }
}
