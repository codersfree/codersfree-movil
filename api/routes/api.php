<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\InstructorCategoryController;
use App\Http\Controllers\Api\V1\InstructorCourseController;
use App\Http\Controllers\Api\V1\InstructorLessonController;
use App\Http\Controllers\Api\V1\InstructorSectionController;
use App\Http\Controllers\Api\V1\LessonProgressController;
use App\Http\Controllers\Api\V1\MyCourseController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProfilePhotoController;
use App\Http\Controllers\Api\V1\PushTokenController;
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

        Route::post('push-tokens', [PushTokenController::class, 'store'])->name('push-tokens.store');
        Route::delete('push-tokens', [PushTokenController::class, 'destroy'])->name('push-tokens.destroy');

        // Panel instructor: cada ruta exige el permiso con su mismo nombre (route.permission).
        Route::middleware('route.permission')->prefix('instructor')->name('instructor.')->group(function () {
            Route::get('categories', [InstructorCategoryController::class, 'index'])->name('categories.index');

            Route::get('courses', [InstructorCourseController::class, 'index'])->name('courses.index');
            Route::post('courses', [InstructorCourseController::class, 'store'])->name('courses.store');
            Route::get('courses/{course}', [InstructorCourseController::class, 'show'])->name('courses.show');
            Route::put('courses/{course}', [InstructorCourseController::class, 'update'])->name('courses.update');
            Route::post('courses/{course}/cover', [InstructorCourseController::class, 'cover'])->name('courses.cover');
            Route::post('courses/{course}/publish', [InstructorCourseController::class, 'publish'])->name('courses.publish');

            Route::post('courses/{course}/sections', [InstructorSectionController::class, 'store'])->name('sections.store');
            Route::put('sections/{section}', [InstructorSectionController::class, 'update'])->name('sections.update');
            Route::delete('sections/{section}', [InstructorSectionController::class, 'destroy'])->name('sections.destroy');

            Route::post('sections/{section}/lessons', [InstructorLessonController::class, 'store'])->name('lessons.store');
            Route::put('lessons/{lesson}', [InstructorLessonController::class, 'update'])->name('lessons.update');
            Route::delete('lessons/{lesson}', [InstructorLessonController::class, 'destroy'])->name('lessons.destroy');
        });
    });
});
