<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends Model
{

    protected $casts = [
        'created_at' => 'datetime:d-m-Y H:i'
    ];

    protected $fillable = [
        'subscription_id',
        'agent_id',
        'amount',
        'percentage',
        'paid_at'
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class,'subscription_id');
    }

}
