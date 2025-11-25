<?php

namespace App\Modules\ShiftKasir;

use Illuminate\Foundation\Http\FormRequest;

class TutupKasirRequest extends FormRequest
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
            'saldo_akhir' => 'required|numeric|min:0',
            'catatan' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'saldo_akhir.required' => 'Saldo akhir harus diisi.',
            'saldo_akhir.numeric' => 'Saldo akhir harus berupa angka.',
            'saldo_akhir.min' => 'Saldo akhir tidak boleh negatif.',
        ];
    }
}

