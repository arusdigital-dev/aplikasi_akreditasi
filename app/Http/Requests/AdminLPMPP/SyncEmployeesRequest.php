<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class SyncEmployeesRequest extends FormRequest
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
            'source' => ['required', 'string', 'in:siasn,api,manual'],
            'unit_id' => ['nullable', 'string', 'exists:units,id'],
            'force_update' => ['nullable', 'boolean'],
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
            'source.required' => 'Sumber data harus dipilih.',
            'source.in' => 'Sumber data tidak valid.',
            'unit_id.exists' => 'Unit yang dipilih tidak ditemukan.',
        ];
    }
}

