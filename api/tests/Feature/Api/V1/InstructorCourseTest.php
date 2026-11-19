<?php

use App\Enums\CourseStatus;
use App\Models\Category;
use App\Models\Course;
use App\Models\PushToken;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

function coursePayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Docker para desarrolladores',
        'description' => 'Aprende a crear contenedores.',
        'category_id' => Category::factory()->create()->id,
        'level' => 'intermedio',
        'price' => '69.90',
    ], $overrides);
}

it('creates a course as a draft and lists it for its instructor', function () {
    Sanctum::actingAs($instructor = User::factory()->instructor()->create());

    $this->postJson('/api/v1/instructor/courses', coursePayload())
        ->assertCreated()
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.slug', 'docker-para-desarrolladores')
        ->assertJsonPath('data.price_label', 'S/ 69.90');

    Course::factory()->create(); // de otro instructor

    $this->getJson('/api/v1/instructor/courses')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'draft');

    expect(Course::where('user_id', $instructor->id)->sole()->status)->toBe(CourseStatus::Draft);
});

it('validates the course with spanish messages', function () {
    Sanctum::actingAs(User::factory()->instructor()->create());

    $this->postJson('/api/v1/instructor/courses', coursePayload(['title' => '', 'price' => '-5', 'category_id' => null]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.title.0', 'Escribe el título del curso.')
        ->assertJsonPath('errors.price.0', 'El precio debe ser mayor a 0.')
        ->assertJsonPath('errors.category_id.0', 'Elige una categoría.');
});

it('updates a course and its cover', function () {
    Storage::fake('public');
    $instructor = User::factory()->instructor()->create();
    $course = Course::factory()->for($instructor, 'instructor')->create();
    Sanctum::actingAs($instructor);

    $this->putJson("/api/v1/instructor/courses/{$course->slug}", coursePayload(['title' => 'Nuevo título']))
        ->assertOk()
        ->assertJsonPath('data.title', 'Nuevo título')
        ->assertJsonPath('data.slug', $course->slug);

    $response = $this->postJson("/api/v1/instructor/courses/{$course->slug}/cover", [
        'cover' => UploadedFile::fake()->image('portada.jpg', 800, 450),
    ])->assertOk();

    Storage::disk('public')->assertExists($course->refresh()->cover_path);
    expect($response->json('data.cover_url'))->toEndWith($course->cover_path);
});

it('does not let an instructor edit another instructor course', function () {
    Sanctum::actingAs(User::factory()->instructor()->create());
    $course = Course::factory()->create();

    $this->getJson("/api/v1/instructor/courses/{$course->slug}")->assertForbidden();
    $this->putJson("/api/v1/instructor/courses/{$course->slug}", coursePayload())->assertForbidden();
});

it('keeps students without the permission out of the panel', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/instructor/courses')->assertForbidden();
    $this->postJson('/api/v1/instructor/courses', coursePayload())->assertForbidden();
});

it('does not publish a course without lessons', function () {
    $instructor = User::factory()->instructor()->create();
    $course = Course::factory()->for($instructor, 'instructor')->create();
    Sanctum::actingAs($instructor);

    $this->postJson("/api/v1/instructor/courses/{$course->slug}/publish")
        ->assertUnprocessable()
        ->assertJsonPath('message', 'El curso necesita al menos una lección para publicarse.');

    expect($course->refresh()->status)->toBe(CourseStatus::Draft);
});

it('publishes a course and notifies students with Expo Push', function () {
    Http::fake(['exp.host/*' => Http::response(['data' => [['status' => 'ok']]])]);
    $instructor = User::factory()->instructor()->create();
    $course = Course::factory()->for($instructor, 'instructor')->withSyllabus(1, 1)->create(['title' => 'Docker']);
    $student = PushToken::factory()->create();
    PushToken::factory()->for($instructor)->create();
    Sanctum::actingAs($instructor);

    $this->postJson("/api/v1/instructor/courses/{$course->slug}/publish")
        ->assertOk()
        ->assertJsonPath('data.status', 'published');

    expect($course->refresh()->status)->toBe(CourseStatus::Published);
    $this->getJson('/api/v1/courses')->assertJsonPath('data.0.slug', $course->slug);

    Http::assertSent(fn ($request) => count($request->data()) === 1
        && $request[0]['to'] === $student->token
        && $request[0]['title'] === 'Nuevo curso: Docker'
        && $request[0]['data']['slug'] === $course->slug);
});

it('lists all categories for the editor', function () {
    Category::factory()->count(3)->create();
    Sanctum::actingAs(User::factory()->instructor()->create());

    $this->getJson('/api/v1/instructor/categories')->assertOk()->assertJsonCount(3, 'data');
});
