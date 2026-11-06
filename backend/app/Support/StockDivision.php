<?php

namespace App\Support;

class StockDivision 
{
    public const PASTRY = 'pastry';
    public const MINUMAN = 'minuman';

    /** @var list<string> */
    public const PASTRY_CATEGORY_NAMES = ['pastry', 'cake', 'dessert'];

    public const MINUMAN_CATEGORY_NAME = 'minuman';

    public static function isPastryCategoryName(?string $name): bool
    {
        if ($name === null || $name === '') {
            return false;
        }

        return in_array(strtolower(trim($name)), self::PASTRY_CATEGORY_NAMES, true);
    }

    public static function isMinumanCategoryName(?string $name): bool
    { 
        if ($name === null || $name === '') {
            return false;
        }

        return strtolower(trim($name)) === self::MINUMAN_CATEGORY_NAME;
    }

    public static function isValidDivision(?string $division): bool
    {
        return in_array($division, [self::PASTRY, self::MINUMAN], true);
    }
 
    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    public static function pastryCategoryIds()
    {
        return \App\Models\Kategori::query()
            ->where(function ($q) {
                foreach (self::PASTRY_CATEGORY_NAMES as $name) {
                    $q->orWhereRaw('LOWER(TRIM(nama)) = ?', [strtolower($name)]);
                }
            })
            ->pluck('id');
    }
}
