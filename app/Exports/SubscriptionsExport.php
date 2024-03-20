<?php

namespace App\Exports;

use App\Models\TuneSubscription;
use Maatwebsite\Excel\Concerns\FromCollection;

class SubscriptionsExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return TuneSubscription::all();
    }

}
