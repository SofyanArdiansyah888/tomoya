<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HppRecipeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hppData = $this->calculateHpp();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'yield_quantity' => (float) $this->yield_quantity,
            'yield_unit' => $this->yield_unit,
            'cost_per_unit' => $this->cost_per_unit ? (float) $this->cost_per_unit : null,
            'instructions' => $this->instructions,
            'is_active' => $this->is_active,
            'hpp' => [
                'total_hpp' => $hppData['total_hpp'],
                'cost_per_unit' => $hppData['cost_per_unit'],
                'yield_quantity' => $hppData['yield_quantity'],
                'yield_unit' => $hppData['yield_unit'],
                'breakdown' => $hppData['breakdown'],
            ],
            'materials' => $this->whenLoaded('materials', function () {
                return $this->materials->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'name' => $material->name,
                        'sku' => $material->sku,
                        'unit' => $material->pivot?->unit ?? $material->unit,
                        'quantity' => $material->pivot?->quantity,
                        'cost' => $material->pivot && $material->pivot->cost !== null ? (float) $material->pivot->cost : null,
                        'material_unit' => $material->unit,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

