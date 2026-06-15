<?php

namespace App\Modules\Pembelian;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PembelianResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'supplier_id' => $this->supplier_id,
            'lokasi_id' => $this->lokasi_id,
            'no_pembelian' => $this->no_pembelian,
            'tanggal_pembelian' => $this->tanggal_pembelian?->format('Y-m-d'),
            'total_harga' => (float) $this->total_harga,
            'metode_pembayaran' => $this->metode_pembayaran,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'supplier' => $this->whenLoaded('supplier', function () {
                return [
                    'id' => $this->supplier->id,
                    'nama' => $this->supplier->nama,
                    'alamat' => $this->supplier->alamat,
                ];
            }),
            'lokasi' => $this->whenLoaded('lokasi', function () {
                return [
                    'id' => $this->lokasi->id,
                    'nama' => $this->lokasi->nama,
                    'alamat' => $this->lokasi->alamat,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'material_id' => $item->material_id,
                        'quantity' => $item->quantity,
                        'harga_satuan' => (float) $item->harga_satuan,
                        'subtotal' => (float) $item->subtotal,
                        'material' => $item->material ? [
                            'id' => $item->material->id,
                            'name' => $item->material->name,
                            'sku' => $item->material->sku,
                            'purchase_price' => (float) $item->material->purchase_price,
                            'unit' => $item->material->unit,
                        ] : null,
                    ];
                });
            }),
        ];
    }
}

