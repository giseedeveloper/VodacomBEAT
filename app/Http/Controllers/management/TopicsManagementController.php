<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\SubscriptionTopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class TopicsManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getTopics(Request $request): JsonResponse
    {
        $topics = SubscriptionTopic::query()->paginate(100);
        $responseData['topics'] = $topics;
        return $this->returnResponse('Topics', $responseData);

    }

    public function addTopic(Request $request): JsonResponse
    {

        $request->validate([
            'name' => 'required',
            'code' => 'required',
        ]);

        /** @var SubscriptionTopic $referral */
        $agent = SubscriptionTopic::query()->create([
            'name' => $request->input('name'),
            'code' => $request->input('code')
        ]);

        $responseData['topic'] = $agent;
        return $this->returnResponse('Topic created', $responseData);
    }


    public function updateTopic(Request $request): JsonResponse
    {

        $request->validate([
            'name' => 'required',
            'code' => 'required',
        ]);

        /** @var SubscriptionTopic $referral */
        $status = SubscriptionTopic::where([
            'id' => $request->input('id')
        ])->update([
            'name' => $request->input('name')
        ]);

        $responseData['topic'] = $status;
        return $this->returnResponse('Topic updated', $responseData);
    }


}




























