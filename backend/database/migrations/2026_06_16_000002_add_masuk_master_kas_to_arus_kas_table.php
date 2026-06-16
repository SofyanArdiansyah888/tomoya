<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->boolean('masuk_master_kas')->default(false)->after('status');
            $table->index('masuk_master_kas');
        });
    }

    public function down(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->dropIndex(['masuk_master_kas']);
            $table->dropColumn('masuk_master_kas');
        });
    }
};
