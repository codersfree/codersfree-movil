<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige que el usuario tenga el permiso que se llama igual que la ruta (por ejemplo "instructor.courses.index").
 */
class CheckRoutePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();

        abort_unless(
            $routeName && $request->user()?->can($routeName),
            Response::HTTP_FORBIDDEN,
            'No tienes permiso para realizar esta acción.',
        );

        return $next($request);
    }
}
