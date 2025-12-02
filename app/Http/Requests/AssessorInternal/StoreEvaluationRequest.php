<?php

namespace App\Http\Requests\AssessorInternal;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationRequest extends FormRequest
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
            'evaluations' => ['required', 'array'],
            'evaluations.*.criteria_point_id' => ['required', 'exists:criteria_points,id'],
            'evaluations.*.score' => ['required', 'numeric', 'min:0', 'max:4'],
            'evaluations.*.notes' => ['nullable', 'string'],
            'evaluations.*.descriptive_narrative' => ['nullable', 'string'],
            'evaluations.*.improvement_suggestion' => ['nullable', 'string'],
            'evaluations.*.evaluation_status' => ['nullable', 'in:passed,needs_improvement,inadequate'],
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
            'evaluations.required' => 'Minimal satu poin kriteria harus dinilai.',
            'evaluations.array' => 'Evaluasi harus berupa array.',
            'evaluations.*.criteria_point_id.required' => 'Poin kriteria harus dipilih.',
            'evaluations.*.criteria_point_id.exists' => 'Poin kriteria yang dipilih tidak ditemukan.',
            'evaluations.*.score.required' => 'Nilai harus diisi.',
            'evaluations.*.score.numeric' => 'Nilai harus berupa angka.',
            'evaluations.*.score.min' => 'Nilai minimal 0.',
            'evaluations.*.score.max' => 'Nilai maksimal 4.',
            'evaluations.*.evaluation_status.in' => 'Status evaluasi tidak valid.',
        ];
    }
}
