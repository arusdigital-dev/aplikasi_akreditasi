<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
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
            'criteria_id' => ['required', 'string', 'exists:criteria,id'],
            'fakultas_id' => ['required', 'string', 'exists:fakultas,id'],
            'prodi_id' => ['required', 'string', 'exists:prodis,id'],
            'assessor_id' => ['nullable', 'string', 'exists:users,id'],
            'assigned_date' => ['required', 'date'],
            'deadline' => ['required', 'date', 'after_or_equal:assigned_date'],
            'access_level' => ['required', 'string', 'in:read_only,read_write,full_access'],
            'notes' => ['nullable', 'string', 'max:1000'],
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
            'criteria_id.required' => 'Kriteria harus dipilih.',
            'criteria_id.exists' => 'Kriteria yang dipilih tidak ditemukan.',
            'fakultas_id.required' => 'Fakultas harus dipilih.',
            'fakultas_id.exists' => 'Fakultas yang dipilih tidak ditemukan.',
            'prodi_id.required' => 'Program Studi harus dipilih.',
            'prodi_id.exists' => 'Program Studi yang dipilih tidak ditemukan.',
            'assessor_id.exists' => 'Asesor yang dipilih tidak ditemukan.',
            'assigned_date.required' => 'Tanggal penugasan harus diisi.',
            'assigned_date.date' => 'Tanggal penugasan harus berupa tanggal yang valid.',
            'deadline.required' => 'Deadline harus diisi.',
            'deadline.date' => 'Deadline harus berupa tanggal yang valid.',
            'deadline.after_or_equal' => 'Deadline harus sama atau setelah tanggal penugasan.',
            'access_level.required' => 'Level akses harus dipilih.',
            'access_level.in' => 'Level akses tidak valid.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}
