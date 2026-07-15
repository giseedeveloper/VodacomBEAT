<?php

namespace App\Exceptions;

use Exception;

class InvalidStatusTransitionException extends Exception
{

    public static function make(string $from, string $to): self
    {
        return new self("Invalid subscription status transition from {$from} to {$to}");
    }

}
