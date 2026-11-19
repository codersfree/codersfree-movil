<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Course;
use App\Models\Order;
use App\Services\Izipay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use RuntimeException;

class OrderController extends Controller
{
    /**
     * Start the purchase of a course: create the order and the Izipay formToken.
     */
    public function store(Request $request, Course $course, Izipay $izipay): JsonResponse
    {
        abort_unless($course->isPublished(), 404, 'El curso no existe.');

        $user = $request->user();

        if ($user->isEnrolledIn($course)) {
            return response()->json(['message' => 'Ya tienes este curso.'], 409);
        }

        $order = $user->orders()->create([
            'reference' => (string) Str::uuid(),
            'course_id' => $course->id,
            'amount' => $course->price,
            'currency' => 'PEN',
            'status' => OrderStatus::Pending,
        ]);

        try {
            $order->update(['form_token' => $izipay->createFormToken($order)]);
        } catch (RuntimeException $exception) {
            Log::warning('Izipay CreatePayment falló', ['order' => $order->id, 'error' => $exception->getMessage()]);
            $order->update(['status' => OrderStatus::Rejected, 'failure_reason' => 'No se pudo iniciar el pago.']);

            return response()->json(['message' => 'No pudimos iniciar el pago con Izipay. Inténtalo otra vez.'], 502);
        }

        return (new OrderResource($order->load('course')))
            ->additional([
                'payment_url' => URL::temporarySignedRoute('payments.form', now()->addMinutes(30), $order),
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Current state of one of the user's orders.
     */
    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return new OrderResource($order->load('course'));
    }
}
