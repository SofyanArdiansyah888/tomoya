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
        'is_kopi',
    ];

    protected $casts = [
        'yield_quantity' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
        'is_kopi' => 'boolean',
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
            $materialHpp = null;
            $source = null;
            if ($material) {
                // Prioritize Mix Preparation unit HPP
                $mixUnit = $material->getMixPreparationUnitHpp();
                if ($mixUnit !== null) {
                    $materialHpp = $mixUnit;
                    $source = 'mix_preparation';
                } else {
                    // Fallback to purchase-based unit HPP
                    $materialHpp = $material->getUnitHpp();
                    $source = 'purchase';
                }
            }

            $materialHpp = $materialHpp !== null ? round($materialHpp, 2) : null;

            // Use material HPP (with fallback to manual pivot cost if provided)
            $costPerUnit = $materialHpp ?? ($recipeMaterial->cost ?? 0);
            $costPerUnit = round($costPerUnit, 2);
            $quantity = (float) $recipeMaterial->quantity;
            $subtotal = $costPerUnit * $quantity;

            $totalHpp += $subtotal;

            $breakdown[] = [
                'material_id' => $recipeMaterial->material_id,
                'material_name' => $material ? $material->name : 'Unknown',
                'quantity' => $quantity,
                'unit' => $material ? ($material->unit ?? $recipeMaterial->unit) : $recipeMaterial->unit,
                'hpp_per_unit' => $materialHpp,
                'cost_per_unit' => $costPerUnit,
                'subtotal' => $subtotal,
                'source' => $source,
            ];
        }

        $costPerUnit = $this->yield_quantity > 0 ? $totalHpp / $this->yield_quantity : 0;
        $costPerUnit = round($costPerUnit, 2);

        return [
            'total_hpp' => $totalHpp,
            'cost_per_unit' => $costPerUnit,
            'yield_quantity' => $this->yield_quantity,
            'yield_unit' => $this->yield_unit,
            'breakdown' => $breakdown,
        ];
    }
}
