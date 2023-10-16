<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $phone_number
 * @property string $first_name
 * @property string $reference_number
 */
class ReferralAgent extends Model
{
    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i',
    ];

    protected $fillable = [
        'user_id',
        'first_name',
        'second_name',
        'phone_number',
        'sales_zone',
        'reference_number'
    ];

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class,'agent_id');
    }

}
