<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $subscription_id
 * @property string $from_status
 * @property string $to_status
 * @property integer $changed_by
 * @property string $remark
 */
class SubscriptionStatusLog extends Model
{

    protected $fillable = [
        'subscription_id',
        'from_status',
        'to_status',
        'changed_by',
        'remark',
    ];

    public function subscription()
    {
        return $this->belongsTo(TuneSubscription::class, 'subscription_id');
    }

}
