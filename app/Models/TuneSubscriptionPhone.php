<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TuneSubscriptionPhone extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'customer_id',
        'phone_number'
    ];

}
