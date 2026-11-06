<?php

namespace App\Console\Commands;

use App\Modules\Sync\SyncApplier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class StockRecalculate extends Command
{
    protected $signature = 'stock:recalculate {--fix : Simpan hasil perhitungan (default hanya laporan)}';

    protected $description = 'Hitung ulang saldo stok dari seluruh riwayat pergerakan (pengaman setelah sinkron)';

    public function handle(): int
    {
        $fix = (bool) $this->option('fix');

        // Stok material: susun ulang rantai quantity_before/after per lokasi & material.
        $pairs = DB::table('item_lokasi')->select('lokasi_id', 'material_id')->distinct()->get();
        $materialChanged = 0;
        foreach ($pairs as $p) {
            foreach (['toko', 'gudang'] as $chain) {
                $materialChanged += SyncApplier::rethreadMaterialChain((int) $p->lokasi_id, (int) $p->material_id, $chain, null, !$fix);
            }
        }

        // Stok produk: saldo produk_lokasi dibanding jumlah pergerakan.
        $sums = DB::table('produk_lokasi_pergerakan')
            ->select('lokasi_id', 'produk_id', DB::raw('SUM(COALESCE(quantity_after, 0) - COALESCE(quantity_before, 0)) as total'))
            ->groupBy('lokasi_id', 'produk_id')
            ->get();

        $rows = [];
        foreach ($sums as $s) {
            $current = DB::table('produk_lokasi')
                ->where('lokasi_id', $s->lokasi_id)->where('produk_id', $s->produk_id)
                ->value('quantity');
            if ((int) $current !== (int) $s->total) {
                $rows[] = [$s->lokasi_id, $s->produk_id, (int) $current, (int) $s->total];
                if ($fix) {
                    \App\Models\ProdukLokasi::adjustQuantity((int) $s->lokasi_id, (int) $s->produk_id, (int) $s->total - (int) $current, true);
                }
            }
        }

        $this->info("Baris riwayat stok material yang " . ($fix ? 'diperbaiki' : 'perlu diperbaiki') . ": {$materialChanged}");

        if ($rows) {
            $this->warn('Saldo stok produk yang berbeda dari riwayat pergerakan:');
            $this->table(['lokasi_id', 'produk_id', 'saldo sekarang', 'menurut riwayat'], $rows);
            $this->line('Catatan: perbedaan bisa wajar jika saldo awal diinput tanpa pergerakan.');
        } else {
            $this->info('Saldo stok produk sesuai dengan riwayat pergerakan.');
        }

        if (!$fix && ($materialChanged || $rows)) {
            $this->line('Jalankan dengan --fix untuk menyimpan perbaikan.');
        }

        return self::SUCCESS;
    }
}
