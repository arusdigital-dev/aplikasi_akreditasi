<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessorAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // TODO: Add proper authorization check
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'assessor_id' => ['required', 'uuid', 'exists:users,id'],
            'assignment_type' => ['required', 'string', Rule::in(['criteria', 'unit', 'program'])],
            'criteria_id' => ['required_if:assignment_type,criteria', 'nullable', 'exists:criteria,id'],
            'unit_id' => ['required_if:assignment_type,unit', 'nullable', 'uuid', 'exists:units,id'],
            'program_id' => ['required_if:assignment_type,program', 'nullable', 'exists:programs,id'],
            'access_level' => ['required', 'string', Rule::in(['read_only', 'read_write', 'full_access'])],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
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
            'assessor_id.required' => 'Asesor harus dipilih.',
            'assessor_id.exists' => 'Asesor yang dipilih tidak valid.',
            'assignment_type.required' => 'Tipe penugasan harus dipilih.',
            'assignment_type.in' => 'Tipe penugasan tidak valid.',
            'criteria_id.required_if' => 'Kriteria harus dipilih untuk penugasan kriteria.',
            'criteria_id.exists' => 'Kriteria yang dipilih tidak valid.',
            'unit_id.required_if' => 'Unit harus dipilih untuk penugasan unit.',
            'unit_id.exists' => 'Unit yang dipilih tidak valid.',
            'program_id.required_if' => 'Program harus dipilih untuk penugasan program.',
            'program_id.exists' => 'Program yang dipilih tidak valid.',
            'access_level.required' => 'Tingkat akses harus dipilih.',
            'access_level.in' => 'Tingkat akses tidak valid.',
            'deadline.date' => 'Deadline harus berupa tanggal yang valid.',
            'deadline.after_or_equal' => 'Deadline tidak boleh sebelum hari ini.',
            'notes.max' => 'Catatan tidak boleh lebih dari 1000 karakter.',
        ];
    }
}
