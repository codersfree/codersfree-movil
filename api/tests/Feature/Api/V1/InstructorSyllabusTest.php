<?php

use App\Models\Course;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    // Los roles se asignan antes de autenticar: spatie usa el guard por defecto (web).
    $this->otherInstructor = User::factory()->instructor()->create();
    $this->instructor = User::factory()->instructor()->create();
    $this->course = Course::factory()->for($this->instructor, 'instructor')->create();
    Sanctum::actingAs($this->instructor);
});

it('adds, renames and deletes sections', function () {
    $this->postJson("/api/v1/instructor/courses/{$this->course->slug}/sections", ['title' => 'Primeros pasos'])
        ->assertOk()
        ->assertJsonPath('data.sections.0.title', 'Primeros pasos')
        ->assertJsonPath('data.sections.0.position', 1);

    $section = $this->course->sections()->sole();

    $this->putJson("/api/v1/instructor/sections/{$section->id}", ['title' => 'Introducción'])
        ->assertOk()
        ->assertJsonPath('data.sections.0.title', 'Introducción');

    $this->deleteJson("/api/v1/instructor/sections/{$section->id}")
        ->assertOk()
        ->assertJsonCount(0, 'data.sections');
});

it('adds, edits and deletes lessons with title and video url', function () {
    $section = $this->course->sections()->create(['title' => 'Primeros pasos', 'position' => 1]);

    $this->postJson("/api/v1/instructor/sections/{$section->id}/lessons", [
        'title' => '¿Qué es Docker?',
        'video_url' => 'https://videos.codersfree.com/docker/01.mp4',
    ])->assertOk()->assertJsonPath('data.lessons_count', 1);

    $lesson = $section->lessons()->sole();

    $this->putJson("/api/v1/instructor/lessons/{$lesson->id}", [
        'title' => 'Qué es Docker',
        'video_url' => 'https://videos.codersfree.com/docker/01b.mp4',
    ])->assertOk()->assertJsonPath('data.sections.0.lessons.0.video_url', 'https://videos.codersfree.com/docker/01b.mp4');

    $this->deleteJson("/api/v1/instructor/lessons/{$lesson->id}")
        ->assertOk()
        ->assertJsonPath('data.lessons_count', 0);
});

it('validates the lesson video url', function () {
    $section = $this->course->sections()->create(['title' => 'Primeros pasos', 'position' => 1]);

    $this->postJson("/api/v1/instructor/sections/{$section->id}/lessons", ['title' => 'Uno', 'video_url' => 'videos/docker'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.video_url.0', 'Escribe una URL válida (https://…).');
});

it('does not let another instructor change the syllabus', function () {
    $section = $this->course->sections()->create(['title' => 'Primeros pasos', 'position' => 1]);
    Sanctum::actingAs($this->otherInstructor);

    $this->putJson("/api/v1/instructor/sections/{$section->id}", ['title' => 'Hackeado'])->assertForbidden();
    $this->deleteJson("/api/v1/instructor/sections/{$section->id}")->assertForbidden();
});
