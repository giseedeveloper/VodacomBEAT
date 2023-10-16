<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\SmsGateway;
use App\Models\SubscriptionTopic;
use App\Services\sms\MobishatraSmsService;
use App\Services\sms\MtejaSmsService;
use App\Services\sms\NextSmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class SmsGatewaysManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getGateways(Request $request): JsonResponse
    {
        /** @var SmsGateway[] $gateway */
        $gateway = SmsGateway::query()->paginate(100);

        foreach ($gateway as $smsGateway){

            if($smsGateway->provider_code == SmsGateway::$NEXTSMS) {
                #next-sms
                $smsGateway->balance = NextSmsService::checkBalance();

            } elseif($smsGateway->provider_code == SmsGateway::$MOBISHATRA){
                #mobishatra
                $smsGateway->balance = MobishatraSmsService::checkBalance();

            } elseif($smsGateway->provider_code == SmsGateway::$MTEJA){
                #mteja
                $smsGateway->balance = MtejaSmsService::checkBalance();
            }
        }

        $responseData['gateways'] = $gateway;
        return $this->returnResponse('Gateways', $responseData);

    }


    public function updateGateway(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required',
            'is_default' => 'required|boolean',
        ]);

        #Clear previous default;
        SmsGateway::query()->update([
            'is_default' => false
        ]);

        /** @var SmsGateway $referral */
        $status = SmsGateway::where([
            'id' => $request->input('id')
        ])->update([
            'is_default' => $request->input('is_default'),
            'sender_id' => $request->input('sender_id'),
            'last_updated_by' => Auth::user()->email,
        ]);


        $responseData['gateway'] = $status;
        return $this->returnResponse('SMS Gateway', $responseData);

    }


}




























