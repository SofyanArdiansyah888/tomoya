<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('item_lokasi')) {
            // Drop existing table and recreate with new structure
            Schema::dropIfExists('item_lokasi');
        }

        Schema::create('item_lokasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('material_id')->constrained('material')->onDelete('cascade');
            
            // Movement data
            $table->enum('tipe', ['masuk', 'keluar', 'transfer', 'adjustment'])->default('masuk');
            $table->integer('quantity'); // Positive untuk masuk, negative untuk keluar
            $table->integer('quantity_before')->default(0); // Stok sebelum movement
            $table->integer('quantity_after')->default(0); // Stok setelah movement
            
            // Reference to transaction
            $table->string('reference_type')->nullable(); // e.g., 'App\Models\Pembelian'
            $table->unsignedBigInteger('reference_id')->nullable(); // ID dari transaksi
            
            // Additional info
            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('tanggal')->useCurrent();
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['lokasi_id', 'material_id']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('tanggal');
            $table->index('tipe');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_lokasi');
    }
};

