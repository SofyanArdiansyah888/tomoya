<?php

namespace App\Modules\ShiftKasir;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftKasirResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totals = $this->resource->calculateTotals();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'lokasi_id' => $this->lokasi_id,
            'no_shift_kasir' => $this->no_shift_kasir,
            'saldo_awal' => (float) $this->saldo_awal,
            'saldo_akhir' => $this->saldo_akhir ? (float) $this->saldo_akhir : null, 
            'total_penjualan_cash' => (float) $totals['total_penjualan_cash'],
            'total_penjualan_card' => (float) $totals['total_penjualan_card'],
            'total_penjualan_qris' => (float) $totals['total_penjualan_qris'], 
            'total_penjualan_other' => (float) $totals['total_penjualan_other'],
            'total_penjualan' => (float) $totals['total_penjualan'],
            'total_pembelian' => (float) $totals['total_pembelian'],
            'total_pemasukan' => (float) $totals['total_pemasukan'],
            'total_pengeluaran' => (float) $totals['total_pengeluaran'],
            'total_arus_kas' => (float) $totals['total_arus_kas'],
            'selisih' => $this->selisih ? (float) $this->selisih : null,
            'tanggal_buka' => $this->tanggal_buka->format('Y-m-d H:i:s'),
            'tanggal_tutup' => $this->tanggal_tutup ? $this->tanggal_tutup->format('Y-m-d H:i:s') : null,
            'status' => $this->status,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'lokasi' => $this->whenLoaded('lokasi', function () {
                return [
                    'id' => $this->lokasi->id,
                    'nama' => $this->lokasi->nama,
                    'alamat' => $this->lokasi->alamat ?? '',
                ];
            }),
            'pesanan' => $this->whenLoaded('pesanan', function () {
                return $this->pesanan->map(function ($pesanan) {
                    return [
                        'id' => $pesanan->id,
                        'total_jumlah' => (float) $pesanan->total_jumlah,
                        'metode_pembayaran' => $pesanan->metode_pembayaran,
                        'tanggal_penjualan' => $pesanan->tanggal_penjualan ? $pesanan->tanggal_penjualan->format('Y-m-d H:i:s') : null,
                    ];
                });
            }),
            'pembelian' => $this->whenLoaded('pembelian', function () {
                return $this->pembelian->map(function ($pembelian) {
                    return [
                        'id' => $pembelian->id,
                        'no_pembelian' => $pembelian->no_pembelian,
                        'total_harga' => (float) $pembelian->total_harga,
                        'metode_pembayaran' => $pembelian->metode_pembayaran ?? 'cash',
                        'tanggal_pembelian' => $pembelian->tanggal_pembelian->format('Y-m-d'),
                    ];
                });
            }),
            'pemasukan' => $this->whenLoaded('pemasukan', function () {
                return $this->pemasukan->map(function ($pemasukan) {
                    return [
                        'id' => $pemasukan->id,
                        'nama' => $pemasukan->nama,
                        'jumlah' => (float) $pemasukan->jumlah,
                        'metode_pembayaran' => $pemasukan->metode_pembayaran ?? 'cash',
                        'uang_dibayar' => $pemasukan->uang_dibayar ? (float) $pemasukan->uang_dibayar : null,
                        'tanggal' => $pemasukan->tanggal->format('Y-m-d'),
                    ];
                });
            }),
            'pengeluaran' => $this->whenLoaded('pengeluaran', function () {
                return $this->pengeluaran->map(function ($pengeluaran) {
                    return [
                        'id' => $pengeluaran->id,
                        'nama' => $pengeluaran->nama,
                        'jumlah' => (float) $pengeluaran->jumlah,
                        'metode_pembayaran' => $pengeluaran->metode_pembayaran ?? 'cash',
                        'tanggal' => $pengeluaran->tanggal->format('Y-m-d'),
                    ];
                });
            }),
            'arus_kas' => $this->whenLoaded('arusKas', function () {
                return $this->arusKas->map(function ($arusKas) {
                    return [
                        'id' => $arusKas->id,
                        'jenis' => $arusKas->jenis,
                        'jumlah' => (float) $arusKas->jumlah,
                        'metode_pembayaran' => $arusKas->metode_pembayaran ?? 'cash',
                        'uang_dibayar' => $arusKas->uang_dibayar ? (float) $arusKas->uang_dibayar : null,
                        'deskripsi' => $arusKas->deskripsi,
                        'tanggal' => $arusKas->tanggal->format('Y-m-d'),
                    ];
                });
            }),
            'has_input_pemasukan' => (bool) $this->arusKas()
                ->where('jenis', 'pemasukan')
                ->where('kategori', 'pemasukan_kasir')
                ->where('sub_kategori', 'penjualan_kasir')
                ->exists(),
        ];
    }
}

