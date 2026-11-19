<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MyCourseResource;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LessonProgressController extends Controller
{
    /**
     * Mark a lesson as watched and return the updated course progress.
     */
    public function store(Request $request, Lesson $lesson): MyCourseResource
    {
        return $this->update($request, $lesson, completed: true);
    }

    /**
     * Unmark a watched lesson and return the updated course progress.
     */
    public function destroy(Request $request, Lesson $lesson): MyCourseResource
    {
        return $this->update($request, $lesson, completed: false);
    }

    private function update(Request $request, Lesson $lesson, bool $completed): MyCourseResource
    {
        $course = $lesson->section->course;
        Gate::authorize('learn', $course);

        $user = $request->user();

        if ($completed) {
            $user->completedLessons()->syncWithoutDetaching([$lesson->id]);
        } else {
            $user->completedLessons()->detach($lesson->id);
        }

        $course->loadCount(['lessons', 'lessons as completed_lessons_count' => MyCourseController::completedBy($user)]);

        return (new MyCourseResource($course))->additional([
            'lesson' => ['id' => $lesson->id, 'completed' => $completed],
        ]);
    }
}
