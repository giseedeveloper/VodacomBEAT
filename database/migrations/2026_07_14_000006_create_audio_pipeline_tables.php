<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tts_voice_profiles')) {
            Schema::create('tts_voice_profiles', function (Blueprint $table) {
                $table->id();
                $table->string('slug')->unique();
                $table->string('label');
                $table->string('provider')->default('mms');
                $table->string('model_id');
                $table->string('gender')->default('neutral');
                $table->string('language')->default('sw-TZ');
                $table->boolean('is_finetuned')->default(false);
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->string('license_note')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('audio_assets')) {
            Schema::create('audio_assets', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('subscription_id')->index();
                $table->string('asset_type')->index();
                $table->string('voice_id')->nullable();
                $table->string('provider')->default('mms');
                $table->string('file_path');
                $table->string('format')->default('wav');
                $table->unsignedInteger('sample_rate')->nullable();
                $table->decimal('duration_seconds', 8, 2)->nullable();
                $table->string('checksum_sha256')->nullable();
                $table->string('profile')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audio_assets');
        Schema::dropIfExists('tts_voice_profiles');
    }
};
