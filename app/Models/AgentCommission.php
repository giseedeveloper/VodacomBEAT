<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentCommission extends Model
{


    public static $STATUS_SUCCESS = "SUCCESS";
    public static $STATUS_FAILED = "FAILED";
    public static $STATUS_PENDING = "PENDING";

    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'transaction_id',
        'name',
        'phone_number',
        'amount',
        'status',
        'remark'
    ];

}
