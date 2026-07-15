<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('tune_subscriptions', 'status')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->string('status')->default('AWAITING_PAYMENT')->index();
            });

            // Backfill: legacy rows paid under the old flow were installed immediately,
            // so treat them as ACTIVE. Unpaid rows are still awaiting payment.
            DB::table('tune_subscriptions')
                ->whereNotNull('paid_at')
                ->update(['status' => 'ACTIVE']);

            DB::table('tune_subscriptions')
                ->whereNull('paid_at')
                ->update(['status' => 'AWAITING_PAYMENT']);
        }

        if (! Schema::hasColumn('tune_subscriptions', 'installed_at')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->dateTime('installed_at')->nullable();
            });
        }

        if (! Schema::hasColumn('tune_subscriptions', 'installed_by')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->bigInteger('installed_by')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tune_subscriptions', 'status')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropColumn('status');
            });
        }

        if (Schema::hasColumn('tune_subscriptions', 'installed_at')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->dropColumn('installed_at');
            });
        }

        if (Schema::hasColumn('tune_subscriptions', 'installed_by')) {
            Schema::table('tune_subscriptions', function (Blueprint $table) {
                $table->dropColumn('installed_by');
            });
        }
    }
};
