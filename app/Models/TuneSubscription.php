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
 *
 * @property string $status
 * @property string $installed_at
 * @property string $installed_by
 *
 * @property string $commission_issued_at
 * @property string $commission_issued_by
 * @property string $commission_amount
 */
class TuneSubscription extends Model
{

    protected $with = ['phones','package','agent'];

    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i',
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

        'business_location',
        'business_industry',
        'call_to_action',
        'script_generation_count',
        'voice_preview_count',

        'payment_phone',
        'voice_type',
        'voice_script',
        'amount',
        'starts_at',
        'ends_at',
        'paid_at',

        'status',
        'installed_at',
        'installed_by',

        'commission_issued_at',
        'commission_issued_by',
        'commission_amount'
    ];

    public function phones(){
        return $this->hasMany(TuneSubscriptionPhone::class,'subscription_id');
    }

    public function agent(){
        return $this->belongsTo(ReferralAgent::class,'agent_id');
    }

    public function package(){
        return $this->belongsTo(TuneSubscriptionPackage::class,'subscription_package_id');
    }

    public function scriptVersions()
    {
        return $this->hasMany(ScriptVersion::class, 'subscription_id');
    }

    public function exportLogs()
    {
        return $this->belongsToMany(ExportLog::class, 'export_log_subscriptions', 'subscription_id', 'export_log_id')
            ->withTimestamps();
    }

    public function statusLogs()
    {
        return $this->hasMany(SubscriptionStatusLog::class, 'subscription_id');
    }

    public function audioAssets()
    {
        return $this->hasMany(AudioAsset::class, 'subscription_id');
    }

}
