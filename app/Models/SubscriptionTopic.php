<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $code
 * @property string $name
 * @property string $subscribersCount
 */
class SubscriptionTopic extends Model
{

    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i'
    ];

    protected $fillable = [
        'name',
        'code',
        'is_Active'
    ];
}
