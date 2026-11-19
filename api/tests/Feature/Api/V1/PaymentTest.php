<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    config([
        'services.izipay.hmac_key' => 'hmac-prueba',
        'services.izipay.password' => 'clave-prueba',
        'services.izipay.public_key' => 'publica-prueba',
    ]);
});

/**
 * @return array{kr-answer: string, kr-hash: string, kr-hash-key: string, kr-hash-algorithm: string}
 */
function izipayAnswer(Order $order, string $status, array $transaction = [], ?string $key = 'hmac-prueba'): array
{
    $answer = json_encode([
        'orderStatus' => $status,
        'orderDetails' => ['orderId' => $order->reference, 'orderTotalAmount' => $order->amountInCents()],
        'transactions' => [array_merge(['uuid' => 'tx-1'], $transaction)],
    ]);

    return [
        'kr-answer' => $answer,
        'kr-hash' => hash_hmac('sha256', $answer, $key),
        'kr-hash-key' => 'sha256_hmac',
        'kr-hash-algorithm' => 'sha256_hmac',
    ];
}

function responseUrl(Order $order): string
{
    return URL::temporarySignedRoute('payments.response', now()->addHour(), $order);
}

it('shows the Izipay form for a pending order with a signed url', function () {
    $order = Order::factory()->create();

    $this->get(URL::temporarySignedRoute('payments.form', now()->addMinutes(30), $order))
        ->assertOk()
        ->assertSee('kr-form-token="'.$order->form_token.'"', false)
        ->assertSee('publica-prueba');

    $this->get("/pago/{$order->id}")->assertForbidden();
});

it('enrolls the buyer when Izipay confirms the payment with a valid hash', function () {
    $order = Order::factory()->create();

    $this->post(responseUrl($order), izipayAnswer($order, 'PAID'))
        ->assertOk()
        ->assertViewHas('result', fn (array $result) => $result['status'] === 'paid');

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Paid)
        ->and($order->transaction_uuid)->toBe('tx-1')
        ->and($order->user->isEnrolledIn($order->course))->toBeTrue();
});

it('does not enroll when the hash is not valid', function () {
    $order = Order::factory()->create();

    $this->post(responseUrl($order), izipayAnswer($order, 'PAID', key: 'clave-falsa'))
        ->assertOk()
        ->assertViewHas('result', fn (array $result) => $result['status'] === 'error');

    expect($order->refresh()->status)->toBe(OrderStatus::Pending)
        ->and($order->user->isEnrolledIn($order->course))->toBeFalse();
});

it('marks the order as rejected with the reason when the card is refused', function () {
    $order = Order::factory()->create();

    $this->post(responseUrl($order), izipayAnswer($order, 'UNPAID', ['detailedErrorMessage' => 'Fondos insuficientes']))
        ->assertOk()
        ->assertViewHas('result', fn (array $result) => $result['status'] === 'rejected')
        ->assertSee('Fondos insuficientes');

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Rejected)
        ->and($order->failure_reason)->toBe('Fondos insuficientes')
        ->and($order->user->isEnrolledIn($order->course))->toBeFalse();
});

it('rejects an answer that belongs to another order', function () {
    $order = Order::factory()->create();
    $other = Order::factory()->create();

    $this->post(responseUrl($order), izipayAnswer($other, 'PAID'))
        ->assertViewHas('result', fn (array $result) => $result['status'] === 'error');

    expect($order->refresh()->status)->toBe(OrderStatus::Pending);
});
