<?php

namespace App\Services;


use App\Models\LedgerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TransactionsService
{

    protected string $vendorCode = "TILL60917564";
    protected string $orderRedirectionUrl = "/checkout/create-order";


    public function __construct()
    {

    }

    public static function addTransaction(Request $request)
    {
        $phoneNumber = $request->input('msisdn');
        $amount = $request->input('amount');
        Log::info("Creating a transaction for $phoneNumber, amount: $amount");

        return LedgerTransaction::create([
            'payer_phone'=> $phoneNumber,
            'amount'=>$amount,

            'reference'=>$request->input('reference'),
            'receipt'=>$request->input('receipt'),
            'txid'=>$request->input('txid'),
            'third_party'=>$request->input('operator'),

            'status'=>LedgerTransaction::$STATUS_SUCCESS
        ]);

    }




}


