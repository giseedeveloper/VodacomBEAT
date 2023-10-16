<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;


class BaseController extends Controller
{
    /**
     * success response method.
     * @param $message
     * @param $data
     * @return JsonResponse
     */
    public function returnResponse($message,$data): JsonResponse
    {
    	$response = [
             'success' => true,
             'message' => $message,
             'payload'    => $data,   ];
        return response()->json($response, 200);
    }

    /**
     * return error response.
     * @param $message
     * @param array $errorsArray
     * @param int $code
     * @return JsonResponse
     */
    public function returnError($message, array $errorsArray = [], int $code = 200): JsonResponse
    {
    	$response = [
            'success' => false,
            'message' => $message,
            'payload' => $errorsArray,
        ];

        return response()->json($response, $code);
    }

}


