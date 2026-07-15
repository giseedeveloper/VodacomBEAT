<?php

namespace App\Jobs;

use App\Models\TuneSubscription;
use App\Services\BeatAudioService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateFinalAudioJob implements ShouldQueue
{

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $subscriptionId;

    public ?string $voiceId;

    public ?int $requestedBy;

    public function __construct(int $subscriptionId, ?string $voiceId = null, ?int $requestedBy = null)
    {
        $this->subscriptionId = $subscriptionId;
        $this->voiceId = $voiceId;
        $this->requestedBy = $requestedBy;
    }

    public function handle(): void
    {
        /** @var TuneSubscription|null $subscription */
        $subscription = TuneSubscription::query()->find($this->subscriptionId);
        if ($subscription === null) {
            Log::error("GenerateFinalAudioJob: subscription {$this->subscriptionId} not found");
            return;
        }

        BeatAudioService::generateFinal($subscription, $this->voiceId, $this->requestedBy);
    }

}
