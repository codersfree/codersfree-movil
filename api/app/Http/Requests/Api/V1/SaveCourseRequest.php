<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\CourseLevel;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCourseRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:2000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'level' => ['required', Rule::enum(CourseLevel::class)],
            'price' => ['required', 'numeric', 'gt:0', 'max:9999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Escribe el título del curso.',
            'title.max' => 'El título no puede tener más de 120 caracteres.',
            'description.required' => 'Escribe una descripción.',
            'description.max' => 'La descripción no puede tener más de 2000 caracteres.',
            'category_id.required' => 'Elige una categoría.',
            'category_id.exists' => 'La categoría no existe.',
            'level.required' => 'Elige el nivel.',
            'level.enum' => 'El nivel debe ser básico, intermedio o avanzado.',
            'price.required' => 'Escribe el precio.',
            'price.numeric' => 'El precio debe ser un número.',
            'price.gt' => 'El precio debe ser mayor a 0.',
            'price.max' => 'El precio no puede ser mayor a S/ 9999.99.',
        ];
    }
}
