<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveLessonRequest;
use App\Http\Resources\InstructorCourseResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Support\Facades\Gate;

/**
 * Lecciones de una sección (título y URL del video). Cada acción devuelve el temario actualizado.
 */
class InstructorLessonController extends Controller
{
    public function store(SaveLessonRequest $request, Section $section): InstructorCourseResource
    {
        Gate::authorize('manage', $section->course);

        $section->lessons()->create([
            ...$request->validated(),
            'position' => (int) $section->lessons()->max('position') + 1,
        ]);

        return $this->syllabus($section->course);
    }

    public function update(SaveLessonRequest $request, Lesson $lesson): InstructorCourseResource
    {
        $course = $lesson->section->course;
        Gate::authorize('manage', $course);

        $lesson->update($request->validated());

        return $this->syllabus($course);
    }

    public function destroy(Lesson $lesson): InstructorCourseResource
    {
        $course = $lesson->section->course;
        Gate::authorize('manage', $course);

        $lesson->delete();

        return $this->syllabus($course);
    }

    private function syllabus(Course $course): InstructorCourseResource
    {
        return new InstructorCourseResource(
            $course->load(['category', 'sections.lessons'])->loadCount(['sections', 'lessons'])
        );
    }
}
