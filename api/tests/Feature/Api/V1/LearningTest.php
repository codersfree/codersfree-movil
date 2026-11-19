<?php

use App\Models\Course;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/**
 * Curso publicado con 2 secciones x 2 lecciones, comprado por el usuario.
 */
function enrolledCourse(User $user): Course
{
    $course = Course::factory()->published()->withSyllabus(2, 2)->create();
    $user->enrolledCourses()->attach($course);

    return $course;
}

it('lists the bought courses with their progress', function () {
    Sanctum::actingAs($user = User::factory()->create());
    $course = enrolledCourse($user);
    Course::factory()->published()->create();
    $user->completedLessons()->attach($course->lessons()->first());

    $this->getJson('/api/v1/my-courses')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', $course->slug)
        ->assertJsonPath('data.0.lessons_count', 4)
        ->assertJsonPath('data.0.completed_lessons_count', 1)
        ->assertJsonPath('data.0.progress', 25);
});

it('shows the syllabus with videos and watched lessons to an enrolled student', function () {
    Sanctum::actingAs($user = User::factory()->create());
    $course = enrolledCourse($user);
    $watched = $course->lessons()->first();
    $user->completedLessons()->attach($watched);

    $response = $this->getJson("/api/v1/my-courses/{$course->slug}")->assertOk();

    $lessons = collect($response->json('data.sections'))->flatMap(fn ($section) => $section['lessons']);
    expect($lessons)->toHaveCount(4)
        ->and($lessons->firstWhere('id', $watched->id)['completed'])->toBeTrue()
        ->and($lessons->where('completed', false))->toHaveCount(3)
        ->and($lessons->first()['video_url'])->not->toBeEmpty();
});

it('forbids the syllabus to students who did not buy the course', function () {
    Sanctum::actingAs(User::factory()->create());
    $course = Course::factory()->published()->withSyllabus()->create();

    $this->getJson("/api/v1/my-courses/{$course->slug}")->assertForbidden();
});

it('marks and unmarks a lesson as watched updating the progress', function () {
    Sanctum::actingAs($user = User::factory()->create());
    $course = enrolledCourse($user);
    $lesson = $course->lessons()->first();

    $this->postJson("/api/v1/lessons/{$lesson->id}/completion")
        ->assertOk()
        ->assertJsonPath('data.progress', 25)
        ->assertJsonPath('lesson.completed', true);

    $this->postJson("/api/v1/lessons/{$lesson->id}/completion")->assertJsonPath('data.completed_lessons_count', 1);

    $this->deleteJson("/api/v1/lessons/{$lesson->id}/completion")
        ->assertOk()
        ->assertJsonPath('data.progress', 0)
        ->assertJsonPath('lesson.completed', false);
});

it('does not save progress for a course the user did not buy', function () {
    Sanctum::actingAs(User::factory()->create());
    $course = Course::factory()->published()->withSyllabus()->create();

    $this->postJson("/api/v1/lessons/{$course->lessons()->first()->id}/completion")->assertForbidden();
});

it('requires a token for my courses', function () {
    $this->getJson('/api/v1/my-courses')->assertUnauthorized();
});
