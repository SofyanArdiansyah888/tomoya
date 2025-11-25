<?php

namespace App\Exceptions;

class StockTransferException extends ApiException
{
    public function __construct($message = 'Transfer stok gagal')
    {
        parent::__construct($message, 400);
    }
}
