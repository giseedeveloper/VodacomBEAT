<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PronunciationEntry extends Model
{
    protected $fillable = [
        'original_text',
        'replacement_text',
        'phoneme',
        'language',
        'scope',
        'subscription_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
