<?php

namespace App\Console\Commands;

use App\Modules\Sync\SyncClient;
use Illuminate\Console\Command;

class SyncRemote extends Command
{
    protected $signature = 'sync:remote
        {action=status : status | migrate | migrate-fresh}';

    protected $description = 'Jalankan migration di server cloud dari PC kasir (untuk hosting tanpa SSH). Butuh SYNC_ALLOW_MAINTENANCE=true di .env cloud.';

    public function handle(SyncClient $client): int
    {
        $action = str_replace('-', '_', (string) $this->argument('action'));
        if (!in_array($action, ['status', 'migrate', 'migrate_fresh'], true)) {
            $this->error('Aksi harus: status, migrate, atau migrate-fresh');

            return self::FAILURE;
        }

        $confirm = null;
        if ($action === 'migrate_fresh') {
            $this->warn('migrate-fresh akan MENGHAPUS SEMUA DATA di database cloud.');
            $confirm = $this->ask('Ketik "HAPUS SEMUA DATA" untuk melanjutkan');
            if ($confirm !== 'HAPUS SEMUA DATA') {
                $this->info('Dibatalkan.');

                return self::FAILURE;
            }
        }

        try {
            $result = $client->remoteMaintenance($action, $confirm);
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->line(trim((string) ($result['output'] ?? '')));
        $this->info("Selesai (exit {$result['exit_code']}). Jangan lupa set SYNC_ALLOW_MAINTENANCE=false lagi di cloud.");

        return self::SUCCESS;
    }
}
