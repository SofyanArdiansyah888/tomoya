<?php

namespace App\Exceptions;

class ProductNotFoundException extends ApiException
{
    public function __construct($message = 'Produk tidak ditemukan')
    {
        parent::__construct($message, 404);
    }
}
