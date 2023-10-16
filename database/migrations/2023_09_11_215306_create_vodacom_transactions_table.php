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
        Schema::create('vodacom_transactions', function (Blueprint $table) {
            $table->id();

            $table->string('source_ip')->nullable();
            $table->string('transaction_reference')->nullable();

            $table->bigInteger('customer_id')->nullable();
            $table->bigInteger('product_id')->nullable();
            $table->string("payer_phone")->nullable();
            $table->double("amount")->default(0.0);
            $table->string("status")->nullable();

            $table->string("receipt")->nullable();
            $table->string("third_party_reference")->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vodacom_transactions');
    }
};
