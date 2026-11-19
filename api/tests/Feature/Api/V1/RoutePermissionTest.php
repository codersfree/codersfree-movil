<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Route::middleware(['api', 'auth:sanctum', 'route.permission'])
        ->get('/api/v1/instructor/courses-test', fn () => response()->json(['ok' => true]))
        ->name('instructor.courses.index');
});

it('lets a user with the permission named like the route through', function () {
    Sanctum::actingAs(User::factory()->instructor()->create());

    $this->getJson('/api/v1/instructor/courses-test')->assertOk();
});

it('forbids a user without the permission', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/instructor/courses-test')
        ->assertForbidden()
        ->assertJsonPath('message', 'No tienes permiso para realizar esta acción.');
});

it('exposes roles and permissions on the user resource', function () {
    Sanctum::actingAs(User::factory()->instructor()->create());

    $this->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('data.roles', ['instructor'])
        ->assertJsonPath('data.permissions', ['instructor.courses.index']);
});
