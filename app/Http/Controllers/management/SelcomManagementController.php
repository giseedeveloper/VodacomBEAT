<?php

namespace App\Http\Controllers\management;

use App\Adapters\Selcom\SelcomTransactionsService;
use App\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SelcomManagementController extends BaseController
{

    public function __construct()
    {

    }


    public function getFloatBalance(Request $request): JsonResponse
    {
        $selcomService = new SelcomTransactionsService();
        $results =  $selcomService->getFloatBalance();
        $responseData['balance'] = $results;
        return $this->returnResponse('Selcom balance', $responseData);

    }


}




























