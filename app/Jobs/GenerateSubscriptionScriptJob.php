<?php

namespace App\Jobs;

use App\Models\TuneSubscription;
use App\Services\BeatScriptService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateSubscriptionScriptJob implements ShouldQueue
{

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $subscriptionId;

    public ?int $requestedBy;

    public function __construct(int $subscriptionId, ?int $requestedBy = null)
    {
        $this->subscriptionId = $subscriptionId;
        $this->requestedBy = $requestedBy;
    }

    public function handle(): void
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($this->subscriptionId);
        if ($subscription === null) {
            Log::error("GenerateSubscriptionScriptJob: subscription {$this->subscriptionId} not found");
            return;
        }

        try {
            BeatScriptService::generate($subscription, $this->requestedBy);
        } catch (\Exception $e) {
            Log::error("GenerateSubscriptionScriptJob failed for subscription {$this->subscriptionId}: " . $e->getMessage());
            throw $e;
        }
    }

}
