<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('registers a student and returns a token', function () {
    $response = $this->postJson('/api/v1/register', [
        'name' => 'María Ríos',
        'email' => 'maria@correo.com',
        'password' => 'secreto123',
        'password_confirmation' => 'secreto123',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'roles', 'permissions', 'photo_url']])
        ->assertJsonPath('user.roles', [])
        ->assertJsonPath('user.photo_url', null);

    expect(User::where('email', 'maria@correo.com')->exists())->toBeTrue();
});

it('ignores roles sent on registration', function () {
    $this->postJson('/api/v1/register', [
        'name' => 'Intruso',
        'email' => 'intruso@correo.com',
        'password' => 'secreto123',
        'password_confirmation' => 'secreto123',
        'role' => 'instructor',
        'roles' => ['instructor'],
    ])->assertCreated()->assertJsonPath('user.roles', []);
});

it('returns spanish validation errors per field on registration', function () {
    User::factory()->create(['email' => 'maria@correo.com']);

    $this->postJson('/api/v1/register', [
        'name' => 'María Ríos',
        'email' => 'maria@correo.com',
        'password' => '12345',
        'password_confirmation' => '123456',
    ])->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'El correo ya está registrado.')
        ->assertJsonPath('errors.password.0', 'La contraseña debe tener al menos 8 caracteres.')
        ->assertJsonPath('errors.password_confirmation.0', 'La confirmación de la contraseña no coincide.');
});

it('logs in with valid credentials', function () {
    $user = User::factory()->instructor()->create(['password' => 'secreto123']);

    $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'secreto123',
    ])->assertOk()
        ->assertJsonStructure(['token', 'user'])
        ->assertJsonPath('user.roles', ['instructor']);
});

it('rejects wrong credentials with a message', function () {
    $user = User::factory()->create(['password' => 'secreto123']);

    $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'otraclave1',
    ])->assertUnprocessable()
        ->assertJsonPath('message', 'El correo o la contraseña no son correctos.');
});

it('returns the authenticated user', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);
});

it('requires a token for private routes', function () {
    $this->getJson('/api/v1/user')->assertUnauthorized();
    $this->postJson('/api/v1/logout')->assertUnauthorized();
});

it('revokes the token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('app')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/logout')->assertNoContent();

    expect($user->tokens()->count())->toBe(0);
});
