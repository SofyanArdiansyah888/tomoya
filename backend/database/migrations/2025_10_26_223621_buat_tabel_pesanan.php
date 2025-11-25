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
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('no_pesanan', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('lokasi_id');
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->decimal('total_jumlah', 10, 2);
            $table->enum('payment_status', ['bayar', 'belum_bayar'])->default('belum_bayar');
            $table->enum('metode_pembayaran', ['cash', 'card', 'qris', 'other'])->default('cash');
            $table->timestamp('tanggal_penjualan')->nullable();
            $table->text('alamat_pengiriman');
            $table->text('catatan')->nullable();
            $table->string('nama_client')->nullable();
            $table->string('gambar_qris')->nullable();
            $table->timestamps();
            
            $table->index(['shift_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
