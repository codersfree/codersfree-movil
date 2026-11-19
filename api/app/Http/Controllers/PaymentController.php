<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\Izipay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\View\View;

/**
 * Página de pago que la app abre en un WebView (firmada) y respuesta de Izipay.
 * Es web y no API porque Izipay necesita una página HTML con su formulario.
 */
class PaymentController extends Controller
{
    /**
     * Embedded Izipay form for a pending order.
     */
    public function form(Order $order, Izipay $izipay): View
    {
        abort_unless($order->status === OrderStatus::Pending && $order->form_token, 410, 'El pago ya no está disponible.');

        return view('payments.form', [
            'order' => $order->load('course'),
            'publicKey' => $izipay->publicKey(),
            'staticUrl' => $izipay->staticUrl(),
            'responseUrl' => URL::temporarySignedRoute('payments.response', now()->addHour(), $order),
        ]);
    }

    /**
     * Izipay posts the result here. The order is only paid if the signature (kr-hash) is valid.
     */
    public function response(Request $request, Order $order, Izipay $izipay): View
    {
        $rawAnswer = (string) $request->input('kr-answer', '');

        if (! $izipay->hasValidSignature($rawAnswer, (string) $request->input('kr-hash', ''), $request->input('kr-hash-key'))) {
            return $this->result('error', 'No pudimos verificar la respuesta del pago.', $order);
        }

        /** @var array<string, mixed> $answer */
        $answer = json_decode($rawAnswer, true) ?? [];
        $transaction = $answer['transactions'][0] ?? [];

        if (($answer['orderDetails']['orderId'] ?? null) !== $order->reference) {
            return $this->result('error', 'La respuesta del pago no corresponde a este pedido.', $order);
        }

        $isPaid = ($answer['orderStatus'] ?? null) === 'PAID'
            && (int) ($answer['orderDetails']['orderTotalAmount'] ?? 0) === $order->amountInCents();

        if (! $isPaid) {
            $reason = $transaction['detailedErrorMessage'] ?? $transaction['errorMessage'] ?? 'El banco rechazó el pago.';

            if ($order->status === OrderStatus::Pending) {
                $order->update(['status' => OrderStatus::Rejected, 'failure_reason' => mb_substr($reason, 0, 255)]);
            }

            return $this->result('rejected', $reason, $order);
        }

        DB::transaction(function () use ($order, $transaction) {
            $order->update([
                'status' => OrderStatus::Paid,
                'transaction_uuid' => $transaction['uuid'] ?? null,
                'failure_reason' => null,
                'paid_at' => $order->paid_at ?? now(),
            ]);

            $order->user->enrolledCourses()->syncWithoutDetaching([
                $order->course_id => ['order_id' => $order->id],
            ]);
        });

        return $this->result('paid', 'Curso comprado.', $order);
    }

    private function result(string $status, string $message, Order $order): View
    {
        return view('payments.result', [
            'message' => $message,
            'result' => [
                'type' => 'payment-result',
                'status' => $status,
                'message' => $message,
                'orderId' => $order->id,
            ],
        ]);
    }
}
