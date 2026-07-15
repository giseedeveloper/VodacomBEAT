<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('tune_subscriptions', 'business_description')) {
                $table->text('business_description')->nullable()->after('business_industry');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'products_or_services')) {
                $table->json('products_or_services')->nullable()->after('business_description');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'secondary_products')) {
                $table->json('secondary_products')->nullable()->after('products_or_services');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'target_audience')) {
                $table->text('target_audience')->nullable()->after('secondary_products');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'landmark')) {
                $table->string('landmark')->nullable()->after('business_location');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'selling_points')) {
                $table->json('selling_points')->nullable()->after('call_to_action');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'preferred_tone')) {
                $table->string('preferred_tone', 64)->nullable()->after('selling_points');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'must_include_words')) {
                $table->json('must_include_words')->nullable()->after('preferred_tone');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'must_exclude_words')) {
                $table->json('must_exclude_words')->nullable()->after('must_include_words');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'offer_text')) {
                $table->string('offer_text')->nullable()->after('must_exclude_words');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'business_category')) {
                $table->string('business_category', 64)->nullable()->after('offer_text');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'ad_objective')) {
                $table->string('ad_objective', 64)->nullable()->after('business_category');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'script_template_key')) {
                $table->string('script_template_key')->nullable()->after('ad_objective');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'analysis_action')) {
                $table->string('analysis_action', 64)->nullable()->after('script_template_key');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'requires_admin_script_review')) {
                $table->boolean('requires_admin_script_review')->default(false)->after('analysis_action');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'selected_script_variant')) {
                $table->string('selected_script_variant', 64)->nullable()->after('requires_admin_script_review');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'latest_analysis_id')) {
                $table->unsignedBigInteger('latest_analysis_id')->nullable()->after('selected_script_variant');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            $columns = [
                'business_description',
                'products_or_services',
                'secondary_products',
                'target_audience',
                'landmark',
                'selling_points',
                'preferred_tone',
                'must_include_words',
                'must_exclude_words',
                'offer_text',
                'business_category',
                'ad_objective',
                'script_template_key',
                'analysis_action',
                'requires_admin_script_review',
                'selected_script_variant',
                'latest_analysis_id',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('tune_subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
