<?php

namespace App\Support;

class SyncNode
{
    /** Kode node instance ini, misalnya "L" (lokal) atau "C" (cloud). */
    public static function code(): string
    {
        return (string) config('sync.node_code', 'L');
    }

    public static function isServer(): bool
    {
        return config('sync.role') === 'server';
    }

    public static function isClient(): bool
    {
        return config('sync.role') === 'client';
    }

    /**
     * Segmen nomor dokumen untuk node ini.
     * Node "L" memakai format lama (tanpa segmen), node lain menambah "<KODE>-".
     */
    public static function numberSegment(): string
    {
        return self::code() === 'L' ? '' : self::code() . '-';
    }

    public static function label(?string $code = null): string
    {
        $code = $code ?? self::code();

        return match ($code) {
            'L' => 'Kasir Lokal',
            'C' => 'Cloud',
            default => 'Node ' . $code,
        };
    }
}
