<?php

namespace App\Modules\Pemasukan;

use Illuminate\Foundation\Http\FormRequest;

class PemasukanRequest extends FormRequest
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
            'kategori' => 'required|string|in:pemasukan_kasir,pemasukan_non_kasir,lainnya',
            'sub_kategori' => 'nullable|string',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'jumlah' => 'required|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'uang_dibayar' => 'nullable|numeric|min:0',
            'kembalian' => 'nullable|numeric|min:0',
            'tanggal' => 'required|date',
            'metode_pembayaran' => 'required|in:cash,transfer,kredit,debit,qris',
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
            'kategori.required' => 'Kategori pemasukan harus dipilih',
            'kategori.in' => 'Kategori pemasukan tidak valid',
            'nama.required' => 'Nama pemasukan harus diisi',
            'nama.max' => 'Nama pemasukan maksimal 255 karakter',
            'jumlah.required' => 'Jumlah pemasukan harus diisi',
            'jumlah.numeric' => 'Jumlah pemasukan harus berupa angka',
            'jumlah.min' => 'Jumlah pemasukan minimal 0',
            'tanggal.required' => 'Tanggal pemasukan harus diisi',
            'tanggal.date' => 'Format tanggal tidak valid',
            'metode_pembayaran.required' => 'Metode pembayaran harus dipilih',
            'metode_pembayaran.in' => 'Metode pembayaran tidak valid',
            'referensi.max' => 'Referensi maksimal 255 karakter',
            'bukti_pembayaran.max' => 'Bukti pembayaran maksimal 255 karakter'
        ];
    }
}
