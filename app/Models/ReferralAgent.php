<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $user_id
 * @property string $phone_number
 * @property string $first_name
 * @property string $second_name
 * @property string $reference_number
 * @property string $mobile_network_id
 * @property string $bank_id
 */
class ReferralAgent extends Model
{
    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i',
    ];

    protected $with = [ 'network'];

    protected $fillable = [
        'user_id',
        'mobile_network_id',
        'bank_id',

        'first_name',
        'second_name',
        'phone_number',
        'sales_zone',

        'reference_number'
    ];


    public function network(): BelongsTo
    {
        return $this->belongsTo(MobileNetwork::class,'mobile_network_id');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class,'agent_id');
    }

}
