<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Course;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'course_id' => Course::factory()->published(),
            'amount' => '59.90',
            'currency' => 'PEN',
            'status' => OrderStatus::Pending,
            'form_token' => Str::random(40),
        ];
    }
}
