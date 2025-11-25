<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE item_lokasi MODIFY COLUMN tipe ENUM('masuk','keluar','transfer','adjustment','mix_preparation') DEFAULT 'masuk'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE item_lokasi MODIFY COLUMN tipe ENUM('masuk','keluar','transfer','adjustment') DEFAULT 'masuk'");
    }
};