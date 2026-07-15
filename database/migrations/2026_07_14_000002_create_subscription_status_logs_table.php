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
        if (! Schema::hasTable('subscription_status_logs')) {
            Schema::create('subscription_status_logs', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('subscription_id')->index();
                $table->string('from_status')->nullable();
                $table->string('to_status');
                $table->bigInteger('changed_by')->nullable();
                $table->string('remark')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_status_logs');
    }
};
