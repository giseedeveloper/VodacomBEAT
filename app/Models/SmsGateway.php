<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $provider_code
 * @property string $is_default
 */

/**
 * @property string $provider_code
 * @property string $sender_id
 * @property string $balance
 */
class SmsGateway extends Model
{


    public static $MOBISHATRA = "MOBISHATRA";
    public static $NEXTSMS = "NEXTSMS";
    public static $MTEJA = "MTEJA";

    protected $casts = [
        'updated_at' => 'datetime:d-M-Y H:i',
    ];

   protected $fillable = [
       'provider_code',
       'provider_name',
       'is_default',
       'is_available',
       'sender_id',
       'last_updated_by'
   ];
}
