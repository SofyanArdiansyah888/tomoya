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
        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->string('kode')->unique();
            $table->text('deskripsi');
            $table->decimal('harga', 10, 2);
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained('supplier')->onDelete('set null');
            $table->integer('stok_quantity')->default(0);
            $table->string('gambar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('favorite')->nullable()->default(false);
            $table->boolean('stockable')->default(false);
            $table->unsignedBigInteger('resep_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
