<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('export_logs')) {
            Schema::create('export_logs', function (Blueprint $table) {
                $table->id();
                $table->string('batch_reference')->unique();
                $table->bigInteger('exported_by')->nullable()->index();
                $table->unsignedInteger('subscription_count')->default(0);
                $table->string('file_name')->nullable();
                $table->string('checksum')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('export_log_subscriptions')) {
            Schema::create('export_log_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('export_log_id')->index();
                $table->bigInteger('subscription_id')->index();
                $table->timestamps();

                $table->unique(['export_log_id', 'subscription_id'], 'export_log_subscription_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('export_log_subscriptions');
        Schema::dropIfExists('export_logs');
    }
};
