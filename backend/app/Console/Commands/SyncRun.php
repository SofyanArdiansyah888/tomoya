<?php

namespace App\Console\Commands;

use App\Modules\Sync\SyncClient;
use App\Support\SyncNode;
use Illuminate\Console\Command;

class SyncRun extends Command
{
    protected $signature = 'sync:run
        {--push-only : Hanya kirim perubahan lokal ke cloud}
        {--pull-only : Hanya ambil perubahan dari cloud}
        {--ping : Hanya cek koneksi & selisih jam}';

    protected $description = 'Sinkronkan data PC kasir dengan cloud (push lalu pull)';

    public function handle(SyncClient $client): int
    {
        if (!SyncNode::isClient()) {
            $this->error('Perintah ini hanya untuk instance dengan SYNC_ROLE=client (PC kasir).');

            return self::FAILURE;
        }

        $client->onOutput(fn (string $line) => $this->line($line));

        try {
            if ($this->option('ping')) {
                $ping = $client->ping();
                $this->info("Terhubung ke node {$ping['node']} ({$ping['role']}). Selisih jam: {$ping['skew_seconds']} detik.");

                return self::SUCCESS;
            }

            if ($this->option('push-only')) {
                $client->push();
            } elseif ($this->option('pull-only')) {
                $client->pull();
            } else {
                $client->run();
            }
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info('Sinkron selesai.');

        return self::SUCCESS;
    }
}
