<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class GenerateReportRequest extends FormRequest
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
            'type' => ['required', 'string', 'in:completeness,evaluation,executive'],
            'program_id' => ['nullable', 'string', 'exists:programs,id'],
            'unit_id' => ['nullable', 'string', 'exists:units,id'],
            'format' => ['required', 'string', 'in:pdf,excel,word'],
            'date_range' => ['nullable', 'array'],
            'date_range.start' => ['nullable', 'date'],
            'date_range.end' => ['nullable', 'date', 'after_or_equal:date_range.start'],
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
            'type.required' => 'Tipe laporan harus dipilih.',
            'type.in' => 'Tipe laporan tidak valid.',
            'program_id.exists' => 'Program yang dipilih tidak ditemukan.',
            'unit_id.exists' => 'Unit yang dipilih tidak ditemukan.',
            'format.required' => 'Format laporan harus dipilih.',
            'format.in' => 'Format laporan tidak valid.',
            'date_range.end.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal awal.',
        ];
    }
}

