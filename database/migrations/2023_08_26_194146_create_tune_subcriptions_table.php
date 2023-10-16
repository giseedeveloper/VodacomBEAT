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
        Schema::create('tune_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string("subscription_reference")->nullable();
            $table->bigInteger("customer_id")->nullable();
            $table->bigInteger("transaction_id")->nullable();
            $table->bigInteger("subscription_package_id")->nullable();
            $table->bigInteger("agent_id")->nullable();
            $table->string("contact_phone")->nullable();
            $table->string("contact_person_name")->nullable();
            $table->string("business_name")->nullable();
            $table->string("voice_type")->nullable();
            $table->string("voice_script",1024)->nullable();

            $table->string("payment_phone")->nullable();
            $table->double("amount")->nullable();
            $table->dateTime("starts_at")->nullable();
            $table->dateTime("ends_at")->nullable();
            $table->dateTime("paid_at")->nullable();

            $table->dateTime("commission_issued_at")->nullable();
            $table->bigInteger("commission_issued_by")->nullable();
            $table->double("commission_amount")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tune_subscriptions');
    }
};
