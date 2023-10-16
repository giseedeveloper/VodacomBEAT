<?php

namespace App\Http\Controllers\messages;

use App\Http\Controllers\BaseController;
use App\Models\BroadcastMessage;
use App\Models\SmsHistory;

use App\Services\SubscriptionsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessagesManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getMessages(Request $request): JsonResponse
    {
        $messages =  BroadcastMessage::query()->latest()->paginate(20);
        $responseData['messages'] = $messages;
        return $this->returnResponse('Messages', $responseData);
    }

    public function addMessage(Request $request): JsonResponse
    {
        $request->validate([
            'topic_code' => 'required',
            'content' => 'required|min:1'
        ]);

        Log::info($request->all());

        $equivalentSmsCount =  ceil(strlen($request->input('content'))/BroadcastMessage::$SMS_CHARACTERS);

        /** @var BroadcastMessage $message */
        $message =  BroadcastMessage::query()->create([
            'topic_code' => $request->input('topic_code'),
            'content' => $request->input('content'),
            'equivalent_sms_count' => $equivalentSmsCount,
        ]);

        //Set date
        if($request->input('send_at_date')!=null){
            $date = Carbon::parse($request->input('send_at_date')) ;
            $time = Carbon::parse($request->input('send_at_time')) ;
            $date->setTime($time->hour,$time->minute,$time->second);

            $message->send_at = $date;
            $message->save();
        }

        $responseData['message'] = $message;
        return $this->returnResponse('Vote weights', $responseData);
    }

    public function updateMessage(Request $request): JsonResponse
    {

        $equivalentSmsCount =  ceil(strlen($request->input('content'))/BroadcastMessage::$SMS_CHARACTERS);
        $request->validate([
            'id' => 'required',
            'topic_code' => 'required',
            'content' => 'required|min:1'
        ]);

        $message =  BroadcastMessage::where([
            'id'=>$request->input('id')
        ])->update([
            'topic_code' => $request->input('topic_code'),
            'content' => $request->input('content'),
            'equivalent_sms_count' => $equivalentSmsCount
        ]);

        //Set date
        if($request->input('send_at_date')!=null){
            $date = Carbon::parse($request->input('send_at_date')) ;
            $time = Carbon::parse($request->input('send_at_time')) ;
            $date->setTime($time->hour,$time->minute,$time->second);

            BroadcastMessage::where([
                'id'=>$request->input('id')
            ])->update([
                'send_at' => $date,
                'sent_at' => null,
            ]);
        }

        $responseData['message'] = $message;
        return $this->returnResponse('Vote weights', $responseData);
    }

    public function sendMessage(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required|exists:broadcast_messages'
        ]);

        /* @var BroadcastMessage|null $broadcastMessage */
        $broadcastMessage =  BroadcastMessage::query()->find($request->input('id'));
        if(!$broadcastMessage){
            return $this->returnError("Message not found",[],400);
        }


        $activeSubscribersCount =  Subscription::query()
            ->where('expires_at',">",Carbon::now())
            ->count();

        $broadcastMessage->audience_count = $activeSubscribersCount;
        $broadcastMessage->sent_at = Carbon::now();
        $broadcastMessage->save();

        SubscriptionsService::broadcastToActiveSubscribers($broadcastMessage);

        $responseData['remark'] = $broadcastMessage;
        return $this->returnResponse('Vote weight updated', $responseData);

    }

    public function getSmsHistory(Request $request): JsonResponse
    {

        $responseData['history'] = SmsHistory::query()->latest()->paginate(10);
        return $this->returnResponse('SMS history', $responseData);

    }

}




























