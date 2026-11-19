<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Curso visto por su instructor: estado, datos editables y (en el detalle) el temario completo.
 *
 * @mixin Course
 */
class InstructorCourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'level' => $this->level->value,
            'level_label' => $this->level->label(),
            'price' => $this->price,
            'price_label' => 'S/ '.$this->price,
            'cover_url' => $this->cover_path ? url('storage/'.$this->cover_path) : null,
            'status' => $this->status->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'sections_count' => $this->whenCounted('sections'),
            'lessons_count' => $this->whenCounted('lessons'),
            'sections' => $this->whenLoaded('sections', fn () => $this->sections->map(fn ($section) => [
                'id' => $section->id,
                'title' => $section->title,
                'position' => $section->position,
                'lessons' => $section->lessons->map(fn ($lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'video_url' => $lesson->video_url,
                    'position' => $lesson->position,
                ])->values(),
            ])->values()),
        ];
    }
}
