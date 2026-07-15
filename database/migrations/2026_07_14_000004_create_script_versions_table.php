<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('script_versions')) {
            Schema::create('script_versions', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('subscription_id')->index();
                $table->unsignedSmallInteger('version_number')->default(1);
                $table->string('language', 16)->default('sw-TZ');
                $table->text('plain_text')->nullable();
                $table->json('structured_payload')->nullable();
                $table->json('validation_errors')->nullable();
                $table->unsignedSmallInteger('estimated_duration_seconds')->nullable();
                $table->string('tone')->nullable();
                $table->string('source')->default('ai_worker');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('script_versions');
    }
};
