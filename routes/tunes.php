<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\contest\ContestantsController;
use App\Http\Controllers\contest\VotesController;
use App\Http\Controllers\management\VotesWeightManagementController;
use App\Http\Controllers\tunes\TunesAgentController;
use App\Http\Controllers\tunes\TunesCustomerController;
use Illuminate\Http\Request;
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

Route::middleware('auth:api')->get('/v1/user', function (Request $request) {
    return $request->user();
});


Route::prefix('v1/auth')->group(function () {

    Route::post('login', [AuthController::class,'login']);

});


Route::prefix("/v1/tunes/agent")->middleware('auth:api')->group(function(){

    Route::get('/stats', [TunesAgentController::class,'getStats']);
    Route::post('/subscription/add', [TunesAgentController::class,'addSubscription']);
    Route::post('/subscription/retry', [TunesAgentController::class,'retryPushInitiation']);
    Route::get('/subscription/get', [TunesAgentController::class,'getSubscriptions']);

});

Route::prefix("/v1/tunes/customer")->group(function(){

    Route::get('/packages', [TunesCustomerController::class,'getPackages']);
    Route::post('/subscription/add', [TunesCustomerController::class,'addSubscription']);
    Route::post('/subscription/details', [TunesCustomerController::class,'getSubscription']);
    Route::post('/subscription/payment/retry', [TunesCustomerController::class,'retryPayment']);

});

