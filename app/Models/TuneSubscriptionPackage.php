<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string package
 * @property string duration
 * @property string price
 * @property string commission_percentage
 * @property string commission_amount
 */
class TuneSubscriptionPackage extends Model
{

    protected $fillable = [
        'package',
        'duration',
        'price',
        'commission_percentage',
        'commission_amount'
    ];


}
