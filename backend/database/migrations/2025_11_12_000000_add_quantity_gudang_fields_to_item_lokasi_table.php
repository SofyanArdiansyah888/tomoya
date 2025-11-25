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
        Schema::table('item_lokasi', function (Blueprint $table) {
            $table->integer('quantity_gudang')->nullable()->after('quantity_after');
            $table->integer('quantity_gudang_before')->nullable()->after('quantity_gudang');
            $table->integer('quantity_gudang_after')->nullable()->after('quantity_gudang_before');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_lokasi', function (Blueprint $table) {
            $table->dropColumn(['quantity_gudang', 'quantity_gudang_before', 'quantity_gudang_after']);
        });
    }
};

