<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 2025_12_09_000001_add_hpp_to_item_pesanan dikomentari, padahal
 * PesananController menyimpan kolom item_pesanan.hpp. Migration ini memastikan
 * kolom tersebut ada (aman untuk database yang sudah punya kolomnya).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('item_pesanan') && !Schema::hasColumn('item_pesanan', 'hpp')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->decimal('hpp', 12, 2)->default(0)->after('harga');
            });
        }
    }

    public function down(): void
    {
        // Tidak dihapus: kolom mungkin sudah ada sebelum migration ini.
    }
};
