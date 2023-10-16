<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $phone_number
 * @property string $mno
 */
class Customer extends Model
{

    protected $fillable = [
        'full_name',
        'business_name',
        'phone_number',
        'mno'
    ];

}
