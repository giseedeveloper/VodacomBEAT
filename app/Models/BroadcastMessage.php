<?php

namespace App\Models;

use DateTime;
use Illuminate\Database\Eloquent\Model;

/**
 * @property numeric $audience_count
 * @property boolean $approved
 * @property DateTime $sent_at
 * @property string $content
 * @property string $topic_code
 */
class BroadcastMessage extends Model
{

    public static  $SMS_CHARACTERS = 160;

    protected $casts = [
        'created_at' => 'datetime:d-m-Y H:i',
        'sent_at' => 'datetime:d-m-Y H:i'
    ];

    protected $fillable = [
        "title",
        "content",
        "topic_code",
        "audience_count",
        "equivalent_sms_count",
        "approved",
        "send_at",
        "sent_at"
    ];

    //   $table->dateTime('send_at')->nullable();
    //            $table->dateTime('sent_at')->nullable();

}
