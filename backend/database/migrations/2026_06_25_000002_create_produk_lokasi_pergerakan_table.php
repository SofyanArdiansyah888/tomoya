<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('produk_lokasi_pergerakan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');

            $table->enum('tipe', ['masuk', 'keluar', 'adjustment']);
            $table->integer('quantity');
            $table->integer('quantity_before')->default(0);
            $table->integer('quantity_after')->default(0);

            $table->enum('alasan', ['rusak', 'konsumsi_owner', 'koreksi', 'lainnya'])->nullable();

            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal')->useCurrent();
            $table->timestamps();

            $table->index(['lokasi_id', 'produk_id']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('tanggal');
            $table->index('tipe');
            $table->index('alasan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk_lokasi_pergerakan');
    }
};
