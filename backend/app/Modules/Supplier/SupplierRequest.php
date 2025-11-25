<?php

namespace App\Modules\Supplier;

use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
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
            'alamat' => 'required|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['nama'] = 'sometimes|required|string|max:255';
            $rules['alamat'] = 'sometimes|required|string';
            $rules['telepon'] = 'nullable|string|max:20';
            $rules['email'] = 'nullable|email|max:255';
            $rules['is_active'] = 'sometimes|boolean';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama supplier wajib diisi.',
            'nama.max' => 'Nama supplier maksimal 255 karakter.',
            'alamat.required' => 'Alamat supplier wajib diisi.',
            'telepon.max' => 'Nomor telepon maksimal 20 karakter.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 255 karakter.',
        ];
    }
}
