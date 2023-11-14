<?php


use App\Adapters\Selcom\SelcomController;
use App\Http\Controllers\integrations\FasthubController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::prefix('v1')->group(function () {
    Route::post('/validation/fasthub', [FasthubController::class,'validateReference']);
});


Route::prefix('v1/callbacks')->group(function () {

    Route::post('fasthub', [FasthubController::class,'handleCallback']);
    Route::post('fasthub/finalize', [FasthubController::class,'finalizeTransaction']);
    Route::post('fasthub/cancel', [FasthubController::class,'cancelTransaction']);

});


Route::prefix('v1/callbacks')->group(function () {

    Route::post('selcom', [SelcomController::class,'handleCallback']);
    Route::get('selcom/finalize', [SelcomController::class,'finalizeTransaction']);
    Route::get('selcom/cancel', [SelcomController::class,'cancelTransaction']);

});



