<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveSectionRequest;
use App\Http\Resources\InstructorCourseResource;
use App\Models\Course;
use App\Models\Section;
use Illuminate\Support\Facades\Gate;

/**
 * Secciones del temario. Cada acción devuelve el curso con su temario actualizado.
 */
class InstructorSectionController extends Controller
{
    public function store(SaveSectionRequest $request, Course $course): InstructorCourseResource
    {
        Gate::authorize('manage', $course);

        $course->sections()->create([
            'title' => $request->validated('title'),
            'position' => (int) $course->sections()->max('position') + 1,
        ]);

        return $this->syllabus($course);
    }

    public function update(SaveSectionRequest $request, Section $section): InstructorCourseResource
    {
        Gate::authorize('manage', $section->course);

        $section->update($request->validated());

        return $this->syllabus($section->course);
    }

    public function destroy(Section $section): InstructorCourseResource
    {
        $course = $section->course;
        Gate::authorize('manage', $course);

        $section->delete();

        return $this->syllabus($course);
    }

    private function syllabus(Course $course): InstructorCourseResource
    {
        return new InstructorCourseResource(
            $course->load(['category', 'sections.lessons'])->loadCount(['sections', 'lessons'])
        );
    }
}
