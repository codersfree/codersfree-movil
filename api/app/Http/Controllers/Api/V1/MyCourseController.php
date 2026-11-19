<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MyCourseResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class MyCourseController extends Controller
{
    /**
     * Courses the user bought, newest purchase first, with their progress.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $courses = $user->enrolledCourses()
            ->with('category')
            ->withCount(['lessons', 'lessons as completed_lessons_count' => self::completedBy($user)])
            ->orderByPivot('created_at', 'desc')
            ->get();

        return MyCourseResource::collection($courses);
    }

    /**
     * Syllabus of a bought course with videos and which lessons are watched.
     */
    public function show(Request $request, Course $course): MyCourseResource
    {
        Gate::authorize('learn', $course);

        $user = $request->user();

        $course->load(['category', 'sections.lessons'])
            ->loadCount(['lessons', 'lessons as completed_lessons_count' => self::completedBy($user)]);

        $course->completed_lesson_ids = $user->completedLessons()
            ->whereIn('lessons.id', $course->sections->flatMap->lessons->pluck('id'))
            ->pluck('lessons.id')
            ->all();

        return new MyCourseResource($course);
    }

    /**
     * Restricts a lessons count to the ones the user watched.
     *
     * @return callable(Builder<Lesson>): void
     */
    public static function completedBy(User $user): callable
    {
        return fn (Builder $query) => $query->whereHas('completedBy', fn (Builder $users) => $users->whereKey($user->id));
    }
}
