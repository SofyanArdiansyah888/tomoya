<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mix_preparation', function (Blueprint $table) {
            $table->unsignedBigInteger('output_material_id')->nullable()->change();
            $table->foreignId('output_produk_id')->nullable()->after('output_material_id')
                ->constrained('produk')->onDelete('cascade');
            $table->enum('output_type', ['material', 'produk'])->default('material')->after('output_produk_id');
        });
    }

    public function down(): void
    {
        Schema::table('mix_preparation', function (Blueprint $table) {
            $table->dropForeign(['output_produk_id']);
            $table->dropColumn(['output_produk_id', 'output_type']);
            $table->unsignedBigInteger('output_material_id')->nullable(false)->change();
        });
    }
};
