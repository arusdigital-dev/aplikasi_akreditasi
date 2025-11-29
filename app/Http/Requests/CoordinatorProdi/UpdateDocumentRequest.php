<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
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
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'year' => ['sometimes', 'required', 'integer', 'min:2020', 'max:2030'],
            'metadata' => ['nullable', 'array'],
            'metadata.fakultas' => ['nullable', 'string', 'max:255'],
            'metadata.prodi' => ['nullable', 'string', 'max:255'],
            'metadata.dosen' => ['nullable', 'string', 'max:255'],
            'metadata.tendik' => ['nullable', 'string', 'max:255'],
            'metadata.description' => ['nullable', 'string', 'max:1000'],
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
            'file.file' => 'File yang diupload tidak valid.',
            'file.mimes' => 'File harus berformat PDF, DOC, atau DOCX.',
            'file.max' => 'Ukuran file maksimal 10MB.',
            'category.required' => 'Kategori dokumen harus diisi.',
            'category.max' => 'Kategori dokumen maksimal 255 karakter.',
            'year.required' => 'Tahun dokumen harus diisi.',
            'year.integer' => 'Tahun dokumen harus berupa angka.',
            'year.min' => 'Tahun dokumen minimal 2020.',
            'year.max' => 'Tahun dokumen maksimal 2030.',
            'metadata.array' => 'Metadata harus berupa array.',
        ];
    }
}
