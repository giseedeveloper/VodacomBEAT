<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\NotificationMessageTemplate;
use App\Models\TuneSubscriptionPackage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;

class SubscriptionPackagesManagementController extends BaseController
{

    public function __construct()
    {

    }

    public function fetchPackages(): JsonResponse
    {
        $users = TuneSubscriptionPackage::query()->paginate(20);
        $responseData['packages'] = $users;
        return $this->returnResponse('TuneSubscriptionPackages', $responseData);
    }

    public function updatePackage(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required|numeric',
            'package' => 'required',
            'duration' => 'required',
            'price' => 'required|numeric',
        ]);

        $record = TuneSubscriptionPackage::query()->where([
            'id' => $request->input('id')
        ])->update([
            'package' => $request->input('package'),
            'duration' => $request->input('duration'),
            'price' => $request->input('price')
        ]);

        $responseData['record'] = $record;
        return $this->returnResponse('Updated successfully', $responseData);
    }


}




























