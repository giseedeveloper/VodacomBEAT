<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property integer $id
 * @property string $topic_code
 * @property string $phone_number
 * @property integer $amount
 * @property string $package
 * @property Carbon $starts_at
 * @property Carbon $expires_at
 * @property boolean $include
 * @property string $referred_by
 */
class Subscription extends Model
{

    public static $PACKAGE_WEEK = "WEEK";
    public static $PACKAGE_MONTH = "MONTH";

    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i',
        'starts_at' => 'datetime:d-M-Y H:i',
        'expires_at' => 'datetime:d-M-Y H:i',
    ];

    protected $with = [
        'transaction'
    ];

    protected $fillable = [
        'customer_id',
        'transaction_id',

        'full_name',
        'phone_number',
        'amount',
        'topic_code',

        'package',
        'include',
        'starts_at',
        'referred_by',
        'expires_at'
    ];

    public function transaction()
    {
        return $this->belongsTo(LedgerTransaction::class, 'transaction_id');
    }

}
