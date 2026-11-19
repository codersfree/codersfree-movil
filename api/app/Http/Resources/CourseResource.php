<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Course
 */
class CourseResource extends JsonResource
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
            'level' => $this->level->value,
            'level_label' => $this->level->label(),
            'price' => $this->price,
            'price_label' => 'S/ '.$this->price,
            'cover_url' => $this->cover_path ? url('storage/'.$this->cover_path) : null,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'instructor' => $this->whenLoaded('instructor', fn () => [
                'id' => $this->instructor->id,
                'name' => $this->instructor->name,
            ]),
            'description' => $this->when($this->relationLoaded('sections'), $this->description),
            'lessons_count' => $this->whenCounted('lessons'),
            'sections' => SectionResource::collection($this->whenLoaded('sections')),
            'is_enrolled' => $this->when(isset($this->is_enrolled), fn () => (bool) $this->is_enrolled),
        ];
    }
}
