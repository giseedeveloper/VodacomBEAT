<?php

namespace App\Http\Controllers\resources;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Http\Controllers\BaseController;
use App\Models\BroadcastMessage;
use App\Models\MobileNetwork;
use App\Models\SelcomTransaction;
use App\Services\NotificationServiceService;
use App\Services\sms\MobishatraSmsService;
use App\Services\SubscriptionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FspResourceController extends BaseController
{

    public function __construct()
    {

    }

    public function fetchFsp(Request $request): JsonResponse
    {

        $fsps = MobileNetwork::all();
        $responseData['fsps'] = $fsps;
        return $this->returnResponse('FSPs', $responseData);

    }

}




























