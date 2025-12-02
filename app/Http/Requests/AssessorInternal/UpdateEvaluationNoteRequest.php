<?php

namespace App\Http\Requests\AssessorInternal;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvaluationNoteRequest extends FormRequest
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
            'short_assessment' => ['nullable', 'string', 'max:255'],
            'general_notes' => ['nullable', 'string'],
            'specific_notes' => ['nullable', 'array'],
            'specific_notes.*.criteria_id' => ['required_with:specific_notes', 'string'],
            'specific_notes.*.note' => ['required_with:specific_notes', 'string'],
            'status' => ['required', 'in:valid,invalid,minor_revision,major_revision'],
            'evaluation_file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'recommendation_file' => ['nullable', 'file', 'mimes:doc,docx', 'max:10240'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
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
            'short_assessment.max' => 'Penilaian singkat maksimal 255 karakter.',
            'status.required' => 'Status dokumen harus dipilih.',
            'status.in' => 'Status dokumen tidak valid.',
            'evaluation_file.file' => 'File evaluasi harus berupa file.',
            'evaluation_file.mimes' => 'File evaluasi harus berformat PDF.',
            'evaluation_file.max' => 'Ukuran file evaluasi maksimal 10MB.',
            'recommendation_file.file' => 'File rekomendasi harus berupa file.',
            'recommendation_file.mimes' => 'File rekomendasi harus berformat DOC atau DOCX.',
            'recommendation_file.max' => 'Ukuran file rekomendasi maksimal 10MB.',
            'attachments.*.file' => 'Lampiran harus berupa file.',
            'attachments.*.max' => 'Ukuran lampiran maksimal 10MB.',
        ];
    }
}
