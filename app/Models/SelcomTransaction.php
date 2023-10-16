<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $vote_id
 * @property integer $amount
 * @property integer $payer_phone
 * @property integer $status
 * @property integer $order_id
 * @property string $selcom_reference
 * @property string $selcom_transaction_id
 * @property string $selcom_uuid
 * @property string $selcom_token
 * @property string $payment_url
 * @property string $receiver_phone
 * @property string $remark
 * @property string $qr
 */
class SelcomTransaction extends Model
{



    public static $STATUS_SUCCESS = "SUCCESS";
    public static $STATUS_FAILED = "FAILED";
    public static $STATUS_PENDING = "PENDING";

    public static $TYPE_DEBIT_CUSTOMER = "DEBIT_CUSTOMER";
    public static $TYPE_CREDIT_CUSTOMER = "CREDIT_CUSTOMER";
    public static $TYPE_AGENT_COMMISSION = "AGENT_COMMISSION_DISBURSEMENT";

    protected $fillable = [
        "order_id",

        "transaction_type",
        "selcom_reference",
        "selcom_transaction_id",
        "selcom_uuid",
        "selcom_token",
        "payer_phone",
        "receiver_phone",
        "amount",
        "status",
        "remark",
        "payment_url",
        "qr"
    ];

    public function vote(){
        return $this->belongsTo(Vote::class,'vote_id');
    }

}

