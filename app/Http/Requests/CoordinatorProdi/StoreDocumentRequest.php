<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'program_id' => ['required', 'string', 'exists:programs,id'],
            'category' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'metadata' => ['nullable', 'array'],
            'metadata.fakultas' => ['nullable', 'string', 'max:255'],
            'metadata.prodi' => ['nullable', 'string', 'max:255'],
            'metadata.dosen' => ['nullable', 'string', 'max:255'],
            'metadata.tendik' => ['nullable', 'string', 'max:255'],
            'metadata.description' => ['nullable', 'string', 'max:1000'],
            'assignment_id' => ['nullable', 'string', 'exists:assignments,id'],
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
            'file.required' => 'File dokumen harus diupload.',
            'file.file' => 'File yang diupload tidak valid.',
            'file.mimes' => 'File harus berformat PDF, DOC, atau DOCX.',
            'file.max' => 'Ukuran file maksimal 10MB.',
            'program_id.required' => 'Program studi harus dipilih.',
            'program_id.exists' => 'Program studi yang dipilih tidak ditemukan.',
            'category.required' => 'Kategori dokumen harus diisi.',
            'category.max' => 'Kategori dokumen maksimal 255 karakter.',
            'year.required' => 'Tahun dokumen harus diisi.',
            'year.integer' => 'Tahun dokumen harus berupa angka.',
            'year.min' => 'Tahun dokumen minimal 2020.',
            'year.max' => 'Tahun dokumen maksimal 2030.',
            'metadata.array' => 'Metadata harus berupa array.',
            'assignment_id.exists' => 'Assignment yang dipilih tidak ditemukan.',
        ];
    }
}
