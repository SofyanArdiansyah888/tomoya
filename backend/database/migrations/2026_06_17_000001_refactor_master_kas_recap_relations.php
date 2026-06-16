<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{ 
    public function up(): void
    {
        Schema::table('master_kas', function (Blueprint $table) {
            $table->boolean('is_recap')->default(false)->after('status');
        });

        Schema::table('master_kas', function (Blueprint $table) {
            $table->dropForeign(['arus_kas_id']);
            $table->dropUnique(['arus_kas_id']);
            $table->dropColumn('arus_kas_id');
        });

        Schema::table('arus_kas', function (Blueprint $table) {
            $table->unsignedBigInteger('master_kas_id')->nullable()->after('masuk_master_kas');
            $table->foreign('master_kas_id')->references('id')->on('master_kas')->onDelete('set null');
            $table->index('master_kas_id');
        });
    }

    public function down(): void
    {
        Schema::table('arus_kas', function (Blueprint $table) {
            $table->dropForeign(['master_kas_id']);
            $table->dropIndex(['master_kas_id']);
            $table->dropColumn('master_kas_id');
        });

        Schema::table('master_kas', function (Blueprint $table) {
            $table->unsignedBigInteger('arus_kas_id')->nullable()->unique()->after('status');
            $table->foreign('arus_kas_id')->references('id')->on('arus_kas')->onDelete('cascade');
            $table->dropColumn('is_recap');
        });
    }
};
