<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Curso comprado con el avance del alumno. En el detalle incluye el temario con videos.
 *
 * @mixin Course
 */
class MyCourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $lessonsCount = (int) $this->lessons_count;
        $completedCount = (int) $this->completed_lessons_count;
        /** @var array<int, int> $completedIds */
        $completedIds = $this->completed_lesson_ids ?? [];

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'cover_url' => $this->cover_path ? url('storage/'.$this->cover_path) : null,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'lessons_count' => $lessonsCount,
            'completed_lessons_count' => $completedCount,
            'progress' => $lessonsCount > 0 ? (int) round($completedCount * 100 / $lessonsCount) : 0,
            'sections' => $this->whenLoaded('sections', fn () => $this->sections->map(fn ($section) => [
                'id' => $section->id,
                'title' => $section->title,
                'position' => $section->position,
                'lessons' => $section->lessons->map(fn ($lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'position' => $lesson->position,
                    'video_url' => $lesson->video_url,
                    'completed' => in_array($lesson->id, $completedIds, true),
                ])->values(),
            ])->values()),
        ];
    }
}
