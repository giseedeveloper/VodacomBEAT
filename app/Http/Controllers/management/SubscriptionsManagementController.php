<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\BroadcastMessage;
use App\Models\Subscription;
use App\Models\VoteWeight;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionsManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function changeSubscriptions(Request $request): JsonResponse
    {

        $request->validate([
            'id'=>'required|numeric',
            'include'=>'required|boolean'
        ]);

        /** @var Subscription|null $subscription */
        $subscription =  Subscription::find($request->input('id'));
        if(!$subscription){
            return $this->returnError("Subscription not found");
        }

        $subscription->include =$request->input('include');
        $subscription->save();

        $responseData['subscription'] = $subscription;
        return $this->returnResponse('Subscription update', $responseData);
    }




}




























