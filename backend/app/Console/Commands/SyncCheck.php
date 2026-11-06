<?php

namespace App\Console\Commands;

use App\Modules\Sync\SyncRegistry;
use App\Support\SyncNode;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncCheck extends Command
{
    protected $signature = 'sync:check';

    protected $description = 'Periksa kesiapan database ini untuk sinkronisasi (tabel & kolom sync)';

    public function handle(): int
    {
        $this->info('Node: ' . SyncNode::code() . ' (' . SyncNode::label() . '), role: ' . config('sync.role')
            . ', database: ' . config('database.connections.' . config('database.default') . '.database'));

        $rows = [];
        $problems = 0;
        foreach (array_keys(SyncRegistry::tables()) as $table) {
            $exists = Schema::hasTable($table);
            $hasUuid = $exists && Schema::hasColumn($table, 'uuid');
            $hasSynced = $exists && Schema::hasColumn($table, 'synced_at');
            $missingUuid = $hasUuid ? DB::table($table)->whereNull('uuid')->count() : null;
            $ok = $exists && $hasUuid && $hasSynced && $missingUuid === 0;
            $problems += $ok ? 0 : 1;

            $rows[] = [
                $table,
                $exists ? 'ya' : 'TIDAK ADA',
                $hasUuid && $hasSynced ? 'ya' : ($exists ? 'BELUM' : '-'),
                $exists ? DB::table($table)->count() : '-',
                $ok ? 'OK' : 'MASALAH',
            ];
        }

        $this->table(['tabel', 'ada', 'kolom sync', 'baris', 'status'], $rows);

        if ($problems === 0) {
            $this->info('Semua tabel siap disinkronkan.');

            return self::SUCCESS;
        }

        $this->warn("{$problems} tabel bermasalah.");
        $this->line('- "kolom sync BELUM": jalankan php artisan migrate (migration ensure_sync_columns akan menambahkannya).');
        $this->line('- "TIDAK ADA": tabel hilang walau migration tercatat; kirim hasil ini ke developer.');

        return self::FAILURE;
    }
}
