<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('item_pesanan', 'hpp')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->decimal('hpp', 12, 2)->default(0)->after('harga');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('item_pesanan', 'hpp')) {
            Schema::table('item_pesanan', function (Blueprint $table) {
                $table->dropColumn('hpp');
            });
        }
    }
};
