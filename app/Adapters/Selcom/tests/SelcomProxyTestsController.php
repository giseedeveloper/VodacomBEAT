<?php

namespace App\Adapters\Selcom\tests;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Http\Controllers\BaseController;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Services\NotificationServiceService;
use App\Services\payment\AgentsCommissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SelcomProxyTestsController extends BaseController
{

    public function __construct()
    {

    }


    /*** Proxy tests  **/
    public function proxyOrderRequest(Request $request)
    {
        Log::info("....");
        $selcomOrderUrl = 'https://apigw.selcommobile.com/v1/checkout/create-order';
        Log::info("redirecting to $selcomOrderUrl");
        return $this->redirectPost($selcomOrderUrl,$request);
    }

    public function proxyPushRequest(Request $request)
    {
        return $this->redirectPost('https://apigw.selcommobile.com/v1/checkout/wallet-payment',$request);
    }

    public function redirectPost(string $url, Request $request)
    {
        $originalHeaders = $request->headers->all();
        $response = Http::withHeaders($originalHeaders)->post($url, $request->all());
        return $response;
    }


    public function redirectionChecker(Request $request)
    {
        Log::info("Received a Redirection");
        Log::info("headers ".json_encode($request->headers->all()));
        Log::info("content ".json_encode($request->all()));

        $resp['content'] = $request->input();
        return $this->returnResponse('accepted', $resp);

    }

    /*** [END] Proxy tests  **/



}




























