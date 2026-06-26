<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('referral_agents', 'mobile_network_id')) {
            Schema::table('referral_agents', function (Blueprint $table) {
                $table->bigInteger('mobile_network_id')->nullable();
            });
        }

        if (! Schema::hasColumn('referral_agents', 'bank_id')) {
            Schema::table('referral_agents', function (Blueprint $table) {
                $table->bigInteger('bank_id')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referral_agents', function (Blueprint $table) {
            //
        });
    }
};
