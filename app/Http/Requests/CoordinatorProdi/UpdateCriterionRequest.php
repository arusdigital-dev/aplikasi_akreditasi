<?php

namespace App\Http\Requests\CoordinatorProdi;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'standard_id' => ['required', 'integer', 'exists:standards,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'weight' => ['required', 'numeric', 'min:0'],
            'order_index' => ['required', 'integer', 'min:1'],
        ];
    }
}

