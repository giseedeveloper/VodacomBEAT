<?php

namespace App\Http\Controllers\reports;

use App\Http\Controllers\BaseController;
use App\Models\SelcomTransaction;
use App\Models\Subscription;
use App\Models\Vote;
use App\Models\VoteWeight;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionsReportsController extends BaseController
{

    public function __construct()
    {

    }

    public function getActiveSubscriptions(Request $request): JsonResponse
    {

        $perPage = $request->input('perPage');
        $phone = $request->input('phone');
        $queryBuilder = Subscription::query()
            ->where('expires_at', '>', Carbon::now());

        if ($phone) {
            $queryBuilder->where('phone_number','like', "%$phone%");
        }

        $responseData['subscriptions'] = $queryBuilder->latest()->paginate($perPage);

        $responseData['activeSubscriptions'] =  Subscription::query()
            ->where('expires_at',">",Carbon::now())
            ->count();

        return $this->returnResponse('Active subscriptions', $responseData);
    }


}




























