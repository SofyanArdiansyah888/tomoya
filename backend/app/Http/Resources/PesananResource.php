<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PesananResource extends JsonResource
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
            'no_pesanan' => $this->no_pesanan, 
            'user_id' => $this->user_id,
            'lokasi_id' => $this->lokasi_id,
            'toko_id' => $this->lokasi_id, // Keep for backward compatibility
            'total_jumlah' => $this->total_jumlah,
            'total_harga' => $this->total_jumlah, // Keep for backward compatibility
            'status' => $this->payment_status, // Map payment_status to status for frontend compatibility
            'payment_status' => $this->payment_status,
            'metode_pembayaran' => $this->metode_pembayaran,
            'catatan' => $this->catatan,
            'nama_client' => $this->nama_client,
            'gambar_qris' => $this->gambar_qris,
            'tanggal_penjualan' => $this->tanggal_penjualan ? $this->tanggal_penjualan->format('Y-m-d H:i:s') : null,
            'subtotal' => $this->subtotal,
            'uang_dibayar' => $this->uang_dibayar,
            'kembalian' => $this->kembalian,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'items' => $this->whenLoaded('itemPesanan', function () {
                return $this->itemPesanan->map(function ($item) {
                    return [ 
                        'id' => $item->id,
                        'pesanan_id' => $item->pesanan_id,
                        'produk_id' => $item->produk_id,
                        'quantity' => $item->quantity,
                        'harga_satuan' => $item->harga,
                        'harga' => $item->harga, // Keep for backward compatibility
                        'subtotal' => $item->quantity * $item->harga,
                        'coffee_strength' => $item->coffee_strength,
                        'catatan' => $item->catatan,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                        'produk' => $item->produk ? [
                            'id' => $item->produk->id, 
                            'nama' => $item->produk->nama,
                            'harga' => $item->produk->harga,
                            'kategori' => $item->produk->kategori ? [
                                'id' => $item->produk->kategori->id,
                                'nama' => $item->produk->kategori->nama,
                            ] : null,
                        ] : null,
                    ];
                });
            }),
            'lokasi' => $this->whenLoaded('lokasi', function () {
                return [
                    'id' => $this->lokasi->id,
                    'nama' => $this->lokasi->nama,
                    'alamat' => $this->lokasi->alamat ?? '',
                ];
            }),
            'toko' => $this->whenLoaded('lokasi', function () {
                return [
                    'id' => $this->lokasi->id,
                    'nama' => $this->lokasi->nama,
                    'alamat' => $this->lokasi->alamat ?? '',
                ];
            }), // Keep for backward compatibility 
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
        ];
    }
}

