<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\BaseController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseController
{

    public function __construct()
    {

    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|max:64'
        ]);

        if ($validator->fails()) {
            return $this->returnError($validator->errors()->first(), ["Validation failed"], 422);
        }

        $phone = $this->cleanPhone($request->input('email'));


        $user = User::query()->where(['email' => $phone])->first();
        if (!$user) {
            return $this->returnError('User does not exist', ["User does not exist"], 412);
        }

        if(!$user->is_active){
            return $this->returnError('Your account has been deactivated. Please contact our support people', ["User does not exist"], 412);
        }

        if (!(Hash::check($request->input('password'), $user->password))) {
            return $this->returnError('Invalid credentials', [], 403);
        }

        $responseData['accessToken'] = $user->createToken('api')->plainTextToken;
        $responseData['user'] = $user;
        return $this->returnResponse('Logged In Successfully', $responseData);

    }


    public function cleanPhone($rwaPhone)
    {
        return $rwaPhone;
    }



}




























