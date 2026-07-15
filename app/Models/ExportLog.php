<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $batch_reference
 * @property int|null $exported_by
 * @property int $subscription_count
 * @property string|null $file_name
 * @property string|null $checksum
 */
class ExportLog extends Model
{

    protected $fillable = [
        'batch_reference',
        'exported_by',
        'subscription_count',
        'file_name',
        'checksum',
    ];

    public function subscriptions(): BelongsToMany
    {
        return $this->belongsToMany(
            TuneSubscription::class,
            'export_log_subscriptions',
            'export_log_id',
            'subscription_id'
        )->withTimestamps();
    }

    public function exporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exported_by');
    }

}
