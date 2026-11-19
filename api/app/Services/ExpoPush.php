<?php

namespace App\Services;

use App\Models\Course;
use App\Models\PushToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envía notificaciones con la API de Expo Push. La URL y el token de acceso (opcional)
 * se leen de config/services.php.
 */
class ExpoPush
{
    /** Expo acepta hasta 100 mensajes por petición. */
    private const CHUNK = 100;

    /**
     * Avisa a todos los celulares registrados (menos los del instructor) que hay un curso nuevo.
     */
    public function notifyNewCourse(Course $course): int
    {
        $tokens = PushToken::query()
            ->where('user_id', '!=', $course->user_id)
            ->pluck('token');

        $messages = $tokens->map(fn (string $token) => [
            'to' => $token,
            'title' => 'Nuevo curso: '.$course->title,
            'body' => 'Ya está disponible en el catálogo. Tócalo para verlo.',
            'sound' => 'default',
            'channelId' => 'default',
            'data' => ['type' => 'course', 'slug' => $course->slug],
        ]);

        foreach ($messages->chunk(self::CHUNK) as $chunk) {
            $this->send($chunk->values()->all());
        }

        return $messages->count();
    }

    /**
     * @param  list<array<string, mixed>>  $messages
     */
    private function send(array $messages): void
    {
        $request = Http::acceptJson()->asJson()->timeout(15);

        if ($token = config('services.expo.access_token')) {
            $request = $request->withToken($token);
        }

        $response = $request->post(config('services.expo.push_url'), $messages);

        if ($response->failed()) {
            Log::warning('Expo Push falló', ['status' => $response->status(), 'body' => $response->body()]);

            return;
        }

        // Un token que ya no existe (app desinstalada) se borra para no reintentarlo.
        foreach ($response->json('data', []) as $index => $ticket) {
            if (($ticket['details']['error'] ?? null) === 'DeviceNotRegistered') {
                PushToken::where('token', $messages[$index]['to'] ?? null)->delete();
            }
        }
    }
}
