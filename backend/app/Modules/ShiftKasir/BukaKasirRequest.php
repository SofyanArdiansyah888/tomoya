<?php

namespace App\Modules\ShiftKasir;

use Illuminate\Foundation\Http\FormRequest;

class BukaKasirRequest extends FormRequest
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
            'lokasi_id' => 'required|exists:lokasi,id',
            'saldo_awal' => 'required|numeric|min:0',
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
            'lokasi_id.required' => 'Lokasi harus dipilih.',
            'lokasi_id.exists' => 'Lokasi yang dipilih tidak valid.',
            'saldo_awal.required' => 'Saldo awal harus diisi.',
            'saldo_awal.numeric' => 'Saldo awal harus berupa angka.',
            'saldo_awal.min' => 'Saldo awal tidak boleh negatif.',
        ];
    }
}

