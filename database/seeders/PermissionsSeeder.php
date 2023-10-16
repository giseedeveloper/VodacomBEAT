<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        //Clear older permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        # Users
        Permission::create(['name' => 'users:view','guard_name'=>'api']);
        Permission::create(['name' => 'users:add','guard_name'=>'api']);
        Permission::create(['name' => 'users:update','guard_name'=>'api']);

        # Contestants
        Permission::create(['name' => 'contestants:view','guard_name'=>'api']);
        Permission::create(['name' => 'contestants:add','guard_name'=>'api']);
        Permission::create(['name' => 'contestants:update','guard_name'=>'api']);

        # Transactions
        Permission::create(['name' => 'transactions:view','guard_name'=>'api']);
        Permission::create(['name' => 'transactions:add','guard_name'=>'api']);
        Permission::create(['name' => 'transactions:update','guard_name'=>'api']);

        # VoteWeights
        Permission::create(['name' => 'weights:view','guard_name'=>'api']);
        Permission::create(['name' => 'weights:add','guard_name'=>'api']);
        Permission::create(['name' => 'weights:update','guard_name'=>'api']);

    }

}

