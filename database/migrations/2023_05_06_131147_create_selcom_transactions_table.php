<?php

use App\Models\SelcomTransaction;
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
        Schema::create('selcom_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->nullable();
            $table->string('transaction_type')->nullable();
            $table->string("payer_phone")->nullable();
            $table->string("receiver_phone")->nullable();
            $table->double("amount")->default(0.0);
            $table->string("status")->default(SelcomTransaction::$STATUS_PENDING);

            $table->string("payment_url")->nullable();
            $table->string("qr")->nullable();
            $table->string("selcom_reference")->nullable();
            $table->string("selcom_transaction_id")->nullable();
            $table->string("selcom_uuid")->nullable();
            $table->string("selcom_token")->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('selcom_transactions');
    }
};
