<?php

namespace App\Modules\Pembelian;

use Illuminate\Foundation\Http\FormRequest;

class PembelianRequest extends FormRequest
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
            'supplier_id' => 'required|exists:supplier,id',
            'lokasi_id' => 'required|exists:lokasi,id',
            'tanggal_pembelian' => 'required|date',
            'metode_pembayaran' => 'required|in:cash,transfer,credit',
            'catatan' => 'nullable|string',
        ];

        // For store, require items
        if ($this->isMethod('post')) {
            $rules['items'] = 'required|array|min:1';
            $rules['items.*.material_id'] = 'required|exists:material,id';
            $rules['items.*.quantity'] = 'required|integer|min:1';
            $rules['items.*.harga_satuan'] = 'required|numeric|min:0';
        }

        // For update, items are optional
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['items'] = 'sometimes|array|min:1';
            $rules['items.*.material_id'] = 'required_with:items|exists:material,id';
            $rules['items.*.quantity'] = 'required_with:items|integer|min:1';
            $rules['items.*.harga_satuan'] = 'required_with:items|numeric|min:0';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'supplier_id.required' => 'Supplier harus dipilih',
            'supplier_id.exists' => 'Supplier yang dipilih tidak valid',
            'lokasi_id.required' => 'Lokasi harus dipilih',
            'lokasi_id.exists' => 'Lokasi yang dipilih tidak valid',
            'tanggal_pembelian.required' => 'Tanggal pembelian harus diisi',
            'tanggal_pembelian.date' => 'Tanggal pembelian harus berupa tanggal yang valid',
            'metode_pembayaran.required' => 'Metode pembayaran harus dipilih',
            'items.required' => 'Minimal harus ada 1 item pembelian',
            'items.min' => 'Minimal harus ada 1 item pembelian',
            'items.*.material_id.required' => 'Material harus dipilih',
            'items.*.material_id.exists' => 'Material yang dipilih tidak valid',
            'items.*.quantity.required' => 'Quantity harus diisi',
            'items.*.quantity.integer' => 'Quantity harus berupa angka',
            'items.*.quantity.min' => 'Quantity minimal 1',
            'items.*.harga_satuan.required' => 'Harga satuan harus diisi',
            'items.*.harga_satuan.numeric' => 'Harga satuan harus berupa angka',
            'items.*.harga_satuan.min' => 'Harga satuan tidak boleh negatif',
        ];
    }
}

