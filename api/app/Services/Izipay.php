<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Pasarela Izipay (API REST V4 de Lyra). Las credenciales se leen de config/services.php.
 */
class Izipay
{
    /**
     * Crea el pago en Izipay y devuelve el formToken para mostrar el formulario.
     *
     * @throws RuntimeException si Izipay no devuelve un formToken.
     */
    public function createFormToken(Order $order): string
    {
        $response = Http::withBasicAuth(config('services.izipay.username'), config('services.izipay.password'))
            ->acceptJson()
            ->timeout(15)
            ->post(rtrim(config('services.izipay.api_url'), '/').'/api-payment/V4/Charge/CreatePayment', [
                'amount' => $order->amountInCents(),
                'currency' => $order->currency,
                'orderId' => $order->reference,
                'customer' => [
                    'email' => $order->user->email,
                    'reference' => (string) $order->user_id,
                ],
            ]);

        $formToken = $response->json('answer.formToken');

        if (! $response->successful() || $response->json('status') !== 'SUCCESS' || ! $formToken) {
            throw new RuntimeException('Izipay no devolvió un formToken: '.($response->json('answer.errorMessage') ?? $response->status()));
        }

        return $formToken;
    }

    /**
     * Valida que kr-answer venga de Izipay: kr-hash es el HMAC-SHA-256 de kr-answer.
     * La respuesta del navegador se firma con la clave HMAC; la IPN, con la contraseña.
     */
    public function hasValidSignature(string $answer, string $hash, ?string $hashKey): bool
    {
        $key = $hashKey === 'password'
            ? config('services.izipay.password')
            : config('services.izipay.hmac_key');

        if (! $key || $hash === '') {
            return false;
        }

        return hash_equals(hash_hmac('sha256', $answer, $key), $hash);
    }

    public function publicKey(): ?string
    {
        return config('services.izipay.public_key');
    }

    public function staticUrl(): string
    {
        return rtrim(config('services.izipay.static_url'), '/');
    }
}
