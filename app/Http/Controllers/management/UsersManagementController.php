<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;

class UsersManagementController extends BaseController
{

    public function __construct()
    {

    }

    public function fetchUsers(): JsonResponse
    {
        $users =  User::query()->paginate(20);
        $responseData['users'] = $users;
        return $this->returnResponse('System Users', $responseData);
    }

    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user =  User::query()->create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'is_active' => true
        ]);

        $responseData['users'] = $user;
        return $this->returnResponse('System Users', $responseData);
    }

    public function updateUser(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|numeric',
            'name' => 'required',
            'is_active' => 'required|boolean'
        ]);

        $user =  User::query()->find($request->input('id'));
        if(!$user){
            return $this->returnError("User not found",[],400);
        }

        $user->name = $request->input('name');
        $user->is_active = $request->input('is_active');
        $user->save();

        $responseData['user'] = $user;
        return $this->returnResponse('User updated', $responseData);

    }

    public function resetUserPassword(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|numeric',
            'new_password' => 'required|min:6'
        ]);

        $user =  User::query()->find($request->input('id'));
        if(!$user){
            return $this->returnError("User not found",[],400);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        $responseData['user'] = $user;
        return $this->returnResponse('User password updated', $responseData);

    }

    public function fetchSystemPermissions(Request $request): JsonResponse
    {

        $permissions =  Permission::all();
        $responseData['permissions'] = User::formatPermissions($permissions);
        return $this->returnResponse('System Permissions', $responseData);
    }

    public function assignPermissionsToUser(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required|numeric',
            'permissions_names' => 'required|array'
        ]);

        $user =  User::query()->find($request->input('id'));
        if(!$user){
            return $this->returnError("User not found",[],400);
        }

        $user->syncPermissions($request->input('permissions_names'));

        $responseData['user'] = $user;
        $responseData['assignedPermissions'] = $user->getPermissionNames();

        return $this->returnResponse('System Permissions', $responseData);

    }



}




























