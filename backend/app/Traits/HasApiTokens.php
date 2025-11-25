<?php

namespace App\Traits;

use Laravel\Sanctum\HasApiTokens as SanctumHasApiTokens;

trait HasApiTokens
{
    use SanctumHasApiTokens;
}
