<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('material', function (Blueprint $table) {
            $table->string('unit_gudang')->after('unit');
            $table->integer('min_stok_gudang')->default(0)->after('min_stock');
            $table->decimal('nilai_konversi', 10, 2)->after('min_stok_gudang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('material', function (Blueprint $table) {
            $table->dropColumn(['unit_gudang', 'min_stok_gudang', 'nilai_konversi']);
        });
    }
};

