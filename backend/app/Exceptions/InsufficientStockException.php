<?php

namespace App\Exceptions;

class InsufficientStockException extends ApiException
{
    public function __construct($message = 'Stok tidak mencukupi')
    {
        parent::__construct($message, 400);
    }
}
