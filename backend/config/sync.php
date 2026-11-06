<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sinkronisasi Lokal (PC kasir) <-> Cloud
    |--------------------------------------------------------------------------
    |
    | node_code : kode instance ini. "L" = PC kasir lokal, "C" = cloud.
    |             Dipakai sebagai prefix nomor dokumen (PSN-C-...) dan penanda
    |             asal data (kolom `origin`).
    | role      : "client" = instance yang memulai sinkron (PC kasir),
    |             "server" = instance yang menerima (cloud).
    | enabled   : matikan untuk menonaktifkan penjadwalan sinkron otomatis.
    */

    'enabled' => (bool) env('SYNC_ENABLED', false),

    'node_code' => strtoupper((string) env('SYNC_NODE_CODE', 'L')),

    'role' => env('SYNC_ROLE', 'client'),

    'remote_url' => rtrim((string) env('SYNC_REMOTE_URL', ''), '/'),

    'token' => env('SYNC_TOKEN'),

    // Jumlah baris per batch saat push/pull.
    'batch_size' => (int) env('SYNC_BATCH_SIZE', 200),

    // Batas selisih jam antara client dan server (detik).
    'max_clock_skew' => (int) env('SYNC_MAX_CLOCK_SKEW', 120),

    // Baris yang baru diubah < N detik ditunda ke putaran berikutnya
    // supaya transaksi DB yang belum commit tidak terlewat.
    'settle_seconds' => (int) env('SYNC_SETTLE_SECONDS', 5),

    // Timeout HTTP (detik).
    'http_timeout' => (int) env('SYNC_HTTP_TIMEOUT', 30),

    // Cloud menampilkan peringatan jika client tidak sync lebih dari N menit.
    'offline_alert_minutes' => (int) env('SYNC_OFFLINE_ALERT_MINUTES', 5),

    // Izinkan menjalankan migration di instance ini lewat endpoint sync (untuk hosting tanpa SSH).
    // Aktifkan sementara saja, lalu set false lagi.
    'allow_maintenance' => (bool) env('SYNC_ALLOW_MAINTENANCE', false),

    // Backup database harian (hanya MySQL).
    'backup' => [
        'enabled' => (bool) env('SYNC_BACKUP_ENABLED', true),
        'mysqldump_path' => env('SYNC_MYSQLDUMP_PATH', 'mysqldump'),
        'keep_days' => (int) env('SYNC_BACKUP_KEEP_DAYS', 14),
        'path' => env('SYNC_BACKUP_PATH', storage_path('app/backups')),
    ],
];
