<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HppMaterialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestHpp = $this->getLatestHpp();
        $latestPurchase = \App\Models\ItemPembelian::where('material_id', $this->id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->with('pembelian')
            ->first();

        $conversion = $this->nilai_konversi ? (float) $this->nilai_konversi : 0.0;
        $hppUnitPrice = ($latestHpp !== null && $conversion > 0)
            ? ($latestHpp / $conversion)
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'supplier_id' => $this->supplier_id,
            'purchase_price' => (float) $this->purchase_price,
            'unit' => $this->unit,
            'nilai_konversi' => $conversion,
            'min_stock' => $this->min_stock,
            'is_active' => $this->is_active,
            'hpp' => $latestHpp,
            'hpp_unit_price' => $hppUnitPrice,
            'latest_purchase' => $latestPurchase ? [
                'id' => $latestPurchase->id,
                'harga_satuan' => (float) $latestPurchase->harga_satuan,
                'quantity' => $latestPurchase->quantity,
                'subtotal' => (float) $latestPurchase->subtotal,
                'created_at' => $latestPurchase->created_at?->format('Y-m-d H:i:s'),
                'pembelian' => $latestPurchase->pembelian ? [
                    'id' => $latestPurchase->pembelian->id,
                    'no_pembelian' => $latestPurchase->pembelian->no_pembelian,
                    'tanggal_pembelian' => $latestPurchase->pembelian->tanggal_pembelian?->format('Y-m-d'),
                ] : null,
            ] : null,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'supplier' => $this->whenLoaded('supplier', function () {
                return [
                    'id' => $this->supplier->id,
                    'nama' => $this->supplier->nama,
                ];
            }),
        ];
    }
}

