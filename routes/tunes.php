<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\contest\ContestantsController;
use App\Http\Controllers\contest\VotesController;
use App\Http\Controllers\management\VotesWeightManagementController;
use App\Http\Controllers\tunes\CustomerBeatController;
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
    Route::post('/subscription/details', [CustomerBeatController::class,'getDetails']);
    Route::post('/subscription/payment/retry', [TunesCustomerController::class,'retryPayment']);

    // BEAT guided flow (draft → script → preview → payment)
    Route::post('/subscription/draft', [CustomerBeatController::class,'createDraft']);
    Route::post('/subscription/analyze', [CustomerBeatController::class,'analyzeBusiness']);
    Route::post('/subscription/follow-up', [CustomerBeatController::class,'answerFollowUp']);
    Route::post('/subscription/script/generate', [CustomerBeatController::class,'generateScript']);
    Route::post('/subscription/script/select', [CustomerBeatController::class,'selectScriptVariant']);
    Route::post('/subscription/script/approve', [CustomerBeatController::class,'approveScript']);
    Route::get('/tts/voices', [CustomerBeatController::class,'listVoices']);
    Route::get('/tts/voices/{voiceId}/sample', [CustomerBeatController::class,'previewVoiceSample']);
    Route::get('/music/tracks', [CustomerBeatController::class,'listMusicTracks']);
    Route::get('/music/tracks/{trackId}/preview', [CustomerBeatController::class,'previewMusicTrack']);
    Route::post('/subscription/audio/preview', [CustomerBeatController::class,'generatePreview']);
    Route::post('/subscription/audio/pronunciation-test', [CustomerBeatController::class,'generatePronunciationTest']);
    Route::post('/subscription/audio/pronunciation', [CustomerBeatController::class,'updatePronunciation']);
    Route::post('/subscription/audio/approve', [CustomerBeatController::class,'approvePreview']);
    Route::post('/subscription/payment/init', [CustomerBeatController::class,'initiatePayment']);
    Route::get('/audio/{assetId}/stream', [CustomerBeatController::class,'streamAudio'])
        ->name('customer.audio.stream')
        ->middleware('signed');

});

