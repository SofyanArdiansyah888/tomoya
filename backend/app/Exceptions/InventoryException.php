<?php

namespace App\Exceptions;

class InventoryException extends ApiException
{
    public function __construct($message = 'Error inventori')
    {
        parent::__construct($message, 400);
    }
}
