<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
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
        $employeeId = $this->route('employee')?->id ?? $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'nip_nip3k_nik' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('employees', 'nip_nip3k_nik')->ignore($employeeId),
            ],
            'employment_status' => ['nullable', 'string'],
            'employment_type' => ['nullable', 'string'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'date_of_birth' => ['nullable', 'date'],
            'unit_id' => ['nullable', 'string', 'exists:units,id'],
            'homebase_unit_id' => ['nullable', 'string', 'exists:units,id'],
            'study_program' => ['nullable', 'string', 'max:255'],
            'management_position' => ['nullable', 'string', 'max:255'],
            'jabatan_struktural' => ['nullable', 'string', 'max:150'],
            'jabatan_fungsional' => ['nullable', 'string', 'max:150'],
            'jabatan_fungsional_pppk' => ['nullable', 'string', 'max:150'],
            'pangkat' => ['nullable', 'string', 'max:100'],
            'golongan' => ['nullable', 'string', 'max:50'],
            'tmt_golongan' => ['nullable', 'date'],
            'tmt_jabatan_fungsional' => ['nullable', 'date'],
            'tmt_jabatan_fungsional_pppk' => ['nullable', 'date'],
            'kum' => ['nullable', 'numeric', 'min:0'],
            'education_level' => ['nullable', 'string', 'max:100'],
            'masa_kerja_text' => ['nullable', 'string', 'max:50'],
            'status_keaktifan' => ['nullable', 'string', 'max:100'],
            'jabatan_eselon' => ['nullable', 'string', 'max:100'],
            'additional_notes' => ['nullable', 'string'],
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
            'name.required' => 'Nama pegawai wajib diisi.',
            'nip_nip3k_nik.unique' => 'NIP/NIP3K/NIK sudah terdaftar.',
            'unit_id.exists' => 'Unit yang dipilih tidak valid.',
            'homebase_unit_id.exists' => 'Homebase unit yang dipilih tidak valid.',
        ];
    }
}

