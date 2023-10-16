<?php

use App\Models\LedgerTransaction;
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
        Schema::create('ledger_transactions', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('subscription_id')->nullable();
            $table->string('subscriber_id')->nullable();

            $table->string("payer_phone")->nullable();
            $table->double("amount")->default(0.0);
            $table->string("status")->default(LedgerTransaction::$STATUS_PENDING);

            $table->string("payment_url")->nullable();
            $table->string("qr")->nullable();
            $table->string("selcom_reference")->nullable();
            $table->string("selcom_uuid")->nullable();
            $table->string("selcom_token")->nullable();

            $table->string("receipt")->nullable();
            $table->string("reference")->nullable();
            $table->string("txid")->nullable();
            $table->string("third_party")->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_transactions');
    }
};
