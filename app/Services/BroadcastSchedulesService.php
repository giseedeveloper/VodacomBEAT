<?php

namespace App\Services;

use App\Models\BroadcastMessage;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class BroadcastSchedulesService
{

    public function __construct()
    {

    }

    public static function broadcastScheduledMessages()
    {

        /** @var Collection $messagesToSend */
        $messagesToSend = BroadcastMessage::query()
            ->where('send_at','<=',Carbon::now())
            ->whereNull('sent_at')->get();

        if($messagesToSend->isEmpty()){
            Log::info("No pending message for broadcasting...");
            return ;
        }else{
            Log::info("Messages: ".$messagesToSend->count(). " messages pending...");
        }

        foreach($messagesToSend as $broadcastMessage){
            SubscriptionsService::broadcastToActiveSubscribers($broadcastMessage);
        }

    }


}


