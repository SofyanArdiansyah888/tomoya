<?php

namespace App\Modules\Produk;

use Illuminate\Foundation\Http\FormRequest;

class ProdukRequest extends FormRequest
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
            'nama' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:produk,slug',
            'kode' => 'nullable|string|max:50|unique:produk,kode',
            'deskripsi' => 'required|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategori,id',
            'supplier_id' => 'nullable|exists:supplier,id',
            'gambar' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'favorite' => 'nullable|boolean',
            'stockable' => 'required|boolean',
            'resep_id' => 'nullable|exists:recipes,id',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['nama'] = 'sometimes|required|string|max:255';
            $rules['slug'] = 'sometimes|required|string|max:255|unique:produk,slug,' . $this->route('produk');
            $rules['kode'] = 'nullable|string|max:50|unique:produk,kode,' . $this->route('produk');
            $rules['deskripsi'] = 'sometimes|required|string';
            $rules['harga'] = 'sometimes|required|numeric|min:0';
            $rules['kategori_id'] = 'sometimes|required|exists:kategori,id';
            $rules['supplier_id'] = 'nullable|exists:supplier,id';
            $rules['gambar'] = 'nullable|string|max:255';
            $rules['favorite'] = 'nullable|boolean';
            $rules['stockable'] = 'sometimes|required|boolean';
            $rules['resep_id'] = 'nullable|exists:recipes,id';
        }

        return $rules;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // If stockable is true, resep_id is required
            if ($this->input('stockable') === true || $this->input('stockable') === '1' || $this->input('stockable') === 1) {
                if (empty($this->input('resep_id'))) {
                    $validator->errors()->add('resep_id', 'Resep wajib dipilih jika produk stockable.');
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama produk wajib diisi.',
            'nama.max' => 'Nama produk maksimal 255 karakter.',
            'slug.required' => 'Slug produk wajib diisi.',
            'slug.unique' => 'Slug produk sudah digunakan.',
            'kode.required' => 'Kode produk wajib diisi.',
            'kode.max' => 'Kode produk maksimal 50 karakter.',
            'kode.unique' => 'Kode produk sudah digunakan.',
            'deskripsi.required' => 'Deskripsi produk wajib diisi.',
            'harga.required' => 'Harga produk wajib diisi.',
            'harga.numeric' => 'Harga harus berupa angka.',
            'harga.min' => 'Harga tidak boleh negatif.',
            'kategori_id.required' => 'Kategori produk wajib dipilih.',
            'kategori_id.exists' => 'Kategori yang dipilih tidak valid.',
            'supplier_id.exists' => 'Supplier yang dipilih tidak valid.',
            'gambar.max' => 'Path gambar maksimal 255 karakter.',
            'stockable.required' => 'Status stockable wajib dipilih.',
            'stockable.boolean' => 'Status stockable harus berupa boolean.',
            'resep_id.exists' => 'Resep yang dipilih tidak valid.',
            'resep_id.required' => 'Resep wajib dipilih jika produk stockable.',
        ];
    }
}
