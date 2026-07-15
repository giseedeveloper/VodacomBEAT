<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('business_ai_analyses')) {
            return;
        }

        Schema::create('business_ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscription_id')->index();
            $table->string('provider', 32)->default('gemini');
            $table->string('model', 64)->nullable();
            $table->string('prompt_version', 32)->default('v1');
            $table->json('input_snapshot');
            $table->json('raw_response')->nullable();
            $table->json('parsed_response')->nullable();
            $table->string('category', 64)->nullable();
            $table->string('subcategory', 128)->nullable();
            $table->string('objective', 64)->nullable();
            $table->string('recommended_tone', 64)->nullable();
            $table->decimal('confidence', 4, 3)->nullable();
            $table->json('risk_flags')->nullable();
            $table->json('missing_fields')->nullable();
            $table->json('follow_up_questions')->nullable();
            $table->string('recommended_template_key')->nullable();
            $table->string('resolved_template_key')->nullable();
            $table->string('next_action', 64)->nullable();
            $table->boolean('requires_admin_review')->default(false);
            $table->unsignedInteger('latency_ms')->nullable();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->string('status', 32)->default('completed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_ai_analyses');
    }
};
