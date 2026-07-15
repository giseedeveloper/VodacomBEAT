<?php

namespace App\Services;

use App\Models\ExportLog;
use App\Models\TuneSubscription;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExportBatchService
{

    /**
     * Paid subscriptions that have not been exported into any batch yet.
     */
    public static function getExportableSubscriptions(): Collection
    {
        $alreadyExportedIds = DB::table('export_log_subscriptions')
            ->pluck('subscription_id');

        return TuneSubscription::query()
            ->whereNotNull('paid_at')
            ->whereIn('status', [
                SubscriptionStatusService::PAID,
                SubscriptionStatusService::READY_FOR_INSTALLATION,
            ])
            ->when($alreadyExportedIds->isNotEmpty(), function ($query) use ($alreadyExportedIds) {
                $query->whereNotIn('id', $alreadyExportedIds);
            })
            ->with(['phones', 'package'])
            ->orderBy('paid_at')
            ->get();
    }

    /**
     * Create an export batch, mark subscriptions EXPORTED, and return the log row.
     *
     * @throws \RuntimeException when there is nothing to export
     */
    public static function createBatch(?int $exportedBy = null): ExportLog
    {
        $subscriptions = self::getExportableSubscriptions();
        if ($subscriptions->isEmpty()) {
            throw new \RuntimeException('No subscriptions are ready for export');
        }

        $batchReference = 'BATCH-' . Carbon::now()->format('Ymd-His');
        $fileName = "subscriptions-{$batchReference}.xlsx";

        return DB::transaction(function () use ($subscriptions, $exportedBy, $batchReference, $fileName) {
            /** @var ExportLog $exportLog */
            $exportLog = ExportLog::query()->create([
                'batch_reference' => $batchReference,
                'exported_by' => $exportedBy,
                'subscription_count' => $subscriptions->count(),
                'file_name' => $fileName,
            ]);

            $subscriptionIds = [];
            foreach ($subscriptions as $subscription) {
                if ($subscription->status === SubscriptionStatusService::PAID
                    || $subscription->status === SubscriptionStatusService::READY_FOR_INSTALLATION) {
                    try {
                        SubscriptionStatusService::transition(
                            $subscription,
                            SubscriptionStatusService::EXPORTED,
                            $exportedBy,
                            "Export batch {$batchReference}"
                        );
                    } catch (\Exception $e) {
                        Log::warning("could not transition subscription {$subscription->id} to EXPORTED: " . $e->getMessage());
                    }
                }

                $subscriptionIds[] = $subscription->id;
            }

            $exportLog->subscriptions()->attach($subscriptionIds);

            return $exportLog->refresh();
        });
    }

}
