<?php

namespace App\Services\payment;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Models\AgentCommission;
use App\Models\MobileNetwork;
use App\Models\ReferralAgent;
use App\Models\SelcomTransaction;
use App\Models\TuneSubscription;
use App\Utils\PhoneNumberUtil;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class AgentsCommissionService
{


    public static function onCommissionDisbursement(TuneSubscription $tuneSubscription): ?bool
    {

        /** @var ReferralAgent | null $agent */
        $agent = $tuneSubscription->agent;
        if ($agent == null) {
            Log::debug("Failed to disburse funds, subscription has no agent. {}".json_encode($tuneSubscription));
            return false;
        }

        /** @var MobileNetwork | null $agentNetwork */
        $agentNetwork = $agent->network;
        if ($agentNetwork == null) {
            Log::debug("Failed to disburse funds to agent, agent has no network".json_encode($tuneSubscription));
            return false;
        }

        $mobiadPhone = Config::get('selcom.auth.mobiad_phone');
        $commissionReceiverPhone = PhoneNumberUtil::formatPhoneNumberTZ($agent->phone_number);
        $payerPhoneFormatted = PhoneNumberUtil::formatPhoneNumberTZ($mobiadPhone);

        /** @var SelcomTransaction | null $selcomCreditTransaction */
        $selcomCreditTransaction = SelcomTransaction::query()->create([
            "order_id" => $tuneSubscription->id,
            "transaction_type" => SelcomTransaction::$TYPE_AGENT_COMMISSION,
            "payer_phone" => $payerPhoneFormatted,
            "receiver_phone" => $commissionReceiverPhone,
            "amount" => $tuneSubscription->commission_amount,
            "status" => SelcomTransaction::$STATUS_PENDING
        ]);

        $selcomClient = new SelcomTransactionsService();
        $selcomResults = $selcomClient->creditCustomerWallet($selcomCreditTransaction, $agentNetwork->selcom_code);

        if ($selcomResults->isSuccess) {
            Log::info("commission remitted to agent $commissionReceiverPhone for subscription ".json_encode($tuneSubscription));

            //Update selcom transaction
            $selcomCreditTransaction->status = SelcomTransaction::$STATUS_SUCCESS;
            $selcomCreditTransaction->remark = $selcomResults->message;
            $selcomCreditTransaction->selcom_reference = $selcomResults->reference;
            $selcomCreditTransaction->save();

            //Record disbursed commission
            AgentCommission::query()->create([
                'subscription_id' => $tuneSubscription->id,
                'transaction_id' => $selcomCreditTransaction->id,
                'name' => $agent->first_name . " " . $agent->second_name,
                'phone_number' => $commissionReceiverPhone,
                'amount' => $selcomCreditTransaction->amount,
                'remark' =>$selcomResults->message,
                'status' => AgentCommission::$STATUS_SUCCESS
            ]);

            return true;
        }


        //Update selcom transaction
        $remark = $selcomCreditTransaction->remark;
        Log::info("failed to remit commission to agent $commissionReceiverPhone. $remark.  for subscription: ".json_encode($tuneSubscription));
        $selcomCreditTransaction->remark = $selcomResults->message;
        $selcomCreditTransaction->status = SelcomTransaction::$STATUS_FAILED;
        $selcomCreditTransaction->save();

        //Record failed commission
        AgentCommission::query()->create([
            'subscription_id' => $tuneSubscription->id,
            'transaction_id' => $selcomCreditTransaction->id,
            'name' => $agent->first_name . " " . $agent->second_name,
            'phone_number' => $commissionReceiverPhone,
            'amount' => $selcomCreditTransaction->amount,
            'remark' =>$selcomResults->message,
            'status' => AgentCommission::$STATUS_FAILED
        ]);

        return false;
    }


}
