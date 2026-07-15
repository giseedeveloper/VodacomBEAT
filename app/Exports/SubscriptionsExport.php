<?php

namespace App\Exports;

use App\Models\TuneSubscription;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SubscriptionsExport implements FromCollection, WithHeadings, WithMapping
{

    protected Collection $subscriptions;

    protected ?string $batchReference;

    public function __construct(Collection $subscriptions, ?string $batchReference = null)
    {
        $this->subscriptions = $subscriptions;
        $this->batchReference = $batchReference;
    }

    public function headings(): array
    {
        return [
            'Reference',
            'Status',
            'Business Name',
            'Business Contact',
            'Paid On',
            'Voice Type',
            'Voice Script',
            'Phones To Activate',
            'Package',
            'Package Price',
            'Batch Reference',
        ];
    }

    /**
     * @param TuneSubscription $tuneSubscription
     */
    public function map($tuneSubscription): array
    {
        return [
            $tuneSubscription->subscription_reference,
            $tuneSubscription->status,
            $tuneSubscription->business_name,
            $tuneSubscription->contact_phone,
            $tuneSubscription->paid_at,
            $tuneSubscription->voice_type,
            $tuneSubscription->voice_script,
            implode(',', $tuneSubscription->phones->pluck('phone_number')->toArray()),
            $tuneSubscription->package->duration ?? $tuneSubscription->package->package ?? '',
            $tuneSubscription->package->price ?? '',
            $this->batchReference,
        ];
    }

    public function collection(): Collection
    {
        return $this->subscriptions;
    }

}
