<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * @property String  $name
 * @property String  $selcom_code
 */
class MobileNetwork extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "prefix",
        "selcom_code",
        "mnc_code"
    ];

}
