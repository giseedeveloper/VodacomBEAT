<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('tune_subscriptions', 'pronunciation_test_count')) {
                $table->unsignedSmallInteger('pronunciation_test_count')->default(0)->after('voice_preview_count');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'final_audio_regeneration_count')) {
                $table->unsignedSmallInteger('final_audio_regeneration_count')->default(0)->after('pronunciation_test_count');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'music_change_count')) {
                $table->unsignedSmallInteger('music_change_count')->default(0)->after('final_audio_regeneration_count');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'preferred_voice_profile')) {
                $table->string('preferred_voice_profile')->nullable()->after('voice_type');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'speaking_speed')) {
                $table->string('speaking_speed', 16)->default('normal')->after('preferred_voice_profile');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'music_intensity')) {
                $table->string('music_intensity', 16)->default('medium')->after('speaking_speed');
            }
            if (! Schema::hasColumn('tune_subscriptions', 'preferred_music_track_id')) {
                $table->string('preferred_music_track_id')->nullable()->after('music_intensity');
            }
        });

        Schema::table('audio_assets', function (Blueprint $table) {
            if (! Schema::hasColumn('audio_assets', 'qc_report')) {
                $table->json('qc_report')->nullable()->after('profile');
            }
            if (! Schema::hasColumn('audio_assets', 'qc_passed')) {
                $table->boolean('qc_passed')->nullable()->after('qc_report');
            }
            if (! Schema::hasColumn('audio_assets', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('qc_passed');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tune_subscriptions', function (Blueprint $table) {
            foreach ([
                'pronunciation_test_count',
                'final_audio_regeneration_count',
                'music_change_count',
                'preferred_voice_profile',
                'speaking_speed',
                'music_intensity',
                'preferred_music_track_id',
            ] as $column) {
                if (Schema::hasColumn('tune_subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('audio_assets', function (Blueprint $table) {
            foreach (['qc_report', 'qc_passed', 'expires_at'] as $column) {
                if (Schema::hasColumn('audio_assets', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
