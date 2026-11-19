<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Página de pago que la app abre en un WebView. Las URL van firmadas (las genera la API).
Route::middleware('signed')->prefix('pago')->name('payments.')->group(function () {
    Route::get('{order}', [PaymentController::class, 'form'])->name('form');
    Route::post('{order}/respuesta', [PaymentController::class, 'response'])->name('response');
});
