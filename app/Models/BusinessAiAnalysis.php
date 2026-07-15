<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessAiAnalysis extends Model
{
    protected $fillable = [
        'subscription_id',
        'provider',
        'model',
        'prompt_version',
        'input_snapshot',
        'raw_response',
        'parsed_response',
        'category',
        'subcategory',
        'objective',
        'recommended_tone',
        'confidence',
        'risk_flags',
        'missing_fields',
        'follow_up_questions',
        'recommended_template_key',
        'resolved_template_key',
        'next_action',
        'requires_admin_review',
        'latency_ms',
        'input_tokens',
        'output_tokens',
        'status',
    ];

    protected $casts = [
        'input_snapshot' => 'array',
        'raw_response' => 'array',
        'parsed_response' => 'array',
        'risk_flags' => 'array',
        'missing_fields' => 'array',
        'follow_up_questions' => 'array',
        'requires_admin_review' => 'boolean',
        'confidence' => 'float',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(TuneSubscription::class, 'subscription_id');
    }
}
