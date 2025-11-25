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
        Schema::create('shift_kasir', function (Blueprint $table) {
            $table->id();
            $table->string('no_shift_kasir', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('lokasi_id');
            $table->decimal('saldo_awal', 15, 2);
            $table->decimal('saldo_akhir', 15, 2)->nullable();
            
            // Total penjualan per metode pembayaran
            $table->decimal('total_penjualan_cash', 15, 2)->default(0);
            $table->decimal('total_penjualan_card', 15, 2)->default(0);
            $table->decimal('total_penjualan_qris', 15, 2)->default(0);
            $table->decimal('total_penjualan_other', 15, 2)->default(0);
            $table->decimal('total_penjualan', 15, 2)->default(0);
            
            // Total transaksi lain
            $table->decimal('total_pembelian', 15, 2)->default(0);
            $table->decimal('total_pemasukan', 15, 2)->default(0);
            $table->decimal('total_pengeluaran', 15, 2)->default(0);
            $table->decimal('total_arus_kas', 15, 2)->default(0);
            
            $table->decimal('selisih', 15, 2)->nullable();
            $table->timestamp('tanggal_buka');
            $table->timestamp('tanggal_tutup')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->text('catatan')->nullable();
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['lokasi_id']);
            $table->index(['status']);
            $table->index(['tanggal_buka']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_kasir');
    }
};

