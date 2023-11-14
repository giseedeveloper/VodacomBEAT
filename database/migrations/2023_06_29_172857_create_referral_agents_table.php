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
        Schema::create('referral_agents', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('mobile_network_id')->nullable();
            $table->bigInteger('bank_id')->nullable();

            $table->string('first_name');
            $table->string('second_name');
            $table->string('phone_number');
            $table->string('sales_zone')->nullable();
            $table->string('reference_number')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_agents');
    }
};
