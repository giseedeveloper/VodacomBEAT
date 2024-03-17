<?php

namespace App\Adapters\Selcom\tests;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Http\Controllers\BaseController;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Services\NotificationServiceService;
use App\Services\payment\AgentsCommissionService;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response;
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
        Log::info(" " );
        Log::info(" ");
        Log::info(".... ".json_encode($request->input()));
        $selcomOrderUrl = 'https://apigw.selcommobile.com/v1/checkout/create-order';
//        $selcomOrderUrl = 'http://vodacom-tunes.io/api/v1/test/selcom/proxy/checker';
        Log::info("redirecting to order endpoint $selcomOrderUrl");
        return $this->redirectPost($selcomOrderUrl,$request);
    }

    public function proxyPushRequest(Request $request)
    {
        $selcomPushUrl = "https://apigw.selcommobile.com/v1/checkout/wallet-payment";
        Log::info("redirecting to selcom push ussd $selcomPushUrl");
        return $this->redirectPost($selcomPushUrl,$request);
    }


    public function redirectPost(string $url, Request $request): PromiseInterface|Response
    {
        $originalHeaders = $request->headers->all();
        unset($originalHeaders['host']);

        Log::info("sanitized original headers ".json_encode($originalHeaders));
        Log::info("original contents ".json_encode($request->all()));
        return Http::withHeaders($originalHeaders)->post($url, $request->all());
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




























