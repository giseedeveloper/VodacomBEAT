<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $content
 */
class NotificationMessageTemplate extends Model
{

    public static $TYPE_SUBSCRIPTION = "SUBSCRIPTION";
    public static $TYPE_UN_SUBSCRIPTION = "UN_SUBSCRIPTION";

    protected $casts = [
        'updated_at' => 'datetime:d-M-Y H:i',
    ];

    protected $fillable = [
        'code',
        'type',
        'content',
        'last_updated_by'
    ];

}
