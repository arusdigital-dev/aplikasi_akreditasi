<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class SetTargetRequest extends FormRequest
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
            'program_id' => ['required', 'string', 'exists:programs,id'],
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'target_score' => ['required', 'numeric', 'min:0', 'max:400'],
            'target_grade' => ['required', 'string', 'in:unggul,sangat_baik,baik'],
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
            'program_id.required' => 'Program studi harus dipilih.',
            'program_id.exists' => 'Program studi yang dipilih tidak ditemukan.',
            'year.required' => 'Tahun harus diisi.',
            'year.integer' => 'Tahun harus berupa angka.',
            'year.min' => 'Tahun minimal 2020.',
            'year.max' => 'Tahun maksimal 2030.',
            'target_score.required' => 'Target skor harus diisi.',
            'target_score.numeric' => 'Target skor harus berupa angka.',
            'target_score.min' => 'Target skor minimal 0.',
            'target_score.max' => 'Target skor maksimal 400.',
            'target_grade.required' => 'Target grade harus dipilih.',
            'target_grade.in' => 'Target grade harus unggul, sangat_baik, atau baik.',
        ];
    }
}
