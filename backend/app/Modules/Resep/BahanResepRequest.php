<?php

namespace App\Modules\Resep;

use Illuminate\Foundation\Http\FormRequest;

class BahanResepRequest extends FormRequest
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
            'recipe_id' => 'required|exists:recipes,id',
            'material_id' => 'required|exists:material,id',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'cost' => 'nullable|numeric|min:0',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['recipe_id'] = 'sometimes|required|exists:recipes,id';
            $rules['material_id'] = 'sometimes|required|exists:material,id';
            $rules['quantity'] = 'sometimes|required|numeric|min:0';
            $rules['unit'] = 'sometimes|required|string|max:50';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'recipe_id.required' => 'Resep wajib dipilih.',
            'recipe_id.exists' => 'Resep yang dipilih tidak valid.',
            'material_id.required' => 'Material wajib dipilih.',
            'material_id.exists' => 'Material yang dipilih tidak valid.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.numeric' => 'Jumlah harus berupa angka.',
            'quantity.min' => 'Jumlah tidak boleh negatif.',
            'unit.required' => 'Unit wajib diisi.',
        ];
    }
}

