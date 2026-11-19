<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveLessonRequest extends FormRequest
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
            'video_url' => ['required', 'url:http,https', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Escribe el título de la lección.',
            'title.max' => 'El título no puede tener más de 120 caracteres.',
            'video_url.required' => 'Escribe la URL del video.',
            'video_url.url' => 'Escribe una URL válida (https://…).',
            'video_url.max' => 'La URL no puede tener más de 500 caracteres.',
        ];
    }
}
