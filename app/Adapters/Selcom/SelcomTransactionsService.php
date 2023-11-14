<?php

namespace App\Adapters\Selcom;

use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Objects\SelcomCallback;
use App\Objects\SelcomOrderResponse;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class SelcomTransactionsService
{

    protected SelcomRestClient $selcomRestClient;

    protected string $vendorCode;
    protected string $pin;

    protected string $orderCreationUrl = "/checkout/create-order";
    protected string $pushUssdEndpoint = "/checkout/wallet-payment";

    protected string $orderCallbackUrl = "/checkout/create-order";
    protected string $orderRedirectionUrl = "/checkout/create-order";
    protected string $orderCancellationUrl = "/checkout/create-order";

    protected string $walletDisbursementUrl = "/walletcashin/process";

    public function __construct()
    {
        $this->selcomRestClient = new SelcomRestClient();

        $this->vendorCode = Config::get('selcom.auth.vendor');
        $this->pin = Config::get('selcom.auth.pin');
        $this->orderCallbackUrl = Config::get('selcom.urls.webhook');
        $this->orderRedirectionUrl = Config::get('selcom.urls.redirect');
        $this->orderCancellationUrl = Config::get('selcom.urls.cancel');
    }

    public function submitTransactionToSelcom(SelcomTransaction $transaction): SelcomOrderResponse
    {

        $orderDetails = array(
            "vendor" => $this->vendorCode,
            "order_id" => $transaction->order_id,
            "buyer_email" => "info@blinktechnologies.co.tz",
            "buyer_name" => "Blink Technologies",
            "buyer_userid" => $transaction->payer_phone,
            "buyer_phone" => $transaction->payer_phone,
            "amount" => $transaction->amount,
            "currency" => "TZS",
            "payment_methods" => "ALL,MASTERPASS,CARD,MOBILEMONEYPULL", // Choose your preferred method

            "redirect_url" => base64_encode($this->orderRedirectionUrl), // Optional
            "cancel_url" => base64_encode($this->orderCancellationUrl), // Optional
            "webhook" => base64_encode($this->orderCallbackUrl),

            "billing.firstname" => "Joshua",
            "billing.lastname" => "Wande",
            "billing.address_1" => "Dar es salaam,Tanzania",
            "billing.city" => "Dar es Salaam",
            "billing.state_or_region" => "Dar es Salaam",
            "billing.postcode_or_pobox" => "14113",
            "billing.country" => "TZ",
            "billing.phone" => "255763328665",

            "no_of_items" => 1,
            "link_colour" => "#FF0012", // Optional
            "header_colour" => "#FF0012" // Optional
        );

        Log::info("submitting order to selcom. sent selcomOrderDetails" . json_encode($orderDetails));
        return $this->selcomRestClient->post($this->orderCreationUrl, $orderDetails);
    }

    public function initiatePushUssd(SelcomTransaction $pendingSelcomTransaction): SelcomOrderResponse
    {

        /** @var [] $selcomOrderDetails */
        $selcomOrderDetails = array(
            "transid" => $pendingSelcomTransaction->id,
            "order_id" => $pendingSelcomTransaction->order_id,
            "msisdn" => $pendingSelcomTransaction->payer_phone
        );

        Log::info("push ussd - sent request" . json_encode($selcomOrderDetails));
        return $this->selcomRestClient->post($this->pushUssdEndpoint, $selcomOrderDetails, false);
    }


    public function creditCustomerWallet(SelcomTransaction $creditTransaction, $network): SelcomOrderResponse
    {

        /** @var [] $selcomDisbursementDetails */
        $selcomOrderDetails = array(
            "vendor" => $this->vendorCode,
            "pin" => $this->pin,
            "transid" => $creditTransaction->id,
            "utilitycode" => $network,
            "utilityref" => $creditTransaction->receiver_phone,
            "amount" => $creditTransaction->amount,
            "msisdn" => $creditTransaction->payer_phone,
        );

        Log::info("customer crediting request - sent request" . json_encode($selcomOrderDetails));

        $url = $this->walletDisbursementUrl; //Todo: uncomment
        return $this->selcomRestClient->post($url, $selcomOrderDetails, false);
    }

    public function createLocalSelcomTransaction(TuneSubscription $tuneSubscription): SelcomTransaction
    {

        /** @var SelcomTransaction | null $selcomTransaction */
        $selcomTransaction = SelcomTransaction::query()->create([
            "order_id" => $tuneSubscription->subscription_reference,
            "selcom_reference" => null,
            "selcom_uuid" => null,
            "selcom_token" => null,
            "payer_phone" => $tuneSubscription->payment_phone,
            "amount" => $tuneSubscription->amount
        ]);

        Log::info("created a local selcom transaction ".json_encode($selcomTransaction));
        return $selcomTransaction;
    }

    public function completeTransaction(SelcomCallback $selcomCallback): ?SelcomTransaction
    {

        /** @var SelcomTransaction | null  $selcomTransaction */
        $selcomTransaction = SelcomTransaction::query()->where([
            'order_id' => $selcomCallback->order_id
        ])->first();

        if (!$selcomTransaction) {
            Log::error("transaction with order id {$selcomCallback->order_id} was not found");
            return null;
        }

        $selcomTransaction->selcom_reference = $selcomCallback->reference;
        $selcomTransaction->selcom_transaction_id = $selcomCallback->selcomTransactionId;
        $selcomTransaction->amount = $selcomCallback->amount;
        $selcomTransaction->status = SelcomTransaction::$STATUS_SUCCESS;
        $selcomTransaction->payer_phone = $selcomCallback->phone;
        $selcomTransaction->save();

        return $selcomTransaction;

    }


}


