<?php

namespace App\Exceptions;

class WarehouseNotFoundException extends ApiException
{
    public function __construct($message = 'Gudang tidak ditemukan')
    {
        parent::__construct($message, 404);
    }
}
