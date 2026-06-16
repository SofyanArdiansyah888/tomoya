<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicPesananResource extends JsonResource
{
    public function toArray(Request $request): array
    { 
        return [
            'no_pesanan' => $this->no_pesanan,
            'status' => $this->payment_status, 
            'payment_status' => $this->payment_status,
            'metode_pembayaran' => $this->metode_pembayaran,
            'nama_client' => $this->nama_client,
            'subtotal' => $this->subtotal,
            'total_jumlah' => $this->total_jumlah,
            'tanggal_penjualan' => $this->tanggal_penjualan
                ? $this->tanggal_penjualan->format('Y-m-d H:i:s')
                : null,
            'created_at' => $this->created_at,
            'items' => $this->whenLoaded('itemPesanan', function () {
                return $this->itemPesanan->map(function ($item) {
                    return [
                        'quantity' => $item->quantity,
                        'harga_satuan' => $item->harga,
                        'subtotal' => $item->quantity * $item->harga,
                        'coffee_strength' => $item->coffee_strength,
                        'catatan' => $item->catatan,
                        'produk' => $item->produk ? [
                            'nama' => $item->produk->nama,
                        ] : null,
                    ];
                });
            }),
            'lokasi' => $this->whenLoaded('lokasi', function () {
                return [
                    'nama' => $this->lokasi->nama,
                ];
            }),
        ];
    }
}
