<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $subscription_id
 * @property int $version_number
 * @property string $language
 * @property string|null $plain_text
 * @property array|null $structured_payload
 * @property array|null $validation_errors
 * @property int|null $estimated_duration_seconds
 * @property string|null $tone
 * @property string $source
 */
class ScriptVersion extends Model
{

    protected $casts = [
        'structured_payload' => 'array',
        'validation_errors' => 'array',
    ];

    protected $fillable = [
        'subscription_id',
        'version_number',
        'language',
        'plain_text',
        'structured_payload',
        'validation_errors',
        'estimated_duration_seconds',
        'tone',
        'source',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(TuneSubscription::class, 'subscription_id');
    }

}
