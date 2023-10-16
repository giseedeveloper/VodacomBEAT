<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\contest\ContestantsController;
use App\Http\Controllers\contest\VotesController;
use App\Http\Controllers\management\CommissionsManagementController;
use App\Http\Controllers\management\ReferralsManagementController;
use App\Http\Controllers\management\SubscriptionsManagementController;
use App\Http\Controllers\management\TopicsManagementController;
use App\Http\Controllers\management\UsersManagementController;
use App\Http\Controllers\management\VotesWeightManagementController;
use App\Http\Controllers\messages\MessagesManagementController;
use App\Http\Controllers\public\PublicVotesController;
use App\Http\Controllers\reports\ReportsController;
use App\Http\Controllers\reports\SubscriptionsReportsController;
use App\Http\Controllers\reports\TransactionsManagementController;
use App\Http\Controllers\tests\TestsController;
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



Route::prefix('v1/transactions')->middleware('auth:api')->group(function () {

    Route::get('/', [TransactionsManagementController::class,'getTransactions']);

});


Route::prefix('v1/messages')->middleware('auth:api')->group(function () {

    Route::get('/', [MessagesManagementController::class,'getMessages']);
    Route::post('/add', [MessagesManagementController::class,'addMessage']);
    Route::post('/update', [MessagesManagementController::class,'updateMessage']);
    Route::post('/approve', [MessagesManagementController::class,'approveMessage']);
    Route::post('/send', [MessagesManagementController::class,'sendMessage']);
    Route::get('/history', [MessagesManagementController::class,'getSmsHistory']);

});



Route::prefix('v1/subscriptions')->middleware('auth:api')->group(function () {

    Route::post('/update', [SubscriptionsManagementController::class,'changeSubscriptions']);

});


Route::prefix('v1/commissions')->middleware('auth:api')->group(function () {

    Route::get('/', [CommissionsManagementController::class,'getCommissions']);

});

Route::prefix('v1/resources')->group(function () {
    Route::post('/fsp', [FspResourceController::class,'fetchFsp']);
});

Route::prefix('v1/reports')->middleware('auth:api')->group(function () {

    Route::get('/stats', [ReportsController::class,'getGeneralStats']);
    Route::get('/stats/teams', [ReportsController::class,'getTeamsGeneralStats']);
    Route::get('/stats/by/reference', [ReportsController::class,'subscriptionsByReferenceCode']);
    Route::get('/subscriptions/active', [SubscriptionsReportsController::class,'getActiveSubscriptions']);

});


Route::prefix('v1/test')->group(function () {

    Route::post('/sms/many', [TestsController::class,'sendSmsToMany']);
    Route::post('/broadcast', [TestsController::class,'testBroadcast']);
    Route::post('/selcom', [TestsController::class,'selcomOrder']);
    Route::post('/selcom/push', [TestsController::class,'selcomPush']);
    Route::post('/selcom/disburse', [TestsController::class,'selcomDisburse']);

});





