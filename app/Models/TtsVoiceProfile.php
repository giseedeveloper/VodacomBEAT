<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TtsVoiceProfile extends Model
{
    protected $casts = [
        'is_finetuned' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
    ];

    protected $fillable = [
        'slug',
        'label',
        'provider',
        'model_id',
        'provider_voice_id',
        'gender',
        'style',
        'speaking_rate',
        'pitch',
        'language',
        'is_finetuned',
        'is_default',
        'is_active',
        'is_premium',
        'preview_audio_path',
        'style_prompt',
        'license_note',
    ];
}
