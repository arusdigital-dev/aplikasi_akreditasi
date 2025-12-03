<?php

namespace App\Http\Requests\AdminLPMPP;

use Illuminate\Foundation\Http\FormRequest;

class SendBroadcastRequest extends FormRequest
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
            'unit_ids' => ['required', 'array', 'min:1'],
            'unit_ids.*' => ['required', 'string', 'exists:units,id'],
            'type' => ['required', 'string', 'in:broadcast_lpmpp,accreditation_schedule,policy_update,document_issue'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['required', 'string', 'in:in_app,email,whatsapp'],
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
            'unit_ids.required' => 'Minimal satu unit harus dipilih.',
            'unit_ids.min' => 'Minimal satu unit harus dipilih.',
            'unit_ids.*.exists' => 'Unit yang dipilih tidak ditemukan.',
            'type.required' => 'Tipe notifikasi harus dipilih.',
            'type.in' => 'Tipe notifikasi tidak valid.',
            'title.required' => 'Judul notifikasi harus diisi.',
            'title.max' => 'Judul notifikasi maksimal 255 karakter.',
            'message.required' => 'Pesan notifikasi harus diisi.',
            'message.max' => 'Pesan notifikasi maksimal 2000 karakter.',
            'channels.required' => 'Minimal satu channel harus dipilih.',
            'channels.min' => 'Minimal satu channel harus dipilih.',
            'channels.*.in' => 'Channel tidak valid.',
        ];
    }
}

