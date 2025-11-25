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
        Schema::create('arus_kas', function (Blueprint $table) {
            $table->id();
            $table->string('no_arus_kas', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('lokasi_id');
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->enum('jenis', ['pemasukan', 'pengeluaran']);
            $table->enum('kategori', [
                'pemasukan_kasir', 'pemasukan_non_kasir', 'lainnya',
                'pengeluaran_operasional', 'pengeluaran_lainnya', 'pembelian_bahan_baku'
            ]);
            $table->enum('sub_kategori', [
                'penjualan_kasir', 'investasi', 'hibah', 'refund_penjualan', 'lainnya',
                'gaji_karyawan', 'listrik_air', 'sewa_tempat', 'pemeliharaan',
                'pembelian_bahan'
            ])->nullable();
            $table->decimal('jumlah', 15, 2);
            $table->text('deskripsi');
            $table->date('tanggal');
            $table->unsignedBigInteger('referensi_id')->nullable();
            $table->string('referensi_type', 50)->nullable();
            $table->enum('metode_pembayaran', ['cash', 'transfer', 'qris', 'kredit','debit'])->default('cash');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');
            $table->timestamps();
            
            $table->index(['tanggal']);
            $table->index(['jenis']);
            $table->index(['kategori']);
            $table->index(['lokasi_id']);
            $table->index(['shift_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arus_kas');
    }
};
