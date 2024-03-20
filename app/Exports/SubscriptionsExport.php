<?php

namespace App\Exports;

use App\Models\TuneSubscription;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SubscriptionsExport implements FromCollection, WithHeadings, WithMapping
{

    public function headings(): array
    {
        return [
            'Business Name',
            'Business Contact',
            'Paid On',
            'Voice Type',
            'Voice Script',
            'Phones To Activate',
            'Package',
            'Package Price',
        ];
    }

    /**
     * @param TuneSubscription $tuneSubscription
     */
    public function map($tuneSubscription): array
    {

        return [
            $tuneSubscription->business_name,
            $tuneSubscription->contact_phone,
            $tuneSubscription->paid_at,
            $tuneSubscription->voice_type,
            $tuneSubscription->voice_script,
            implode(',',$tuneSubscription->phones->pluck('phone_number')->toArray()),
            $tuneSubscription->package->duration,
            $tuneSubscription->package->price
        ];

    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return TuneSubscription::query()->whereNotNull('paid_at')->get();
    }


}
