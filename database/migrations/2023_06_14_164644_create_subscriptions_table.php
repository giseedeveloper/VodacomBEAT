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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("customer_id")->nullable();


            $table->string("full_name")->nullable();
            $table->string("phone_number")->nullable();
            $table->double("amount")->default(0);
            $table->string("topic_code")->nullable()->default('SIMBA');

            $table->string("package")->nullable();
            $table->boolean("include")->default(true);

            $table->dateTime("starts_at")->nullable();
            $table->dateTime("expires_at")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
