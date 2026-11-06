<?php

namespace App\Support;

/**
 * Penanda bahwa penulisan data sedang dilakukan oleh proses sinkron
 * (bukan oleh pengguna), sehingga guard origin & tombstone dilewati.
 */
class SyncContext
{
    private static int $depth = 0;

    public static function applying(): bool
    {
        return self::$depth > 0;
    }

    /**
     * @template T
     * @param callable():T $callback
     * @return T
     */
    public static function run(callable $callback): mixed
    {
        self::$depth++;

        try {
            return $callback();
        } finally {
            self::$depth--;
        }
    }
}
