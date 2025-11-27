<?php

namespace App\Modules\Resep;

use Illuminate\Foundation\Http\FormRequest;

class ResepRequest extends FormRequest
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
            'description' => 'nullable|string',
            'yield_quantity' => 'required|numeric|min:0',
            'yield_unit' => 'required|string|max:50',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'is_kopi' => 'boolean',
            'materials' => 'nullable|array',
            'materials.*.material_id' => 'required|exists:material,id',
            'materials.*.quantity' => 'required|numeric|min:0',
            'materials.*.unit' => 'required|string|max:50',
            'materials.*.cost' => 'nullable|numeric|min:0',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['name'] = 'sometimes|required|string|max:255';
            $rules['yield_quantity'] = 'sometimes|required|numeric|min:0';
            $rules['yield_unit'] = 'sometimes|required|string|max:50';
            $rules['is_kopi'] = 'sometimes|boolean';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama resep wajib diisi.',
            'name.max' => 'Nama resep maksimal 255 karakter.',
            'yield_quantity.required' => 'Jumlah hasil wajib diisi.',
            'yield_quantity.numeric' => 'Jumlah hasil harus berupa angka.',
            'yield_quantity.min' => 'Jumlah hasil tidak boleh negatif.',
            'yield_unit.required' => 'Unit hasil wajib diisi.',
            'materials.*.material_id.required' => 'Material wajib dipilih.',
            'materials.*.material_id.exists' => 'Material yang dipilih tidak valid.',
            'materials.*.quantity.required' => 'Jumlah material wajib diisi.',
            'materials.*.quantity.numeric' => 'Jumlah material harus berupa angka.',
            'materials.*.quantity.min' => 'Jumlah material tidak boleh negatif.',
        ];
    }
}

