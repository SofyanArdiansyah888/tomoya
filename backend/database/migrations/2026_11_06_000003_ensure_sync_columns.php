<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Pengaman: tambahkan kolom sync (uuid, origin, synced_at) ke tabel yang
 * belum punya. Dibutuhkan untuk database yang tidak konsisten, misalnya tabel
 * dibuat/diimpor ulang setelah migration 2026_11_06_000001 dijalankan.
 * Aman dijalankan berulang kali; tabel yang sudah lengkap dilewati.
 */
return new class extends Migration
{
    private array $tables = [
        'users', 'lokasi', 'kategori', 'supplier', 'recipes', 'material', 'recipe_materials', 'produk',
        'shift_kasir', 'pesanan', 'item_pesanan', 'pembelian', 'item_pembelian', 'pemasukans',
        'pengeluaran', 'mix_preparation', 'master_kas', 'arus_kas', 'item_lokasi', 'produk_lokasi_pergerakan',
        'produk_lokasi',
    ];

    public function up(): void
    {
        $node = strtoupper((string) config('sync.node_code', 'L'));

        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            $hadUuid = Schema::hasColumn($tableName, 'uuid');

            Schema::table($tableName, function (Blueprint $table) use ($tableName, $hadUuid) {
                if (!$hadUuid) {
                    $table->char('uuid', 36)->nullable()->after('id');
                }
                if (!Schema::hasColumn($tableName, 'origin')) {
                    $table->string('origin', 4)->nullable();
                }
                if (!Schema::hasColumn($tableName, 'synced_at')) {
                    $table->timestamp('synced_at')->nullable();
                }
            });

            DB::table($tableName)->whereNull('updated_at')->update([
                'updated_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
            ]);
            DB::table($tableName)->whereNull('origin')->update(['origin' => $node]);
            DB::table($tableName)->whereNull('uuid')->select('id')->orderBy('id')
                ->chunkById(500, function ($rows) use ($tableName) {
                    foreach ($rows as $row) {
                        DB::table($tableName)->where('id', $row->id)->update(['uuid' => (string) Str::uuid()]);
                    }
                });

            if (!$hadUuid) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->unique('uuid', $tableName . '_uuid_unique');
                    $table->index('updated_at', $tableName . '_upd_sync_idx');
                });
            }
        }
    }

    public function down(): void
    {
        // Tidak dihapus: kolom dikelola oleh 2026_11_06_000001_add_sync_columns.
    }
};
