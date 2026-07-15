<?php

namespace App\Objects;

use App\Models\SelcomTransaction;

class TransactionCompletionResult
{

    public ?SelcomTransaction $transaction;

    /**
     * True when the transaction was already SUCCESS before this callback,
     * i.e. this is a duplicate Selcom delivery and callers must skip
     * payment processing and ledger writes.
     */
    public bool $wasAlreadyCompleted;

    public function __construct(?SelcomTransaction $transaction, bool $wasAlreadyCompleted = false)
    {
        $this->transaction = $transaction;
        $this->wasAlreadyCompleted = $wasAlreadyCompleted;
    }

}
