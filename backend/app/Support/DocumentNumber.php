<?php

namespace App\Support;

class DocumentNumber
{
    /**
     * Nomor harian berurutan, contoh: PSN-20261106-0001 (lokal) atau PSN-C-20261106-0001 (cloud).
     * Urutan dihitung hanya dari nomor milik node ini, sehingga tidak bentrok
     * dengan data hasil sinkron dari node lain.
     *
     * @param class-string<\Illuminate\Database\Eloquent\Model> $modelClass
     */
    public static function daily(string $modelClass, string $column, string $prefix): string
    {
        $base = $prefix . '-' . SyncNode::numberSegment() . now()->format('Ymd') . '-';

        $last = $modelClass::query()
            ->where($column, 'like', $base . '%')
            ->orderByRaw('LENGTH(' . $column . ') DESC')
            ->orderBy($column, 'desc')
            ->value($column);

        $sequence = $last ? ((int) substr($last, strlen($base))) + 1 : 1;

        return $base . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Kode berurutan tanpa tanggal, contoh: SUP0001 (lokal) atau SUPC0001 (cloud).
     *
     * @param class-string<\Illuminate\Database\Eloquent\Model> $modelClass
     */
    public static function sequential(string $modelClass, string $column, string $prefix): string
    {
        $base = $prefix . str_replace('-', '', SyncNode::numberSegment());

        $max = $modelClass::query()
            ->where($column, 'like', $base . '%')
            ->pluck($column)
            ->map(fn ($kode) => substr((string) $kode, strlen($base)))
            ->filter(fn ($rest) => $rest !== '' && ctype_digit($rest))
            ->map(fn ($rest) => (int) $rest)
            ->max();

        return $base . str_pad((string) (($max ?? 0) + 1), 4, '0', STR_PAD_LEFT);
    }
}
