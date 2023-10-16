<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $transaction_id
 * @property string $subscription_reference
 * @property string $subscription_package_id
 * @property string $payment_phone
 * @property string $customer_id
 * @property string $amount
 *
 * @property string $starts_at
 * @property string $ends_at
 * @property string $paid_at
 */
class TuneSubscription extends Model
{
    use HasFactory;

    protected $with = ['phones'];

    protected $casts = [
        'starts_at' => 'datetime:d-M-Y H:i',
        'ends_at' => 'datetime:d-M-Y H:i',
    ];

    protected $fillable = [
        'customer_id',
        'subscription_reference',
        'transaction_id',
        'agent_id',
        'subscription_package_id',
        'contact_phone',
        'contact_person_name',
        'business_name',

        'payment_phone',
        'voice_type',
        'voice_script',
        'amount',
        'starts_at',
        'ends_at',
        'paid_at',

        'commission_issued_at',
        'commission_issued_by',
        'commission_amount'
    ];

    public function phones(){
        return $this->hasMany(TuneSubscriptionPhone::class,'subscription_id');
    }

}
