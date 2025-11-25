<?php

namespace App\Exceptions;

class ShopNotFoundException extends ApiException
{
    public function __construct($message = 'Toko tidak ditemukan')
    {
        parent::__construct($message, 404);
    }
}
