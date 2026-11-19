<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfilePhotoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->name('register');
    Route::post('login', [AuthController::class, 'login'])->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user'])->name('user.show');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('user/photo', ProfilePhotoController::class)->name('user.photo');

        // Panel instructor: cada ruta exige el permiso con su mismo nombre (route.permission).
        Route::middleware('route.permission')->prefix('instructor')->name('instructor.')->group(function () {
            //
        });
    });
});
