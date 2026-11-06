<?php

namespace App\Modules\Sync;

use Illuminate\Support\Facades\DB;

/**
 * Penyimpanan key-value kecil untuk cursor & status sinkron.
 */
class SyncState
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = DB::table('sync_state')->where('key', $key)->value('value');

        return $value === null ? $default : json_decode($value, true);
    }

    public static function put(string $key, mixed $value): void
    {
        $now = now();
        $exists = DB::table('sync_state')->where('key', $key)->exists();

        if ($exists) {
            DB::table('sync_state')->where('key', $key)->update([
                'value' => json_encode($value),
                'updated_at' => $now,
            ]);

            return;
        }

        DB::table('sync_state')->insert([
            'key' => $key,
            'value' => json_encode($value),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public static function forget(string $prefix): void
    {
        DB::table('sync_state')->where('key', 'like', $prefix . '%')->delete();
    }

    public static function log(string $level, string $message, array $context = [], ?string $direction = null, ?string $table = null, ?string $uuid = null): void
    {
        try {
            DB::table('sync_logs')->insert([
                'level' => $level,
                'direction' => $direction,
                'table_name' => $table,
                'uuid' => $uuid,
                'message' => mb_substr($message, 0, 2000),
                'context' => $context ? json_encode($context) : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
