<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CourseStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SaveCourseRequest;
use App\Http\Requests\Api\V1\UpdateCourseCoverRequest;
use App\Http\Resources\InstructorCourseResource;
use App\Models\Course;
use App\Services\ExpoPush;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InstructorCourseController extends Controller
{
    /**
     * The instructor's own courses, drafts first, then newest.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $courses = $request->user()->createdCourses()
            ->with('category')
            ->withCount(['sections', 'lessons'])
            ->orderByRaw('status = ? desc', [CourseStatus::Draft->value])
            ->latest('updated_at')
            ->get();

        return InstructorCourseResource::collection($courses);
    }

    /**
     * Create a course as a draft.
     */
    public function store(SaveCourseRequest $request): JsonResponse
    {
        $course = $request->user()->createdCourses()->create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug($request->validated('title')),
            'status' => CourseStatus::Draft,
        ]);

        return $this->detail($course)->response()->setStatusCode(201);
    }

    public function show(Course $course): InstructorCourseResource
    {
        Gate::authorize('manage', $course);

        return $this->detail($course);
    }

    /**
     * Update the course data. The slug does not change, so links keep working.
     */
    public function update(SaveCourseRequest $request, Course $course): InstructorCourseResource
    {
        Gate::authorize('manage', $course);

        $course->update($request->validated());

        return $this->detail($course);
    }

    /**
     * Replace the cover (taken with the camera or chosen from the gallery).
     */
    public function cover(UpdateCourseCoverRequest $request, Course $course): InstructorCourseResource
    {
        Gate::authorize('manage', $course);

        $previous = $course->cover_path;
        $course->update(['cover_path' => $request->file('cover')->store('covers', 'public')]);

        if ($previous) {
            Storage::disk('public')->delete($previous);
        }

        return $this->detail($course);
    }

    /**
     * Publish the course if it has at least one lesson, and notify the students.
     */
    public function publish(Course $course, ExpoPush $push): InstructorCourseResource|JsonResponse
    {
        Gate::authorize('manage', $course);

        if ($course->isPublished()) {
            return $this->detail($course);
        }

        if (! $course->lessons()->exists()) {
            return response()->json([
                'message' => 'El curso necesita al menos una lección para publicarse.',
            ], 422);
        }

        $course->update(['status' => CourseStatus::Published, 'published_at' => now()]);

        // La notificación se envía después de responder, para no hacer esperar al instructor.
        defer(fn () => $push->notifyNewCourse($course));

        return $this->detail($course);
    }

    private function detail(Course $course): InstructorCourseResource
    {
        $course->load(['category', 'sections.lessons'])->loadCount(['sections', 'lessons']);

        return new InstructorCourseResource($course);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'curso';
        $slug = $base;
        $suffix = 2;

        while (Course::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
