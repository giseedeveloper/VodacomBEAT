<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionsSeeder::class,
            MobileNetworksSeeder::class,
            TunePackageSeeder::class,
            SmsGatewaySeeder::class,
            NotificationTemplateSeeder::class,
            DemoUsersSeeder::class,
            TtsVoiceProfileSeeder::class,
            ScriptTemplateSeeder::class,
        ]);
    }
}
