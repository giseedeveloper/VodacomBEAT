<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tune_subscriptions', 'business_location')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->string('business_location')->nullable();
                $table->string('business_industry')->nullable();
                $table->string('call_to_action')->nullable();
                $table->unsignedSmallInteger('script_generation_count')->default(0);
                $table->unsignedSmallInteger('voice_preview_count')->default(0);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tune_subscriptions', 'business_location')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->dropColumn([
                    'business_location',
                    'business_industry',
                    'call_to_action',
                    'script_generation_count',
                    'voice_preview_count',
                ]);
            });
        }
    }
};
