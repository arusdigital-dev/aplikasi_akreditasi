<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssessorAssignmentRequest extends FormRequest
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
            'assessor_id' => ['sometimes', 'required', 'uuid', 'exists:users,id'],
            'access_level' => ['sometimes', 'required', 'string', Rule::in(['read_only', 'read_write', 'full_access'])],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'string', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
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
            'access_level.required' => 'Tingkat akses harus dipilih.',
            'access_level.in' => 'Tingkat akses tidak valid.',
            'deadline.date' => 'Deadline harus berupa tanggal yang valid.',
            'deadline.after_or_equal' => 'Deadline tidak boleh sebelum hari ini.',
            'notes.max' => 'Catatan tidak boleh lebih dari 1000 karakter.',
            'status.required' => 'Status harus dipilih.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}
