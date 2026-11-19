<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\IndexCoursesRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseController extends Controller
{
    public const PER_PAGE = 8;

    /**
     * Published courses, paginated, filtered by category and searched by title.
     */
    public function index(IndexCoursesRequest $request): AnonymousResourceCollection
    {
        $courses = Course::query()
            ->published()
            ->with(['category', 'instructor'])
            ->when($request->validated('category'), fn ($query, string $slug) => $query->whereRelation('category', 'slug', $slug))
            ->when($request->validated('search'), fn ($query, string $search) => $query->where('title', 'like', '%'.$search.'%'))
            ->latest('published_at')
            ->latest('id')
            ->paginate(self::PER_PAGE);

        return CourseResource::collection($courses);
    }

    /**
     * Course detail with its syllabus. Works with or without a token.
     */
    public function show(Request $request, Course $course): CourseResource
    {
        abort_unless($course->isPublished(), 404, 'El curso no existe.');

        $course->load(['category', 'instructor', 'sections.lessons'])->loadCount('lessons');
        $course->is_enrolled = $request->user('sanctum')?->isEnrolledIn($course) ?? false;

        return new CourseResource($course);
    }
}
