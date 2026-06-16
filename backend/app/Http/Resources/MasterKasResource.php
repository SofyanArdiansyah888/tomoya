<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource; 

class MasterKasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'no_master_kas' => $this->no_master_kas,
            'user_id' => $this->user_id,
            'lokasi_id' => $this->lokasi_id,
            'toko_id' => $this->lokasi_id,
            'jenis' => $this->jenis,
            'jenis_label' => $this->jenis_label,
            'kategori' => $this->kategori,
            'kategori_label' => $this->kategori_label,
            'sub_kategori' => $this->sub_kategori,
            'sub_kategori_label' => $this->sub_kategori_label,
            'jumlah' => $this->jumlah,
            'subtotal' => $this->subtotal,
            'uang_dibayar' => $this->uang_dibayar,
            'kembalian' => $this->kembalian,
            'deskripsi' => $this->deskripsi,
            'tanggal' => $this->tanggal->format('Y-m-d'),
            'referensi_id' => $this->referensi_id,
            'referensi_type' => $this->referensi_type,
            'metode_pembayaran' => $this->metode_pembayaran,
            'metode_pembayaran_label' => $this->metode_pembayaran_label,
            'status' => (bool) ($this->status ?? true),
            'is_recap' => (bool) ($this->is_recap ?? false), 
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
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
            }),
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
