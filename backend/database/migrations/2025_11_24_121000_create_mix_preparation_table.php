<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mix_preparation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('output_material_id')->constrained('material')->onDelete('cascade');
            $table->integer('output_quantity');
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal')->useCurrent();
            $table->timestamps();
            $table->index(['lokasi_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mix_preparation');
    }
};