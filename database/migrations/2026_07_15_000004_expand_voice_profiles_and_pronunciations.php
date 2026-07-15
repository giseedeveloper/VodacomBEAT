<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tts_voice_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('tts_voice_profiles', 'provider_voice_id')) {
                $table->string('provider_voice_id')->nullable()->after('model_id');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'style')) {
                $table->string('style', 64)->nullable()->after('gender');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'speaking_rate')) {
                $table->smallInteger('speaking_rate')->default(0)->after('style');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'pitch')) {
                $table->smallInteger('pitch')->default(0)->after('speaking_rate');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'is_premium')) {
                $table->boolean('is_premium')->default(false)->after('is_active');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'preview_audio_path')) {
                $table->string('preview_audio_path')->nullable()->after('is_premium');
            }
            if (! Schema::hasColumn('tts_voice_profiles', 'style_prompt')) {
                $table->string('style_prompt')->nullable()->after('preview_audio_path');
            }
        });

        if (! Schema::hasTable('pronunciation_entries')) {
            Schema::create('pronunciation_entries', function (Blueprint $table) {
                $table->id();
                $table->string('original_text');
                $table->string('replacement_text')->nullable();
                $table->string('phoneme')->nullable();
                $table->string('language', 16)->default('sw-TZ');
                $table->string('scope', 32)->default('GLOBAL'); // GLOBAL | BUSINESS | SCRIPT
                $table->unsignedBigInteger('subscription_id')->nullable()->index();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['original_text', 'scope']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pronunciation_entries');

        Schema::table('tts_voice_profiles', function (Blueprint $table) {
            foreach (['provider_voice_id', 'style', 'speaking_rate', 'pitch', 'is_premium', 'preview_audio_path', 'style_prompt'] as $column) {
                if (Schema::hasColumn('tts_voice_profiles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
