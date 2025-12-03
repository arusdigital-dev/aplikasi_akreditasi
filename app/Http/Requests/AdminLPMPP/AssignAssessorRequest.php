<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class AssignAssessorRequest extends FormRequest
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
            'assessor_id' => ['required', 'string', 'exists:users,id'],
            'assigned_date' => ['required', 'date'],
            'deadline' => ['required', 'date', 'after_or_equal:assigned_date'],
            'access_level' => ['required', 'string', 'in:read_only,read_write,full_access'],
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
            'assessor_id.required' => 'Asesor harus dipilih.',
            'assessor_id.exists' => 'Asesor yang dipilih tidak ditemukan.',
            'assigned_date.required' => 'Tanggal penugasan harus diisi.',
            'assigned_date.date' => 'Tanggal penugasan harus berupa tanggal yang valid.',
            'deadline.required' => 'Deadline harus diisi.',
            'deadline.date' => 'Deadline harus berupa tanggal yang valid.',
            'deadline.after_or_equal' => 'Deadline harus sama atau setelah tanggal penugasan.',
            'access_level.required' => 'Level akses harus dipilih.',
            'access_level.in' => 'Level akses tidak valid.',
        ];
    }
}

