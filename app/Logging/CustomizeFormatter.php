<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;
use Illuminate\Http\Request;

class CustomizeFormatter
{


    /**
     * The current HTTP request instance.
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

    /**
     * Create a new instance.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }


    /**
     * Customize the given logger instance.
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                " %level_name% [%datetime%] [". $this->request->ip()."] [%context.request-id%] %message% %extra.ip% \n",
                'Y-m-d H:i:s'
            ));
        }
    }

}
