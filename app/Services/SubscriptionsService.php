<?php

namespace App\Services;

use App\Models\BroadcastMessage;
use App\Models\Customer;
use App\Models\LedgerTransaction;
use App\Models\NotificationMessageTemplate;
use App\Models\SmsHistory;
use App\Models\Subscription;
use App\Models\SubscriptionTopic;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class SubscriptionsService
{

    public function __construct()
    {

    }

    public static function addSubscription(LedgerTransaction $transaction)
    {

        $customer = Customer::query()->firstOrCreate([
            'phone_number' => $transaction->payer_phone,
        ], [
            'full_name' => '',
            'phone_number' => $transaction->payer_phone,
            'mno' => $transaction->third_party,
        ]);


        /** @var Subscription|null $latestSubscription */
        $latestSubscription = Subscription::query()
            ->where("customer_id", $customer->id)
            ->where('expires_at', '>', Carbon::now())
            ->latest()->first();

        if ($latestSubscription == null) {
            //For client no previous subscription
            Log::info("Customer has no active subscription");

            $subscription = Subscription::create([
                'customer_id' => $customer->id,
                'transaction_id' => $transaction->id,
                'customer_name' => '',
                'phone_number' => $transaction->payer_phone,
                'amount' => $transaction->amount,

                'referred_by' => ReferralsService::getReferral($transaction),

                'topic_code' => "ALL",
                'package' => Subscription::$PACKAGE_WEEK,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addWeek()
            ]);

            Log::info("Created subscription: " . json_encode($subscription));

        } else {

            //Add another subscription on top of the given subscription
            Log::info("Customer already has active subscription, adding another. existing subscription: " . json_encode($latestSubscription));
            $endDate = Carbon::parse($latestSubscription->expires_at)->clone();
            $subscription = Subscription::create([
                'transaction_id' => $transaction->id,
                'customer_id' => $customer->id,
                'customer_name' => '',
                'phone_number' => $transaction->payer_phone,
                'amount' => $transaction->amount,

                'referred_by' => ReferralsService::getReferral($transaction),

                'topic_code' => "ALL",
                'package' => Subscription::$PACKAGE_WEEK,
                'starts_at' => $latestSubscription->expires_at,
                'expires_at' => $endDate->addWeek()
            ]);
            Log::info("Created subscription: " . json_encode($subscription));

        }


        self::onSubscriptionCreated($subscription);

        ReferralsService::giveCommission($subscription);

        self::firstNotification($subscription);

    }

    public static function broadcastToActiveSubscribers(BroadcastMessage $broadcastMessage)
    {

        Log::info("broadcasting to active subscribers: " . json_encode($broadcastMessage));

        $chunkSize = Config::get('mobishatra.sms_chunk');
        $topicCode = $broadcastMessage->topic_code;

        /** @var SubscriptionTopic | null $topic */
        $topic = SubscriptionTopic::where([
            'code' => $broadcastMessage->topic_code
        ])->first();

        if (!$topic) {
            Log::error("Topic $topicCode does not exist");
            return;
        }

        $smsHistory = SmsHistory::query()->create([
            "topic_code" => $broadcastMessage->topic_code,
            "topic_name" => $topic->name,
            "message" => $broadcastMessage->content,
            "initiator" => 'Automatic',
        ]);

        Subscription::query()
            ->where('expires_at', ">", Carbon::now())
            ->where('include', true)
            ->where('topic_code', $topicCode)
            ->chunk($chunkSize, function (Collection $results) use ($broadcastMessage, $smsHistory) {
                self::broadcastMessage($results, $broadcastMessage);
                $smsHistory->increment('audience_count', $results->count());
            });

    }

    public static function broadcastMessage(Collection $phoneNumbersCollection, BroadcastMessage $broadcastMessage)
    {
        $messageId = $broadcastMessage->id;
        $count = $phoneNumbersCollection->count();
        Log::info("broadcasting message with id:$messageId to $count subscribers. ");

        $phoneNumbers = $phoneNumbersCollection->pluck('phone_number')->toArray();
        NotificationServiceService::sendSmsToMultiple($phoneNumbers, $broadcastMessage->content);

        #update message send time
        $broadcastMessage->sent_at = Carbon::now();
        $broadcastMessage->save();
    }

    public static function onSubscriptionCreated(Subscription $subscription)
    {

        /** @var NotificationMessageTemplate | null $template */
        $template = NotificationMessageTemplate::query()->where([
            'code' => NotificationMessageTemplate::$TYPE_SUBSCRIPTION
        ])->first();

        if ($template == null) {
            Log::error("No subscription notification template configured");
        }

        NotificationServiceService::sendOneSms($template->content, $subscription->phone_number);
    }

    public static function firstNotification(Subscription $subscription)
    {

        Log::info("sending first sms to " . $subscription->phone_number);

        $topicCode = $subscription->topic_code;

        /** @var SubscriptionTopic | null $topic */
        $topic = SubscriptionTopic::where([
            'code' => $topicCode
        ])->first();

        if (!$topic) {
            Log::error("Topic: $topicCode does not exist");
            return;
        }

        /** @var SmsHistory|null $lastSentSms */
        $lastSentSms = SmsHistory::query()->where(["topic_code" => $topicCode])->latest()->first();
        if ($lastSentSms == null) {
            Log::error("No subscription notification recently sent for topic:$topicCode");
            return;
        }

        NotificationServiceService::sendOneSms($lastSentSms->message, $subscription->phone_number);

        $lastSentSms->increment('audience_count');

    }


}


