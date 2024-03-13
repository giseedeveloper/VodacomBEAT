<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\ReferralAgent;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VoteWeight;
use App\Services\NotificationServiceService;
use App\Services\ReferralsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\Fluent\Concerns\Has;


class AgentsManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getAgent(Request $request): JsonResponse
    {
        $user = Auth::user();
        $agent = ReferralAgent::query()->where([
            'user_id' => $user->id
        ])->first();
        $responseData['agent'] = $agent;
        return $this->returnResponse('Referral agent', $responseData);

    }

    public function addReferral(Request $request): JsonResponse
    {

        $request->validate([
            'first_name' => 'required',
            'second_name' => 'required',
            'phone_number' => 'required',
            'mobile_network_id' => 'required|numeric',
            'sales_zone' => 'required'
        ]);

        $user = User::query()->where('email',$request->input('phone_number'))->first();
        if($user){
            return $this->returnError("User already exists",[],400);
        }

        $password = rand(111111, 999999);
        $user = User::query()->create([
            'name' => $request->input('first_name'),
            'email' => $request->input('phone_number'),
            'password' => Hash::make($password),
            'is_active' => true
        ]);


        /** @var ReferralAgent $referral */
        $agent = ReferralAgent::query()->create([
            'user_id' => $user->id,
            'mobile_network_id' => $request->input('mobile_network_id'),
            'first_name' => $request->input('first_name'),
            'second_name' => $request->input('second_name'),
            'phone_number' => $request->input('phone_number'),
            'sales_zone' => $request->input('sales_zone'),

            'commission_percentage' => $request->input('commission_percentage'),
            'commission_amount' => $request->input('commission_amount')
        ]);

        $reference = ReferralsService::generateReferenceNumber($agent);
        $agent->reference_number = $reference;
        $agent->save();

        ReferralsService::notifyAgent($agent, $password);

        $responseData['referral'] = $agent;
        return $this->returnResponse('Referral agent created', $responseData);
    }

    public function getAgents(Request $request): JsonResponse
    {
        $query = $request->input('query');

        $referralsQueryBuilder = ReferralAgent::query();
        if (!empty($query)) {
            $referralsQueryBuilder->where('phone_number', 'like', "%$query%")
                ->orWhere('first_name', 'like', "%$query%")
                ->orWhere('second_name', 'like', "%$query%");
        }

        $referralsQueryBuilder->where('status',ReferralAgent::$STATUS_ACTIVE);

        $referrals = $referralsQueryBuilder->latest()->paginate(50);
        $responseData['referrals'] = $referrals;
        return $this->returnResponse('Referrals', $responseData);
    }

    public function suspendReferral(Request $request): JsonResponse
    {
        $responseData['subscription'] = "";
        return $this->returnResponse('Subscription update', $responseData);
    }

    public function updateReferral(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required|numeric',
            'first_name' => 'required',
            'second_name' => 'required',
            'phone_number' => 'required',
            'mobile_network_id' => 'required|numeric',
            'sales_zone' => 'required'
        ]);

        $referral = ReferralAgent::query()->where([
            'id' => $request->input('id')
        ])->update([
            'mobile_network_id' => $request->input('mobile_network_id'),
            'first_name' => $request->input('first_name'),
            'second_name' => $request->input('second_name'),
            'phone_number' => $request->input('phone_number'),
            'commission_percentage' => $request->input('commission_percentage'),
            'commission_amount' => $request->input('commission_amount'),
            'sales_zone' => $request->input('sales_zone')
        ]);

        $responseData['referral'] = $referral;
        return $this->returnResponse('Referral agent updated', $responseData);
    }

    public function removeAgent(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|numeric'
        ]);



        $referral = ReferralAgent::query()->where([
            'id' => $request->input('id')
        ])->update([
            'status' => ReferralAgent::$STATUS_NOT_ACTIVE
        ]);

        $referral = ReferralAgent::query()->find($request->input('id'));
        if(!$$referral){
            return $this->returnError("Agent not found",[],412);
        }

        $userUpdate = User::query()->where([
            'id' => $referral->user_id
        ])->update([
            'is_active' => false
        ]);

        $responseData['referral'] = $referral;
        $responseData['userUpdate'] = $userUpdate;
        return $this->returnResponse('Referral agent updated', $responseData);
    }

    public function resetPassword(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required|numeric',
            'password' => 'required|min:6'
        ]);

        $password = $request->input("password");

        /** @var ReferralAgent | null $agent */
        $agent = ReferralAgent::query()->where([
            'id' => $request->input('id')
        ])->first();
        if(!$agent){
            return $this->returnError("Agent not found",[],400);
        }

        /** @var User | null $user */
        $user = User::query()->find($agent->user_id);
        if(!$user){
            return $this->returnError("Agent user not found",[],400);
        }

        $user->password = Hash::make($password);
        $user->save();

        NotificationServiceService::sendOneSms("Your new password is $password. Don't share it with anyone",$agent->phone_number);
        $responseData['agent'] = $agent;
        return $this->returnResponse('Referral agent password updated', $responseData);
    }


}




























