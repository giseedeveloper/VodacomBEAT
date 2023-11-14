<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**---------------------*
     * Run the migrations.
     *----------------------*/
    public function up(): void
    {
        Schema::create('agent_commissions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("transaction_id")->nullable();
            $table->bigInteger("subscription_id")->nullable();
            $table->string("name")->nullable();
            $table->string("phone_number")->nullable();
            $table->double("amount")->nullable();
            $table->string("status")->nullable();
            $table->string("remark",512)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_commissions');
    }
};
