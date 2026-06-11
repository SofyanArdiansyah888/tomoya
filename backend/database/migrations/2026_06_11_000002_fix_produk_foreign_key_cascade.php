<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->dropForeign(['produk_id']);
            $table->foreign('produk_id')
                ->references('id') 
                ->on('produk')
                ->onDelete('cascade');
        });

        Schema::table('produk_lokasi', function (Blueprint $table) {
            $table->dropForeign(['produk_id']);
            $table->foreign('produk_id')
                ->references('id')
                ->on('produk')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('item_pesanan', function (Blueprint $table) {
            $table->dropForeign(['produk_id']);
            $table->foreign('produk_id')
                ->references('id')
                ->on('produk')
                ->onDelete('restrict');
        });

        Schema::table('produk_lokasi', function (Blueprint $table) {
            $table->dropForeign(['produk_id']);
            $table->foreign('produk_id')
                ->references('id')
                ->on('produk')
                ->onDelete('restrict');
        });
    }
};
