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
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->string('no_pengeluaran', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lokasi_id')->constrained('lokasi')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shift_kasir')->onDelete('set null');
            $table->string('kategori');
            $table->string('sub_kategori')->nullable();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->decimal('jumlah', 15, 2);
            $table->date('tanggal');
            $table->enum('metode_pembayaran', ['cash', 'transfer', 'kredit', 'debit', 'qris'])->default('cash');
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'paid', 'cancelled'])->default('draft');
            $table->string('referensi')->nullable();
            $table->string('bukti_pembayaran')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['shift_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
    }
};
