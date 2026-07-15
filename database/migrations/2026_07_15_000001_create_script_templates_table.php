<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('script_templates')) {
            return;
        }

        Schema::create('script_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_key')->unique();
            $table->string('name');
            $table->string('category', 64);
            $table->string('objective', 64);
            $table->json('supported_tones');
            $table->string('language', 16)->default('sw-TZ');
            $table->unsignedSmallInteger('version')->default(1);
            $table->unsignedSmallInteger('maximum_words')->default(75);
            $table->unsignedSmallInteger('target_duration_seconds')->default(30);
            $table->json('required_fields')->nullable();
            $table->json('optional_fields')->nullable();
            $table->json('opening_rules')->nullable();
            $table->json('body_rules')->nullable();
            $table->json('cta_rules')->nullable();
            $table->json('prohibited_claims')->nullable();
            $table->text('prompt_instructions')->nullable();
            $table->string('status', 32)->default('ACTIVE');
            $table->unsignedSmallInteger('priority')->default(100);
            $table->timestamps();

            $table->index(['category', 'objective', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('script_templates');
    }
};
