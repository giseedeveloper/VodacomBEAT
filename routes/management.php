<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\management\NotificationTemplatesManagementController;
use App\Http\Controllers\management\AgentsManagementController;
use App\Http\Controllers\management\SelcomManagementController;
use App\Http\Controllers\management\SmsGatewaysManagementController;
use App\Http\Controllers\management\SubscriptionPackagesManagementController;
use App\Http\Controllers\management\TopicsManagementController;
use App\Http\Controllers\management\UsersManagementController;
use App\Http\Controllers\reports\SubscriptionsManagementController;
use App\Http\Controllers\reports\TransactionsManagementController;
use App\Http\Controllers\tunes\BeatAudioController;
use App\Http\Controllers\tunes\BeatScriptController;
use App\Http\Controllers\tunes\TunesInstallationController;
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


Route::prefix("/v1/management/users")->middleware('auth:api')->group(function(){

    Route::get('/', [UsersManagementController::class,'fetchUsers']);
    Route::post('/add', [UsersManagementController::class,'createUser']);
    Route::post('/update', [UsersManagementController::class,'updateUser']);
    Route::post('/password/reset', [UsersManagementController::class,'resetUserPassword']);

    Route::get('/permissions/all', [UsersManagementController::class,'fetchSystemPermissions']);
    Route::post('/permissions/assign', [UsersManagementController::class,'assignPermissionsToUser']);

});


Route::prefix('v1/management/templates')->middleware('auth:api')->group(function () {

    Route::get('/notifications', [NotificationTemplatesManagementController::class,'fetchNotificationTemplates']);
    Route::post('/notifications/update', [NotificationTemplatesManagementController::class,'updateNotificationTemplate']);

});

Route::prefix('v1/management/config/packages')->middleware('auth:api')->group(function () {

    Route::get('/list', [SubscriptionPackagesManagementController::class,'fetchPackages']);
    Route::post('/update', [SubscriptionPackagesManagementController::class,'updatePackage']);

});


Route::prefix('v1/referrals')->middleware('auth:api')->group(function () {
    Route::get('/', [AgentsManagementController::class,'getAgents']);
    Route::get('/agent', [AgentsManagementController::class,'getAgent']);
    Route::post('/create', [AgentsManagementController::class,'addAgent']);
    Route::post('/update', [AgentsManagementController::class,'updateReferral']);
    Route::post('/remove', [AgentsManagementController::class,'removeAgent']);
    Route::post('/password/reset', [AgentsManagementController::class,'resetPassword']);
});

Route::prefix('v1/agents')->middleware('auth:api')->group(function () {
    Route::post('/create', [AgentsManagementController::class,'addAgent']);
});

Route::prefix('v1/management/sms/gateways')->middleware('auth:api')->group(function () {
    Route::get('/', [SmsGatewaysManagementController::class,'getGateways']);
    Route::post('/update', [SmsGatewaysManagementController::class,'updateGateway']);
});


Route::prefix('v1/management/selcom')->middleware('auth:api')->group(function () {
    Route::get('/balance', [SelcomManagementController::class,'getFloatBalance']);
});



Route::prefix('v1/transactions')->middleware('auth:api')->group(function () {
    Route::get('/', [TransactionsManagementController::class,'getTransactions']);
});

Route::prefix('v1/management/tunes')->middleware('auth:api')->group(function () {
    Route::get('/subscriptions', [TunesInstallationController::class,'getSubscriptions']);
    Route::post('/subscriptions/{id}/installed', [TunesInstallationController::class,'markInstalled']);
    Route::post('/subscriptions/{id}/status', [TunesInstallationController::class,'updateStatus']);
    Route::post('/subscriptions/{id}/script/generate', [BeatScriptController::class,'generateScript']);
    Route::get('/subscriptions/{id}/script/versions', [BeatScriptController::class,'listScriptVersions']);
    Route::get('/tts/voices', [BeatAudioController::class,'listVoices']);
    Route::post('/subscriptions/{id}/audio/preview', [BeatAudioController::class,'generatePreview']);
    Route::post('/subscriptions/{id}/audio/final', [BeatAudioController::class,'generateFinal']);
    Route::get('/subscriptions/{id}/audio/assets', [BeatAudioController::class,'listAssets']);
    Route::get('/audio/{assetId}/download', [BeatAudioController::class,'downloadAsset']);
});

Route::prefix('v1/management/subscriptions')->middleware('auth:api')->group(function () {
    Route::get('/list', [SubscriptionsManagementController::class,'getSubscriptions']);
    Route::get('/export', [SubscriptionsManagementController::class,'exportSubscriptions']);
    Route::get('/export/batches', [SubscriptionsManagementController::class,'listExportBatches']);
});

Route::get('/v1/subscriptions/export', [SubscriptionsManagementController::class,'exportSubscriptions']);

