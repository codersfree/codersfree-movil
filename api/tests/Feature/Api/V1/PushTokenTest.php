<?php

use App\Models\PushToken;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('saves the phone push token for the user', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson('/api/v1/push-tokens', ['token' => 'ExponentPushToken[abc123]'])->assertNoContent();
    $this->postJson('/api/v1/push-tokens', ['token' => 'ExponentPushToken[abc123]'])->assertNoContent();

    expect(PushToken::sole()->user_id)->toBe($user->id);
});

it('moves the token to the user who logs in on that phone', function () {
    $token = PushToken::factory()->create(['token' => 'ExponentPushToken[telefono]']);
    Sanctum::actingAs($other = User::factory()->create());

    $this->postJson('/api/v1/push-tokens', ['token' => $token->token])->assertNoContent();

    expect($token->refresh()->user_id)->toBe($other->id);
});

it('rejects invalid tokens', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/push-tokens', ['token' => 'no-es-un-token'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.token.0', 'El token de notificaciones no es válido.');
});

it('forgets the token on logout', function () {
    Sanctum::actingAs($user = User::factory()->create());
    PushToken::factory()->for($user)->create(['token' => 'ExponentPushToken[salir]']);

    $this->deleteJson('/api/v1/push-tokens', ['token' => 'ExponentPushToken[salir]'])->assertNoContent();

    expect(PushToken::count())->toBe(0);
});
