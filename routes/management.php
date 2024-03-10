<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\contest\ContestantsController;
use App\Http\Controllers\contest\VotesController;
use App\Http\Controllers\management\NotificationTemplatesManagementController;
use App\Http\Controllers\management\ReferralsManagementController;
use App\Http\Controllers\management\SmsGatewaysManagementController;
use App\Http\Controllers\management\SubscriptionPackagesManagementController;
use App\Http\Controllers\management\TopicsManagementController;
use App\Http\Controllers\management\UsersManagementController;
use App\Http\Controllers\management\VotesWeightManagementController;
use App\Http\Controllers\reports\TransactionsManagementController;
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
    Route::get('/agent', [ReferralsManagementController::class,'getAgent']);
    Route::get('/', [ReferralsManagementController::class,'getReferrals']);
    Route::post('/create', [ReferralsManagementController::class,'addReferral']);
    Route::post('/update', [ReferralsManagementController::class,'updateReferral']);
    Route::post('/password/reset', [ReferralsManagementController::class,'resetPassword']);
});


Route::prefix('v1/topics')->middleware('auth:api')->group(function () {
    Route::get('/', [TopicsManagementController::class,'getTopics']);
    Route::post('/create', [TopicsManagementController::class,'addTopic']);
    Route::post('/update', [TopicsManagementController::class,'updateTopic']);
});


Route::prefix('v1/management/sms/gateways')->middleware('auth:api')->group(function () {
    Route::get('/', [SmsGatewaysManagementController::class,'getGateways']);
    Route::post('/update', [SmsGatewaysManagementController::class,'updateGateway']);
});


Route::prefix('v1/transactions')->middleware('auth:api')->group(function () {
    Route::get('/', [TransactionsManagementController::class,'getTransactions']);
});

