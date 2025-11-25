<?php

namespace App\Modules\Pemasukan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PemasukanResource extends JsonResource
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
            'lokasi_id' => $this->lokasi_id,
            'no_pemasukan' => $this->no_pemasukan,
            'toko_id' => $this->lokasi_id, // Keep for backward compatibility
            'kategori' => $this->kategori,
            'kategori_label' => $this->kategori_label,
            'sub_kategori' => $this->sub_kategori,
            'sub_kategori_label' => $this->sub_kategori_label,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi,
            'jumlah' => $this->jumlah,
            'jumlah_formatted' => $this->jumlah_formatted,
            'tanggal' => $this->tanggal,
            'metode_pembayaran' => $this->metode_pembayaran,
            'metode_pembayaran_label' => $this->metode_pembayaran_label,
            'referensi' => $this->referensi,
            'bukti_pembayaran' => $this->bukti_pembayaran,
            'is_active' => $this->is_active,
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
