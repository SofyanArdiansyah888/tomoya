<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Sinkronisasi PC kasir <-> cloud
|--------------------------------------------------------------------------
| Di PC kasir jalankan terus-menerus: php artisan schedule:work
| (lihat deploy/sync-scheduler.bat untuk auto-start di Windows).
*/
if (config('sync.enabled') && config('sync.role') === 'client') {
    Schedule::command('sync:run')
        ->everyMinute()
        ->withoutOverlapping(10)
        ->runInBackground();
}

if (config('sync.backup.enabled') && config('sync.role') === 'client') {
    Schedule::command('backup:database')->dailyAt('23:30');
}
