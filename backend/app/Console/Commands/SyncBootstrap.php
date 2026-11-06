<?php

namespace App\Console\Commands;

use App\Modules\Sync\SyncApplier;
use App\Modules\Sync\SyncClient;
use App\Modules\Sync\SyncService;
use App\Support\SyncNode;
use Illuminate\Console\Command;

class SyncBootstrap extends Command
{
    protected $signature = 'sync:bootstrap
        {--push : Salin SELURUH data PC kasir ke cloud yang masih kosong (setup awal)}
        {--force : Lewati pengecekan database kosong}';

    protected $description = 'Salin seluruh data dari cloud ke PC kasir (default) atau dari PC kasir ke cloud (--push)';

    public function handle(SyncClient $client, SyncService $service): int
    {
        if (!SyncNode::isClient()) {
            $this->error('Jalankan perintah ini di PC kasir (SYNC_ROLE=client).');

            return self::FAILURE;
        }

        $client->onOutput(fn (string $line) => $this->line($line));
        $force = (bool) $this->option('force');

        try {
            if ($this->option('push')) {
                $this->warn('Mengirim SELURUH data PC kasir ke cloud. Database cloud harus kosong (migrate:fresh tanpa seed).');
                if (!$force && !$this->confirm('Lanjutkan?', true)) {
                    return self::FAILURE;
                }
                $client->push(SyncApplier::MODE_BOOTSTRAP, $force);
                $this->info('Bootstrap push selesai. Jalankan "php artisan sync:run" untuk memastikan semuanya tersinkron.');

                return self::SUCCESS;
            }

            if (!$force && !$service->isEmptyForBootstrap()) {
                $this->error('Database lokal tidak kosong. Gunakan database baru (php artisan migrate:fresh) atau --force.');

                return self::FAILURE;
            }

            $this->info('Mengambil seluruh data dari cloud...');
            $client->pull(SyncApplier::MODE_BOOTSTRAP);
            $this->info('Bootstrap selesai. PC kasir siap dipakai; sinkron otomatis akan berjalan setiap menit.');
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
