<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database';

    protected $description = 'Backup database MySQL ke folder lokal (mysqldump), simpan N hari terakhir';

    public function handle(): int
    {
        $connection = config('database.default');
        $db = config("database.connections.{$connection}");

        if (($db['driver'] ?? null) !== 'mysql') {
            $this->warn('Backup otomatis hanya untuk MySQL. Dilewati.');

            return self::SUCCESS;
        }

        $dir = config('sync.backup.path');
        File::ensureDirectoryExists($dir);

        $file = $dir . DIRECTORY_SEPARATOR . $db['database'] . '-' . now()->format('Ymd-His') . '.sql';

        $process = new Process([
            config('sync.backup.mysqldump_path', 'mysqldump'),
            '--host=' . $db['host'],
            '--port=' . $db['port'],
            '--user=' . $db['username'],
            '--single-transaction',
            '--quick',
            '--routines',
            '--result-file=' . $file,
            $db['database'],
        ], null, ['MYSQL_PWD' => (string) $db['password']], null, 600);

        $process->run();

        if (!$process->isSuccessful()) {
            $this->error('Backup gagal: ' . trim($process->getErrorOutput()));
            \App\Modules\Sync\SyncState::log('error', 'Backup database gagal: ' . trim($process->getErrorOutput()), [], 'backup');

            return self::FAILURE;
        }

        // Hapus backup lama.
        $keepUntil = now()->subDays((int) config('sync.backup.keep_days', 14))->getTimestamp();
        foreach (File::files($dir) as $f) {
            if ($f->getExtension() === 'sql' && $f->getMTime() < $keepUntil) {
                File::delete($f->getPathname());
            }
        }

        $this->info('Backup tersimpan: ' . $file);

        return self::SUCCESS;
    }
}
