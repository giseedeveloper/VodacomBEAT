<?php

namespace Database\Seeders;

use App\Models\NotificationMessageTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        # Subscription
        NotificationMessageTemplate::query()->create([
            'code'=>'SUBSCRIPTION',
            'type'=>'Subscription Confirmation',
            'content'=>'Some message',
            'last_updated_by'=>'admin'
        ]);

        # Unsubscription
        NotificationMessageTemplate::query()->create([
            'code'=>'UN_SUBSCRIPTION',
            'type'=>'Unsubscription Notification',
            'content'=>'Some message',
            'last_updated_by'=>'admin'
        ]);

    }
}
