<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string package
 * @property string duration
 * @property string price
 */
class TuneSubscriptionPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'package',
        'duration',
        'price'
    ];

}
