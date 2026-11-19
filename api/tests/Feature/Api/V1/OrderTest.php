<?php

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    config([
        'services.izipay.username' => 'usuario-prueba',
        'services.izipay.password' => 'clave-prueba',
        'services.izipay.api_url' => 'https://izipay.test',
    ]);
});

it('creates an order with the Izipay form token and a signed payment url', function () {
    Http::fake(['izipay.test/*' => Http::response(['status' => 'SUCCESS', 'answer' => ['formToken' => 'token-123']])]);
    $course = Course::factory()->published()->create(['price' => '59.90']);
    Sanctum::actingAs($user = User::factory()->create());

    $response = $this->postJson("/api/v1/courses/{$course->slug}/orders");

    $response->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.amount_label', 'S/ 59.90');
    expect($response->json('payment_url'))->toContain('/pago/')->toContain('signature=');

    $order = Order::sole();
    expect($order->form_token)->toBe('token-123')->and($order->user_id)->toBe($user->id);

    Http::assertSent(fn ($request) => $request['amount'] === 5990
        && $request['currency'] === 'PEN'
        && $request['orderId'] === $order->reference
        && $request->hasHeader('Authorization', 'Basic '.base64_encode('usuario-prueba:clave-prueba')));
});

it('does not let a user buy the same course twice', function () {
    Http::fake();
    $course = Course::factory()->published()->create();
    $user = User::factory()->create();
    $user->enrolledCourses()->attach($course);
    Sanctum::actingAs($user);

    $this->postJson("/api/v1/courses/{$course->slug}/orders")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Ya tienes este curso.');

    Http::assertNothingSent();
    expect(Order::count())->toBe(0);
});

it('reports when Izipay cannot start the payment', function () {
    Http::fake(['izipay.test/*' => Http::response(['status' => 'ERROR', 'answer' => ['errorMessage' => 'invalid']], 200)]);
    $course = Course::factory()->published()->create();
    Sanctum::actingAs(User::factory()->create());

    $this->postJson("/api/v1/courses/{$course->slug}/orders")
        ->assertStatus(502)
        ->assertJsonPath('message', 'No pudimos iniciar el pago con Izipay. Inténtalo otra vez.');

    expect(Order::sole()->status)->toBe(OrderStatus::Rejected);
});

it('requires a token to buy', function () {
    $course = Course::factory()->published()->create();

    $this->postJson("/api/v1/courses/{$course->slug}/orders")->assertUnauthorized();
});

it('only shows an order to its buyer', function () {
    $order = Order::factory()->create();

    Sanctum::actingAs($order->user);
    $this->getJson("/api/v1/orders/{$order->id}")->assertOk()->assertJsonPath('data.reference', $order->reference);

    Sanctum::actingAs(User::factory()->create());
    $this->getJson("/api/v1/orders/{$order->id}")->assertForbidden();
});
