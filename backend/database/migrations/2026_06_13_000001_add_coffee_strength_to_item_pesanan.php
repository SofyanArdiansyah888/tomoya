<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kolom hpp dulu dibuat oleh 2025_12_09_000001 yang sempat dikomentari;
        // pastikan ada supaya ->after('hpp') tidak gagal di MySQL.
        if (!Schema::hasColumn('item_pesanan', 'hpp')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->decimal('hpp', 12, 2)->default(0)->after('harga');
            });
        }

        if (!Schema::hasColumn('item_pesanan', 'coffee_strength')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->string('coffee_strength', 20)->nullable()->after('hpp');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('item_pesanan', 'coffee_strength')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->dropColumn('coffee_strength');
            });
        }
    }
};
