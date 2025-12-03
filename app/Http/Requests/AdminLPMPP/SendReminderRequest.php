<?php

namespace App\Http\Requests\AdminLPMPP;

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
            'assignment_id' => ['nullable', 'string', 'exists:assignments,id'],
            'unit_id' => ['nullable', 'string', 'exists:units,id'],
            'days_before' => ['required', 'integer', 'in:0,3,7'],
            'message' => ['nullable', 'string', 'max:1000'],
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
            'assignment_id.exists' => 'Assignment yang dipilih tidak ditemukan.',
            'unit_id.exists' => 'Unit yang dipilih tidak ditemukan.',
            'days_before.required' => 'Hari sebelum deadline harus dipilih.',
            'days_before.in' => 'Hari sebelum deadline harus 0, 3, atau 7.',
            'message.max' => 'Pesan maksimal 1000 karakter.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->assignment_id && ! $this->unit_id) {
                $validator->errors()->add('assignment_id', 'Assignment ID atau Unit ID harus diisi.');
            }
        });
    }
}

