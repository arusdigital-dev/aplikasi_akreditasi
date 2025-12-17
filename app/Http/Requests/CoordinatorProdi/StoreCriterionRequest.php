<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class StoreCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'standard_id' => ['nullable', 'integer', 'exists:standards,id'],
            'program_id' => ['required_without:standard_id', 'integer', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'order_index' => ['required', 'integer', 'min:1'],
            'lam_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
