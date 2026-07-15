<?php

namespace App\Services;

use App\Exceptions\InvalidStatusTransitionException;
use App\Models\SubscriptionStatusLog;
use App\Models\TuneSubscription;
use Illuminate\Support\Facades\Log;

class SubscriptionStatusService
{

    // Full BEAT lifecycle statuses
    public const DRAFT = 'DRAFT';
    public const SCRIPT_GENERATING = 'SCRIPT_GENERATING';
    public const SCRIPT_READY = 'SCRIPT_READY';
    public const PREVIEW_GENERATING = 'PREVIEW_GENERATING';
    public const PREVIEW_READY = 'PREVIEW_READY';
    public const CUSTOMER_APPROVED = 'CUSTOMER_APPROVED';
    public const AWAITING_PAYMENT = 'AWAITING_PAYMENT';
    public const PAYMENT_PENDING = 'PAYMENT_PENDING';
    public const PAID = 'PAID';
    public const FINAL_AUDIO_GENERATING = 'FINAL_AUDIO_GENERATING';
    public const READY_FOR_QA = 'READY_FOR_QA';
    public const QA_CHANGES_REQUIRED = 'QA_CHANGES_REQUIRED';
    public const READY_FOR_INSTALLATION = 'READY_FOR_INSTALLATION';
    public const EXPORTED = 'EXPORTED';
    public const INSTALLATION_IN_PROGRESS = 'INSTALLATION_IN_PROGRESS';
    public const INSTALLED = 'INSTALLED';
    public const ACTIVE = 'ACTIVE';
    public const EXPIRED = 'EXPIRED';

    // Side states
    public const CANCELLED = 'CANCELLED';
    public const FAILED = 'FAILED';
    public const MANUAL_REVIEW_REQUESTED = 'MANUAL_REVIEW_REQUESTED';

    public const ALL_STATUSES = [
        self::DRAFT,
        self::SCRIPT_GENERATING,
        self::SCRIPT_READY,
        self::PREVIEW_GENERATING,
        self::PREVIEW_READY,
        self::CUSTOMER_APPROVED,
        self::AWAITING_PAYMENT,
        self::PAYMENT_PENDING,
        self::PAID,
        self::FINAL_AUDIO_GENERATING,
        self::READY_FOR_QA,
        self::QA_CHANGES_REQUIRED,
        self::READY_FOR_INSTALLATION,
        self::EXPORTED,
        self::INSTALLATION_IN_PROGRESS,
        self::INSTALLED,
        self::ACTIVE,
        self::EXPIRED,
        self::CANCELLED,
        self::FAILED,
        self::MANUAL_REVIEW_REQUESTED,
    ];

    /**
     * Statuses that mean payment has already been received (PAID or later).
     * Used by the webhook to detect duplicate callbacks.
     */
    public const PAID_OR_LATER = [
        self::PAID,
        self::FINAL_AUDIO_GENERATING,
        self::READY_FOR_QA,
        self::QA_CHANGES_REQUIRED,
        self::READY_FOR_INSTALLATION,
        self::EXPORTED,
        self::INSTALLATION_IN_PROGRESS,
        self::INSTALLED,
        self::ACTIVE,
        self::EXPIRED,
    ];

    /**
     * Allowed transitions, focused on the states reachable today:
     * payment path + installation path + side states.
     * Extend as the AI/audio pipeline phases come online.
     */
    protected const ALLOWED_TRANSITIONS = [
        self::DRAFT => [
            self::SCRIPT_GENERATING,
            self::AWAITING_PAYMENT,
            self::CANCELLED,
            self::FAILED,
            self::MANUAL_REVIEW_REQUESTED,
        ],
        self::SCRIPT_GENERATING => [self::SCRIPT_READY, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::SCRIPT_READY => [
            self::SCRIPT_GENERATING,
            self::PREVIEW_GENERATING,
            self::CUSTOMER_APPROVED,
            self::AWAITING_PAYMENT,
            self::CANCELLED,
            self::FAILED,
            self::MANUAL_REVIEW_REQUESTED,
        ],
        self::PREVIEW_GENERATING => [self::PREVIEW_READY, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::PREVIEW_READY => [
            self::PREVIEW_GENERATING,
            self::CUSTOMER_APPROVED,
            self::SCRIPT_GENERATING,
            self::CANCELLED,
            self::FAILED,
            self::MANUAL_REVIEW_REQUESTED,
        ],
        self::CUSTOMER_APPROVED => [self::AWAITING_PAYMENT, self::CANCELLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::AWAITING_PAYMENT => [self::PAYMENT_PENDING, self::PAID, self::CANCELLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::PAYMENT_PENDING => [self::PAID, self::AWAITING_PAYMENT, self::CANCELLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::PAID => [
            self::FINAL_AUDIO_GENERATING,
            self::READY_FOR_INSTALLATION,
            self::EXPORTED,
            self::INSTALLED,
            self::CANCELLED,
            self::FAILED,
            self::MANUAL_REVIEW_REQUESTED,
        ],
        self::FINAL_AUDIO_GENERATING => [self::READY_FOR_QA, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::READY_FOR_QA => [self::READY_FOR_INSTALLATION, self::QA_CHANGES_REQUIRED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::QA_CHANGES_REQUIRED => [
            self::SCRIPT_GENERATING,
            self::PREVIEW_GENERATING,
            self::FINAL_AUDIO_GENERATING,
            self::READY_FOR_INSTALLATION,
            self::FAILED,
            self::MANUAL_REVIEW_REQUESTED,
        ],
        self::READY_FOR_INSTALLATION => [self::EXPORTED, self::INSTALLATION_IN_PROGRESS, self::INSTALLED, self::CANCELLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::EXPORTED => [self::INSTALLATION_IN_PROGRESS, self::INSTALLED, self::CANCELLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::INSTALLATION_IN_PROGRESS => [self::INSTALLED, self::FAILED, self::MANUAL_REVIEW_REQUESTED],
        self::INSTALLED => [self::ACTIVE],
        self::ACTIVE => [self::EXPIRED],
        self::MANUAL_REVIEW_REQUESTED => [self::READY_FOR_INSTALLATION, self::CANCELLED, self::FAILED],
        self::EXPIRED => [],
        self::CANCELLED => [],
        self::FAILED => [],
    ];

    public static function isValidStatus(string $status): bool
    {
        return in_array($status, self::ALL_STATUSES, true);
    }

    public static function isPaidOrLater(?string $status): bool
    {
        return in_array($status, self::PAID_OR_LATER, true);
    }

    public static function canTransition(string $from, string $to): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$from] ?? [];
        return in_array($to, $allowed, true);
    }

    /**
     * Validate and apply a status transition, writing an audit log row.
     *
     * @throws InvalidStatusTransitionException when the transition is not allowed
     */
    public static function transition(TuneSubscription $sub, string $to, ?int $changedBy = null, ?string $remark = null): TuneSubscription
    {
        $from = $sub->status ?? self::AWAITING_PAYMENT;

        if (! self::isValidStatus($to)) {
            throw InvalidStatusTransitionException::make($from, $to);
        }

        if (! self::canTransition($from, $to)) {
            throw InvalidStatusTransitionException::make($from, $to);
        }

        $sub->status = $to;
        $sub->save();

        SubscriptionStatusLog::query()->create([
            'subscription_id' => $sub->id,
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $changedBy,
            'remark' => $remark,
        ]);

        Log::info("subscription {$sub->id} status transition {$from} -> {$to}"
            . ($changedBy !== null ? " by user {$changedBy}" : "")
            . ($remark !== null ? " ({$remark})" : ""));

        return $sub;
    }

}
