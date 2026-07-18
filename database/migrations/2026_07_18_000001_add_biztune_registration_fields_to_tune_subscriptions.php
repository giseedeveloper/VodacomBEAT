<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('tune_subscriptions', 'offer_type')) {
                $table->string('offer_type', 32)->nullable()->after('business_description');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'instagram_handle')) {
                $table->string('instagram_handle')->nullable()->after('offer_text');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'facebook_handle')) {
                $table->string('facebook_handle')->nullable()->after('instagram_handle');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'tiktok_handle')) {
                $table->string('tiktok_handle')->nullable()->after('facebook_handle');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'website_url')) {
                $table->string('website_url')->nullable()->after('tiktok_handle');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            $columns = [
                'offer_type',
                'instagram_handle',
                'facebook_handle',
                'tiktok_handle',
                'website_url',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('tune_subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
