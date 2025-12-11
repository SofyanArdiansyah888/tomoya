<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HppPenjualanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalJual = (float) ($this->total_penjualan ?? 0);
        $totalHpp = (float) ($this->total_hpp ?? 0);
        $totalQty = (int) ($this->total_qty ?? 0);

        return [
            'produk_id' => $this->produk_id,
            'produk_nama' => $this->produk_nama,
            'produk_kode' => $this->produk_kode,
            'total_qty' => $totalQty,
            'avg_harga' => round((float) ($this->avg_harga ?? 0), 2),
            'avg_hpp' => round((float) ($this->avg_hpp ?? 0), 2),
            'total_harga' => round($totalJual, 2),
            'total_hpp' => round($totalHpp, 2),
            'margin' => round($totalJual - $totalHpp, 2),
        ];
    }
}

