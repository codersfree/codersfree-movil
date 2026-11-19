<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lists only categories with published courses', function () {
    $withCourses = Category::factory()->create(['name' => 'Laravel']);
    Course::factory()->published()->for($withCourses)->create();
    Category::factory()->create(['name' => 'Vacía']);

    $this->getJson('/api/v1/categories')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Laravel');
});

it('lists published courses paginated with price in soles', function () {
    Course::factory()->published()->count(10)->create(['price' => '59.90']);
    Course::factory()->create(['title' => 'Borrador oculto']);

    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonCount(8, 'data')
        ->assertJsonPath('meta.total', 10)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('data.0.price_label', 'S/ 59.90')
        ->assertJsonStructure(['data' => [['id', 'slug', 'title', 'level_label', 'cover_url', 'category' => ['name'], 'instructor' => ['name']]]]);

    $this->getJson('/api/v1/courses?page=2')->assertOk()->assertJsonCount(2, 'data');
});

it('filters courses by category and searches by title', function () {
    $laravel = Category::factory()->create(['slug' => 'laravel']);
    Course::factory()->published()->for($laravel)->create(['title' => 'Laravel desde cero']);
    Course::factory()->published()->for($laravel)->create(['title' => 'API REST con Laravel']);
    Course::factory()->published()->create(['title' => 'Tailwind CSS práctico']);

    $this->getJson('/api/v1/courses?category=laravel')->assertOk()->assertJsonCount(2, 'data');
    $this->getJson('/api/v1/courses?search=tailwind')->assertOk()->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Tailwind CSS práctico');
    $this->getJson('/api/v1/courses?category=no-existe')->assertUnprocessable()
        ->assertJsonPath('errors.category.0', 'La categoría no existe.');
});

it('shows a published course with its syllabus without video urls', function () {
    $course = Course::factory()->published()->withSyllabus(2, 3)->create();

    $this->getJson("/api/v1/courses/{$course->slug}")
        ->assertOk()
        ->assertJsonPath('data.is_enrolled', false)
        ->assertJsonPath('data.lessons_count', 6)
        ->assertJsonCount(2, 'data.sections')
        ->assertJsonCount(3, 'data.sections.0.lessons')
        ->assertJsonMissingPath('data.sections.0.lessons.0.video_url');
});

it('tells an enrolled user that they already have the course', function () {
    $course = Course::factory()->published()->create();
    $user = User::factory()->create();
    $user->enrolledCourses()->attach($course);
    Sanctum::actingAs($user);

    $this->getJson("/api/v1/courses/{$course->slug}")->assertOk()->assertJsonPath('data.is_enrolled', true);
});

it('hides draft courses', function () {
    $course = Course::factory()->create();

    $this->getJson("/api/v1/courses/{$course->slug}")->assertNotFound();
});
