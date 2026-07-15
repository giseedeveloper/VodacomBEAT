<?php

return [

    'ai_worker' => [
        'base_url' => env('BEAT_AI_WORKER_URL', 'http://ai-worker:8080'),
        'internal_token' => env('BEAT_AI_WORKER_TOKEN', ''),
        'timeout_seconds' => (int) env('BEAT_AI_WORKER_TIMEOUT', 120),
    ],

    'llm' => [
        'base_url' => env('BEAT_LLM_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/'),
        'api_key' => env('BEAT_LLM_API_KEY', env('GEMINI_API_KEY', '')),
        'model' => env('BEAT_LLM_MODEL', 'gemini-flash-lite-latest'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY', env('BEAT_LLM_API_KEY', '')),
        'model' => env('GEMINI_MODEL', 'gemini-flash-lite-latest'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    ],

    'limits' => [
        'script_generations' => (int) env('BEAT_LIMIT_SCRIPT_GENERATIONS', 3),
        'pronunciation_tests' => (int) env('BEAT_LIMIT_PRONUNCIATION_TESTS', 3),
        'voice_previews' => (int) env('BEAT_LIMIT_VOICE_PREVIEWS', 3),
        'music_changes' => (int) env('BEAT_LIMIT_MUSIC_CHANGES', 3),
        'full_revisions' => (int) env('BEAT_LIMIT_FULL_REVISIONS', 2),
        'audio_url_ttl_minutes' => (int) env('BEAT_AUDIO_URL_TTL_MINUTES', 30),
    ],

    'analysis' => [
        'confidence_manual' => (float) env('BEAT_ANALYSIS_CONFIDENCE_MANUAL', 0.65),
        'confidence_confirm' => (float) env('BEAT_ANALYSIS_CONFIDENCE_CONFIRM', 0.80),
        'critical_missing_fields' => [
            'BUSINESS_NAME',
            'PRODUCTS_OR_SERVICES',
            'CALL_TO_ACTION',
        ],
    ],

    'taxonomies' => [
        'categories' => [
            'RETAIL_FASHION',
            'FOOD_HOSPITALITY',
            'BEAUTY_PERSONAL_CARE',
            'HEALTH_PHARMACY',
            'EDUCATION',
            'TRANSPORT_LOGISTICS',
            'REAL_ESTATE_CONSTRUCTION',
            'FINANCE_INSURANCE',
            'PROFESSIONAL_SERVICES',
            'TECHNOLOGY_TELECOM',
            'AGRICULTURE',
            'EVENTS_ENTERTAINMENT',
            'RELIGIOUS_COMMUNITY',
            'GENERAL_OTHER',
        ],
        'objectives' => [
            'VISIT_STORE',
            'CALL_NOW',
            'BOOK_SERVICE',
            'PROMOTE_PRODUCTS',
            'ANNOUNCE_OFFER',
            'BRAND_AWARENESS',
            'EVENT_ANNOUNCEMENT',
        ],
        'tones' => [
            'FRIENDLY_SALES',
            'PROFESSIONAL',
            'ENERGETIC',
            'CALM',
            'LUXURY',
            'YOUTHFUL',
            'RESPECTFUL',
        ],
        'missing_fields' => [
            'BUSINESS_NAME',
            'PRODUCTS_OR_SERVICES',
            'LOCATION',
            'CALL_TO_ACTION',
            'TARGET_AUDIENCE',
            'SELLING_POINT',
        ],
        'risk_flags' => [
            'NONE',
            'MEDICAL_CLAIM',
            'FINANCIAL_CLAIM',
            'LEGAL_CLAIM',
            'RELIGIOUS_SENSITIVITY',
            'AGE_RESTRICTED_PRODUCT',
            'MISLEADING_PROMOTION',
        ],
    ],

    'script' => [
        // Ceiling matches final caller-tune audio (40s). Shorter scripts/voice are fine.
        'max_duration_seconds' => (int) env('BEAT_SCRIPT_MAX_DURATION_SECONDS', 40),
        'default_language' => env('BEAT_SCRIPT_DEFAULT_LANGUAGE', 'sw-TZ'),
        'maximum_words' => (int) env('BEAT_SCRIPT_MAXIMUM_WORDS', 95),
        'maximum_primary_products' => 10,
        'maximum_secondary_products' => 4,
        'forbidden_claims' => [
            'bure',
            'free',
            '100%',
            'guaranteed',
            'hakuna gharama',
            'aina zote',
            'number one',
            'namba moja',
            'cheapest',
            'bei nafuu kabisa',
            'best',
            'bora kabisa',
        ],
        'unsupported_claim_replacements' => [
            'aina zote' => 'aina mbalimbali',
        ],
    ],

    'tts' => [
        'provider' => env('BEAT_TTS_PROVIDER', 'azure'),
        'default_voice_id' => env('BEAT_DEFAULT_VOICE_ID', 'daudi-professional'),
        'mms_model_id' => env('BEAT_MMS_MODEL_ID', 'facebook/mms-tts-swh'),
        'azure' => [
            'key' => env('AZURE_SPEECH_KEY', ''),
            'region' => env('AZURE_SPEECH_REGION', 'eastus'),
        ],
    ],

    'audio' => [
        'default_profile' => env('BEAT_AUDIO_PROFILE', 'vodacom_caller_tune'),
        // Calibrated against manual Chaz sample (16 kHz stereo PCM, ~39.5s)
        'profiles' => [
            'vodacom_caller_tune' => [
                'format' => 'wav',
                'sample_rate' => 16000,
                'channels' => 2,
                'bit_depth' => 16,
                'max_duration_seconds' => 40,
                'intro_delay_ms' => 1500,
                'outro_duration_ms' => 4000,
            ],
            'preview' => [
                'format' => 'mp3',
                'sample_rate' => 16000,
                'channels' => 1,
                'bit_depth' => 16,
                'max_duration_seconds' => 15,
                'watermark' => true,
                'intro_delay_ms' => 1200,
                'outro_duration_ms' => 2500,
            ],
            'pronunciation_test' => [
                'format' => 'mp3',
                'sample_rate' => 16000,
                'channels' => 1,
                'bit_depth' => 16,
                'max_duration_seconds' => 12,
                'watermark' => false,
            ],
        ],
    ],

];
