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
        Schema::create('pembelian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('supplier')->onDelete('cascade');
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shift_kasir')->onDelete('set null');
            $table->string('no_pembelian')->unique();
            $table->date('tanggal_pembelian');
            $table->decimal('total_harga', 15, 2)->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->enum('metode_pembayaran', ['cash', 'transfer', 'credit'])->default('cash');
            $table->text('catatan')->nullable();
            $table->timestamps();
            
            $table->index(['shift_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembelian');
    }
};

