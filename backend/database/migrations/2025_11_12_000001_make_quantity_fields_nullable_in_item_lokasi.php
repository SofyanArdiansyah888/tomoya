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
            $table->integer('quantity')->nullable()->change();
            $table->integer('quantity_before')->nullable()->change();
            $table->integer('quantity_after')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_lokasi', function (Blueprint $table) {
            $table->integer('quantity')->default(0)->change();
            $table->integer('quantity_before')->default(0)->change();
            $table->integer('quantity_after')->default(0)->change();
        });
    }
};

