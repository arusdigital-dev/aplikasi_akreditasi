<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCriteriaPointRequest extends FormRequest
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
            'criteria_id' => ['required', 'integer', 'exists:criteria,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_score' => ['required', 'numeric', 'min:0'],
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
            'criteria_id.exists' => 'Kriteria yang dipilih tidak valid.',
            'title.required' => 'Judul poin kriteria harus diisi.',
            'title.max' => 'Judul poin kriteria maksimal 255 karakter.',
            'max_score.required' => 'Nilai maksimal harus diisi.',
            'max_score.numeric' => 'Nilai maksimal harus berupa angka.',
            'max_score.min' => 'Nilai maksimal minimal 0.',
        ];
    }
}

