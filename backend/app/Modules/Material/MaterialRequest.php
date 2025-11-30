<?php

namespace App\Modules\Material;

use Illuminate\Foundation\Http\FormRequest;

class MaterialRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:kategori,id',
            'supplier_id' => 'required|exists:supplier,id',
            'purchase_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|integer|min:0',
            'unit_gudang' => 'required|string|max:50',
            'min_stok_gudang' => 'required|integer|min:0',
            'nilai_konversi' => 'required|numeric|min:0',
            'barcode' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'is_bahan_kopi' => 'boolean',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['sku'] = 'nullable|string';
            $rules['name'] = 'sometimes|required|string|max:255';
            $rules['description'] = 'nullable|string';
            $rules['category_id'] = 'sometimes|required|exists:kategori,id';
            $rules['supplier_id'] = 'sometimes|required|exists:supplier,id';
            $rules['purchase_price'] = 'sometimes|required|numeric|min:0';
            $rules['unit'] = 'sometimes|required|string|max:50';
            $rules['min_stock'] = 'sometimes|required|integer|min:0';
            $rules['unit_gudang'] = 'sometimes|required|string|max:50';
            $rules['min_stok_gudang'] = 'sometimes|required|integer|min:0';
            $rules['nilai_konversi'] = 'sometimes|required|numeric|min:0';
            $rules['barcode'] = 'nullable|string|max:100';
            $rules['is_active'] = 'sometimes|boolean';
            $rules['is_bahan_kopi'] = 'sometimes|boolean';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama material wajib diisi.',
            'name.max' => 'Nama material maksimal 255 karakter.',
            'sku.required' => 'SKU material wajib diisi.',
            'sku.unique' => 'SKU material sudah digunakan.',
            'sku.max' => 'SKU material maksimal 100 karakter.',
            'category_id.required' => 'Kategori material wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'supplier_id.required' => 'Supplier material wajib dipilih.',
            'supplier_id.exists' => 'Supplier yang dipilih tidak valid.',
            'purchase_price.required' => 'Harga beli material wajib diisi.',
            'purchase_price.numeric' => 'Harga beli harus berupa angka.',
            'purchase_price.min' => 'Harga beli tidak boleh kurang dari 0.',
            'unit.required' => 'Unit material wajib dipilih.',
            'unit.max' => 'Unit material maksimal 50 karakter.',
            'min_stock.required' => 'Stok minimum material wajib diisi.',
            'min_stock.integer' => 'Stok minimum harus berupa angka bulat.',
            'min_stock.min' => 'Stok minimum tidak boleh kurang dari 0.',
            'unit_gudang.required' => 'Unit gudang material wajib diisi.',
            'unit_gudang.max' => 'Unit gudang maksimal 50 karakter.',
            'min_stok_gudang.required' => 'Stok minimum gudang material wajib diisi.',
            'min_stok_gudang.integer' => 'Stok minimum gudang harus berupa angka bulat.',
            'min_stok_gudang.min' => 'Stok minimum gudang tidak boleh kurang dari 0.',
            'nilai_konversi.required' => 'Nilai konversi material wajib diisi.',
            'nilai_konversi.numeric' => 'Nilai konversi harus berupa angka.',
            'nilai_konversi.min' => 'Nilai konversi tidak boleh kurang dari 0.',
            'barcode.max' => 'Barcode maksimal 100 karakter.',
            'description.string' => 'Deskripsi harus berupa teks.',
        ];
    }
}
