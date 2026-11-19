<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\LessonProgressController;
use App\Http\Controllers\Api\V1\MyCourseController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProfilePhotoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('register');
    Route::post('login', [AuthController::class, 'login'])->name('login');

    // Catálogo público (el detalle reconoce el token si lo hay, para "Ir al curso").
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user'])->name('user.show');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('user/photo', ProfilePhotoController::class)->name('user.photo');

        Route::post('courses/{course}/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

        Route::get('my-courses', [MyCourseController::class, 'index'])->name('my-courses.index');
        Route::get('my-courses/{course}', [MyCourseController::class, 'show'])->name('my-courses.show');
        Route::post('lessons/{lesson}/completion', [LessonProgressController::class, 'store'])->name('lessons.completion.store');
        Route::delete('lessons/{lesson}/completion', [LessonProgressController::class, 'destroy'])->name('lessons.completion.destroy');

        // Panel instructor: cada ruta exige el permiso con su mismo nombre (route.permission).
        Route::middleware('route.permission')->prefix('instructor')->name('instructor.')->group(function () {
            //
        });
    });
});
