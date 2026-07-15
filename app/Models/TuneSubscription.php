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
        'products_or_services' => 'array',
        'secondary_products' => 'array',
        'selling_points' => 'array',
        'must_include_words' => 'array',
        'must_exclude_words' => 'array',
        'requires_admin_script_review' => 'boolean',
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
        'landmark',
        'business_industry',
        'business_description',
        'products_or_services',
        'secondary_products',
        'target_audience',
        'call_to_action',
        'selling_points',
        'preferred_tone',
        'must_include_words',
        'must_exclude_words',
        'offer_text',
        'business_category',
        'ad_objective',
        'script_template_key',
        'analysis_action',
        'requires_admin_script_review',
        'selected_script_variant',
        'latest_analysis_id',
        'script_generation_count',
        'voice_preview_count',
        'pronunciation_test_count',
        'final_audio_regeneration_count',
        'music_change_count',
        'preferred_voice_profile',
        'speaking_speed',
        'music_intensity',
        'preferred_music_track_id',

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
