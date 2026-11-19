<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Storage::fake('public');
});

it('uploads the profile photo and returns its url', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $response = $this->postJson('/api/v1/user/photo', [
        'photo' => UploadedFile::fake()->image('foto.jpg', 400, 400),
    ]);

    $response->assertOk();

    $path = $user->refresh()->photo_path;

    Storage::disk('public')->assertExists($path);
    expect($response->json('data.photo_url'))->toEndWith('storage/'.$path);
});

it('replaces the previous photo', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson('/api/v1/user/photo', ['photo' => UploadedFile::fake()->image('a.jpg')]);
    $firstPath = $user->refresh()->photo_path;

    $this->postJson('/api/v1/user/photo', ['photo' => UploadedFile::fake()->image('b.jpg')]);

    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($user->refresh()->photo_path);
});

it('rejects files that are not images', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/user/photo', [
        'photo' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonValidationErrors('photo');
});

it('requires a token to upload a photo', function () {
    $this->postJson('/api/v1/user/photo')->assertUnauthorized();
});
