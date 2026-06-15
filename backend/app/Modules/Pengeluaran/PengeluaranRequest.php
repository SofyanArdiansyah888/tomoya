<?php

namespace App\Modules\Pengeluaran;

use Illuminate\Foundation\Http\FormRequest;

class PengeluaranRequest extends FormRequest
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
        return [
            'lokasi_id' => 'required_without:toko_id|exists:lokasi,id',
            'toko_id' => 'required_without:lokasi_id|exists:lokasi,id', // Backward compatibility, maps to lokasi_id
            'kategori' => 'required|string|in:pengeluaran_operasional,pengeluaran_lainnya,pembelian_bahan_baku',
            'sub_kategori' => 'nullable|string',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'jumlah' => 'required|numeric|min:0',
            'tanggal' => 'required|date', 
            'metode_pembayaran' => 'required|in:cash,transfer',
            'referensi' => 'nullable|string|max:255',
            'bukti_pembayaran' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'lokasi_id.required_without' => 'Lokasi harus dipilih',
            'lokasi_id.exists' => 'Lokasi yang dipilih tidak valid',
            'toko_id.required_without' => 'Lokasi harus dipilih',
            'toko_id.exists' => 'Lokasi yang dipilih tidak valid',
            'kategori.required' => 'Kategori pengeluaran harus dipilih',
            'kategori.in' => 'Kategori pengeluaran tidak valid',
            'nama.required' => 'Nama pengeluaran harus diisi',
            'nama.max' => 'Nama pengeluaran maksimal 255 karakter',
            'jumlah.required' => 'Jumlah pengeluaran harus diisi',
            'jumlah.numeric' => 'Jumlah pengeluaran harus berupa angka',
            'jumlah.min' => 'Jumlah pengeluaran minimal 0',
            'tanggal.required' => 'Tanggal pengeluaran harus diisi',
            'tanggal.date' => 'Format tanggal tidak valid',
            'metode_pembayaran.required' => 'Metode pembayaran harus dipilih',
            'metode_pembayaran.in' => 'Metode pembayaran tidak valid',
            'referensi.max' => 'Referensi maksimal 255 karakter',
            'bukti_pembayaran.max' => 'Bukti pembayaran maksimal 255 karakter'
        ];
    }
}
