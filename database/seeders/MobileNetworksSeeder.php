<?php

namespace Database\Seeders;

use App\Models\MobileNetwork;
use Illuminate\Database\Seeder;

class MobileNetworksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        MobileNetwork::query()->create(['name'=>'Vodacom', 'selcom_code'=>'VMCASHIN']);
        MobileNetwork::query()->create(['name'=>'AirtelMoney', 'selcom_code'=>'AMCASHIN']);
        MobileNetwork::query()->create(['name'=>'TigoPesa', 'selcom_code'=>'TPCASHIN']);
        MobileNetwork::query()->create(['name'=>'EzyPesa ', 'selcom_code'=>'EZCASHIN']);
        MobileNetwork::query()->create(['name'=>'HaloPesa', 'selcom_code'=>'HPCASHIN']);
        MobileNetwork::query()->create(['name'=>'TTCLPesa', 'selcom_code'=>'TTCASHIN']);

    }
}
