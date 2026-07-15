<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScriptTemplate extends Model
{
    protected $fillable = [
        'template_key',
        'name',
        'category',
        'objective',
        'supported_tones',
        'language',
        'version',
        'maximum_words',
        'target_duration_seconds',
        'required_fields',
        'optional_fields',
        'opening_rules',
        'body_rules',
        'cta_rules',
        'prohibited_claims',
        'prompt_instructions',
        'status',
        'priority',
    ];

    protected $casts = [
        'supported_tones' => 'array',
        'required_fields' => 'array',
        'optional_fields' => 'array',
        'opening_rules' => 'array',
        'body_rules' => 'array',
        'cta_rules' => 'array',
        'prohibited_claims' => 'array',
    ];

    public function isActive(): bool
    {
        return strtoupper((string) $this->status) === 'ACTIVE';
    }
}
