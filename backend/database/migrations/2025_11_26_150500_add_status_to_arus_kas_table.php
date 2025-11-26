<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->boolean('status')->default(true)->after('metode_pembayaran');
            $table->index('status');
        });
    } 

    public function down(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};

