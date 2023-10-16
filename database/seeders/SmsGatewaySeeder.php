<?php

namespace Database\Seeders;

use App\Models\SmsGateway;
use Illuminate\Database\Seeder;

class SmsGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        # Mobishatra
        SmsGateway::query()->create([
            'provider_code' => SmsGateway::$MOBISHATRA,
            'provider_name' => "Mobishatra",
            'is_default' => false,
            'is_available' => true,
            'sender_id' => "MobiAd"
        ]);

        # Next SMS
        SmsGateway::query()->create([
            'provider_code' => SmsGateway::$NEXTSMS,
            'provider_name' => "Next SMS",
            'is_default' => false,
            'is_available' => true,
            'sender_id' => "NEXTSMS"
        ]);

        # Next SMS
        SmsGateway::query()->create([
            'provider_code' => SmsGateway::$MTEJA,
            'provider_name' => "Mteja.io",
            'is_default' => false,
            'is_available' => true,
            'sender_id' => "MobiAd"
        ]);

    }
}
