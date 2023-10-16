<?php

namespace App\Http\Controllers\management;

use App\Http\Controllers\BaseController;
use App\Models\NotificationMessageTemplate;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;

class NotificationTemplatesManagementController extends BaseController
{

    public function __construct()
    {

    }

    public function fetchNotificationTemplates(): JsonResponse
    {
        $users = NotificationMessageTemplate::query()->paginate(20);
        $responseData['notifications'] = $users;
        return $this->returnResponse('Notification Templates', $responseData);
    }

    public function updateNotificationTemplate(Request $request): JsonResponse
    {

        $request->validate([
            'id' => 'required',
            'content' => 'required',
        ]);

        $record = NotificationMessageTemplate::query()->where([
            'id' => $request->input('id')
        ])->update([
            'content' => $request->input('content'),
            'last_updated_by' => Auth::user()->email
        ]);

        $responseData['record'] = $record;
        return $this->returnResponse('Updated successfully', $responseData);
    }


}




























