<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $subscription_id
 * @property string $asset_type
 * @property string|null $voice_id
 * @property string $provider
 * @property string $file_path
 * @property string $format
 * @property int|null $sample_rate
 * @property float|null $duration_seconds
 * @property string|null $checksum_sha256
 * @property string|null $profile
 */
class AudioAsset extends Model
{

    protected $fillable = [
        'subscription_id',
        'asset_type',
        'voice_id',
        'provider',
        'file_path',
        'format',
        'sample_rate',
        'duration_seconds',
        'checksum_sha256',
        'profile',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(TuneSubscription::class, 'subscription_id');
    }

}
