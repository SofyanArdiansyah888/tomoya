<?php

namespace App\Modules\ArusKas;

use Illuminate\Foundation\Http\FormRequest;

class ArusKasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'kategori' => 'required|string|in:pemasukan_kasir,pemasukan_non_kasir,lainnya,pengeluaran_operasional,pengeluaran_lainnya,pembelian_bahan_baku',
            'sub_kategori' => 'nullable|string|in:penjualan_kasir,investasi,hibah,refund_penjualan,lainnya,gaji_karyawan,listrik_air,sewa_tempat,pemeliharaan,pembelian_bahan',
            'deskripsi' => 'required|string|max:500',
            'jumlah' => 'required|numeric|min:0',
            'tanggal' => 'required|date',
            'toko_id' => 'required|exists:toko,id',
            'metode_pembayaran' => 'required|in:cash,transfer,kredit',
            'status' => 'required|in:pending,confirmed,cancelled',
            'catatan' => 'nullable|string|max:1000',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['jenis'] = 'sometimes|in:pemasukan,pengeluaran';
            $rules['kategori'] = 'sometimes|string|in:pemasukan_kasir,pemasukan_non_kasir,lainnya,pengeluaran_operasional,pengeluaran_lainnya,pembelian_bahan_baku';
            $rules['sub_kategori'] = 'nullable|string|in:penjualan_kasir,investasi,hibah,refund_penjualan,lainnya,gaji_karyawan,listrik_air,sewa_tempat,pemeliharaan,pembelian_bahan';
            $rules['deskripsi'] = 'sometimes|string|max:500';
            $rules['jumlah'] = 'sometimes|numeric|min:0';
            $rules['tanggal'] = 'sometimes|date';
            $rules['toko_id'] = 'sometimes|exists:toko,id';
            $rules['metode_pembayaran'] = 'sometimes|in:cash,transfer,kredit';
            $rules['status'] = 'sometimes|in:pending,confirmed,cancelled';
            $rules['catatan'] = 'nullable|string|max:1000';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'jenis.required' => 'Jenis arus kas harus diisi.',
            'jenis.in' => 'Jenis arus kas harus berupa pemasukan atau pengeluaran.',
            'kategori.required' => 'Kategori harus diisi.',
            'kategori.max' => 'Kategori tidak boleh lebih dari 255 karakter.',
            'sub_kategori.max' => 'Sub kategori tidak boleh lebih dari 255 karakter.',
            'deskripsi.required' => 'Deskripsi harus diisi.',
            'deskripsi.max' => 'Deskripsi tidak boleh lebih dari 500 karakter.',
            'jumlah.required' => 'Jumlah harus diisi.',
            'jumlah.numeric' => 'Jumlah harus berupa angka.',
            'jumlah.min' => 'Jumlah tidak boleh kurang dari 0.',
            'tanggal.required' => 'Tanggal harus diisi.',
            'tanggal.date' => 'Format tanggal tidak valid.',
            'toko_id.required' => 'Toko harus dipilih.',
            'toko_id.exists' => 'Toko yang dipilih tidak valid.',
            'metode_pembayaran.required' => 'Metode pembayaran harus dipilih.',
            'metode_pembayaran.in' => 'Metode pembayaran tidak valid.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status tidak valid.',
            'catatan.max' => 'Catatan tidak boleh lebih dari 1000 karakter.',
        ];
    }
}
