<?php

return [

    'ai_worker' => [
        'base_url' => env('BEAT_AI_WORKER_URL', 'http://ai-worker:8080'),
        'internal_token' => env('BEAT_AI_WORKER_TOKEN', ''),
        'timeout_seconds' => (int) env('BEAT_AI_WORKER_TIMEOUT', 120),
    ],

    'llm' => [
        'base_url' => env('BEAT_LLM_BASE_URL', 'https://api.openai.com/v1'),
        'api_key' => env('BEAT_LLM_API_KEY', ''),
        'model' => env('BEAT_LLM_MODEL', 'gpt-4o-mini'),
    ],

    'limits' => [
        'script_generations' => (int) env('BEAT_LIMIT_SCRIPT_GENERATIONS', 3),
        'voice_previews' => (int) env('BEAT_LIMIT_VOICE_PREVIEWS', 5),
        'music_changes' => (int) env('BEAT_LIMIT_MUSIC_CHANGES', 3),
        'full_revisions' => (int) env('BEAT_LIMIT_FULL_REVISIONS', 2),
    ],

    'script' => [
        'max_duration_seconds' => (int) env('BEAT_SCRIPT_MAX_DURATION_SECONDS', 30),
        'default_language' => env('BEAT_SCRIPT_DEFAULT_LANGUAGE', 'sw-TZ'),
        'forbidden_claims' => [
            'bure',
            'free',
            '100%',
            'guaranteed',
            'hakuna gharama',
        ],
    ],

    'tts' => [
        'provider' => env('BEAT_TTS_PROVIDER', 'mms'),
        'default_voice_id' => env('BEAT_DEFAULT_VOICE_ID', 'mms-swh-default'),
        'mms_model_id' => env('BEAT_MMS_MODEL_ID', 'facebook/mms-tts-swh'),
    ],

    'audio' => [
        'default_profile' => env('BEAT_AUDIO_PROFILE', 'vodacom_caller_tune'),
        'profiles' => [
            'vodacom_caller_tune' => [
                'format' => 'wav',
                'sample_rate' => 44100,
                'channels' => 1,
                'bit_depth' => 16,
                'max_duration_seconds' => 30,
            ],
            'preview' => [
                'format' => 'mp3',
                'sample_rate' => 22050,
                'channels' => 1,
                'bit_depth' => 16,
                'max_duration_seconds' => 30,
                'watermark' => true,
            ],
        ],
    ],

];
