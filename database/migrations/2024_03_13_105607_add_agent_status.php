<?php

use App\Models\ReferralAgent;
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
        Schema::table('referral_agents', function (Blueprint $table) {
            $table->string("status")->nullable()->default(ReferralAgent::$STATUS_ACTIVE);
        });
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
