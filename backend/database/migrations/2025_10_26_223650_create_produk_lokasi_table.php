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
        Schema::create('produk_lokasi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lokasi_id');
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('available_quantity')->default(0);
            $table->integer('min_stock_level')->nullable();
            $table->integer('max_stock_level')->nullable();
            $table->integer('reorder_point')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
            
            // Unique constraint untuk satu produk per lokasi
            $table->unique(['lokasi_id', 'produk_id']);
            
            // Indexes
            $table->index(['lokasi_id']);
            $table->index(['produk_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produk_lokasi');
    }
};

