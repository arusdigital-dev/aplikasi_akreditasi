<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
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
            'criteria_id' => ['sometimes', 'required', 'string', 'exists:criteria,id'],
            'unit_id' => ['sometimes', 'required', 'string', 'exists:units,id'],
            'assessor_id' => ['nullable', 'string', 'exists:users,id'],
            'assigned_date' => ['sometimes', 'required', 'date'],
            'deadline' => ['sometimes', 'required', 'date', 'after_or_equal:assigned_date'],
            'access_level' => ['sometimes', 'required', 'string', 'in:read_only,read_write,full_access'],
            'status' => ['sometimes', 'required', 'string', 'in:pending,in_progress,completed,cancelled'],
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
            'criteria_id.exists' => 'Kriteria yang dipilih tidak ditemukan.',
            'unit_id.exists' => 'Unit yang dipilih tidak ditemukan.',
            'assessor_id.exists' => 'Asesor yang dipilih tidak ditemukan.',
            'assigned_date.date' => 'Tanggal penugasan harus berupa tanggal yang valid.',
            'deadline.date' => 'Deadline harus berupa tanggal yang valid.',
            'deadline.after_or_equal' => 'Deadline harus sama atau setelah tanggal penugasan.',
            'access_level.in' => 'Level akses tidak valid.',
            'status.in' => 'Status tidak valid.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

