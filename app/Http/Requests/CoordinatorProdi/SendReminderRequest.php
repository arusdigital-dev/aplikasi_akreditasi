<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class SendReminderRequest extends FormRequest
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
            'document_id' => ['nullable', 'string', 'exists:documents,id'],
            'recipient_type' => ['required', 'string', 'in:dosen,tendik'],
            'recipient_ids' => ['required', 'array', 'min:1'],
            'recipient_ids.*' => ['required', 'string', 'exists:employees,id'],
            'message' => ['nullable', 'string', 'max:500'],
            'channel' => ['nullable', 'string', 'in:email,whatsapp,both'],
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
            'recipient_type.required' => 'Tipe penerima harus dipilih.',
            'recipient_type.in' => 'Tipe penerima harus dosen atau tendik.',
            'recipient_ids.required' => 'Penerima harus dipilih.',
            'recipient_ids.array' => 'Penerima harus berupa array.',
            'recipient_ids.min' => 'Minimal pilih satu penerima.',
            'recipient_ids.*.exists' => 'Salah satu penerima tidak ditemukan.',
            'message.max' => 'Pesan maksimal 500 karakter.',
            'channel.in' => 'Channel harus email, whatsapp, atau both.',
        ];
    }
}
