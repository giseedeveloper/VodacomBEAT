<?php

namespace Database\Seeders;

use App\Models\TuneSubscriptionPackage;
use Illuminate\Database\Seeder;

class TunePackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        TuneSubscriptionPackage::query()->create([
            'package' => "1",
            'duration' => "1 Month",
            'price' => "10000"
        ]);

        TuneSubscriptionPackage::query()->create([
            'package' => "3",
            'duration' => "3 Month",
            'price' => "30000"
        ]);

        TuneSubscriptionPackage::query()->create([
            'package' => "6",
            'duration' => "6 Month",
            'price' => "50000"
        ]);

        TuneSubscriptionPackage::query()->create([
            'package' => "12",
            'duration' => "12 Month",
            'price' => "90000"
        ]);

    }
}
