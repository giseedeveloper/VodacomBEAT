<?php

namespace Database\Seeders;

use App\Models\MobileNetwork;
use App\Models\ReferralAgent;
use App\Models\User;
use App\Services\ReferralsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Demo@12345');

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@demo.com'],
            ['name' => 'Demo Admin', 'password' => $password, 'is_active' => true]
        );
        $admin->syncPermissions(Permission::all());

        $agentUser = User::query()->updateOrCreate(
            ['email' => '0711111111'],
            ['name' => 'Demo Agent', 'password' => $password, 'is_active' => true]
        );
        $this->ensureAgent($agentUser, 'Demo', 'Agent', '0711111111', 'Dar es Salaam');

        $referralUser = User::query()->updateOrCreate(
            ['email' => '0722222222'],
            ['name' => 'Demo Referral', 'password' => $password, 'is_active' => true]
        );
        $this->ensureAgent($referralUser, 'Demo', 'Referral', '0722222222', 'Arusha');

        User::query()->updateOrCreate(
            ['email' => '0733333333'],
            ['name' => 'Demo Customer', 'password' => $password, 'is_active' => true]
        );
    }

    private function ensureAgent(User $user, string $firstName, string $secondName, string $phone, string $zone): void
    {
        $networkId = MobileNetwork::query()->where('name', 'Vodacom')->value('id');

        $agent = ReferralAgent::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'mobile_network_id' => $networkId,
                'first_name' => $firstName,
                'second_name' => $secondName,
                'phone_number' => $phone,
                'sales_zone' => $zone,
                'status' => ReferralAgent::$STATUS_ACTIVE,
                'commission_percentage' => 10,
                'commission_amount' => 1000,
            ]
        );

        if (! $agent->reference_number) {
            $agent->reference_number = ReferralsService::generateReferenceNumber($agent);
            $agent->save();
        }
    }
}
