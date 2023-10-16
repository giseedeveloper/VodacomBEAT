<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $message
 */
class SmsHistory extends Model
{
    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i'
    ];

    protected $fillable = [
        "topic_code",
        "topic_name",
        "audience_count",
        "message",
        "initiator"
    ];
}
