<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /** Tabel yang disinkronkan (lihat App\Modules\Sync\SyncRegistry). */
    private array $tables = [
        'users', 'lokasi', 'kategori', 'supplier', 'recipes', 'material', 'recipe_materials', 'produk',
        'shift_kasir', 'pesanan', 'item_pesanan', 'pembelian', 'item_pembelian', 'pemasukans',
        'pengeluaran', 'mix_preparation', 'master_kas', 'arus_kas', 'item_lokasi', 'produk_lokasi_pergerakan',
        // Tidak disinkronkan rutin, hanya disalin saat bootstrap (saldo stok produk).
        'produk_lokasi',
    ];

    public function up(): void
    {
        $node = strtoupper((string) config('sync.node_code', 'L'));

        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'uuid')) {
                    $table->char('uuid', 36)->nullable()->after('id');
                }
                if (!Schema::hasColumn($tableName, 'origin')) {
                    $table->string('origin', 4)->nullable();
                }
                if (!Schema::hasColumn($tableName, 'synced_at')) {
                    // Diisi = updated_at saat baris ditulis oleh proses sinkron,
                    // sehingga baris tersebut tidak dikirim balik (anti-loop).
                    $table->timestamp('synced_at')->nullable();
                }
            });

            // Backfill data lama.
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

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->unique('uuid', $tableName . '_uuid_unique');
                $table->index('updated_at', $tableName . '_upd_sync_idx');
            });
        }

        Schema::create('sync_tombstones', function (Blueprint $table) {
            $table->id();
            $table->string('table_name', 64);
            $table->char('uuid', 36);
            $table->string('origin', 4);
            // true jika tombstone diterima dari node lain (tidak dikirim balik).
            $table->boolean('received')->default(false);
            $table->timestamp('deleted_at')->useCurrent();
            $table->index(['received', 'id']);
            $table->index(['table_name', 'uuid']);
        });

        Schema::create('sync_state', function (Blueprint $table) {
            $table->id();
            $table->string('key', 191)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('level', 16)->default('info'); // info, warning, error, conflict
            $table->string('direction', 16)->nullable(); // push, pull, receive, bootstrap
            $table->string('table_name', 64)->nullable();
            $table->char('uuid', 36)->nullable();
            $table->text('message');
            $table->longText('context')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['level', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
        Schema::dropIfExists('sync_state');
        Schema::dropIfExists('sync_tombstones');

        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName) || !Schema::hasColumn($tableName, 'uuid')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropUnique($tableName . '_uuid_unique');
                $table->dropIndex($tableName . '_upd_sync_idx');
            });
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['uuid', 'origin', 'synced_at']);
            });
        }
    }
};
