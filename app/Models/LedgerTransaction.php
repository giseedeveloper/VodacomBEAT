<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $subscription_id
 * @property integer $subscriber_id
 * @property integer $amount
 * @property integer $payer_phone
 * @property integer $status
 * @property integer $order_id
 * @property string $selcom_reference
 * @property string $selcom_uuid
 * @property string $selcom_token
 * @property string $payment_url
 *
 * @property string $receipt
 * @property string $reference
 * @property string $txid
 * @property string $third_party
 *
 * @property string $qr
 */
class LedgerTransaction extends Model
{

    public static $STATUS_SUCCESS = "SUCCESS";
    public static $STATUS_FAILURE = "FAILURE";
    public static $STATUS_PENDING = "PENDING";

    protected $casts = [
        'created_at' => 'datetime:d-M-Y H:i',
    ];

    protected $fillable = [
        "order_id",

        "selcom_reference",
        "selcom_uuid",
        "selcom_token",

        "subscription_id",
        "subscriber_id",
        "payer_phone",
        "amount",
        "status",
        "payment_url",

        "receipt",
        "reference",
        "txid",
        "third_party",

        "qr"
    ];


}
