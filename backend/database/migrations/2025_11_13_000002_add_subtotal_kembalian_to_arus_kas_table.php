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
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->nullable()->after('jumlah');
            $table->decimal('uang_dibayar', 15, 2)->nullable()->after('subtotal');
            $table->decimal('kembalian', 15, 2)->nullable()->after('uang_dibayar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'uang_dibayar', 'kembalian']);
        });
    }
};

