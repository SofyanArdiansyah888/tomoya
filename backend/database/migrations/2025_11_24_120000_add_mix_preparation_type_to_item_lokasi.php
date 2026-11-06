<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE item_lokasi MODIFY COLUMN tipe ENUM('masuk','keluar','transfer','adjustment','mix_preparation') DEFAULT 'masuk'");

            return;
        }

        // SQLite / lainnya (dipakai untuk testing lokal)
        Schema::table('item_lokasi', function (Blueprint $table) {
            $table->enum('tipe', ['masuk', 'keluar', 'transfer', 'adjustment', 'mix_preparation'])->default('masuk')->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE item_lokasi MODIFY COLUMN tipe ENUM('masuk','keluar','transfer','adjustment') DEFAULT 'masuk'");

            return;
        }

        Schema::table('item_lokasi', function (Blueprint $table) {
            $table->enum('tipe', ['masuk', 'keluar', 'transfer', 'adjustment'])->default('masuk')->change();
        });
    }
};
