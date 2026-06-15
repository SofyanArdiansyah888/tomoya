<?php

namespace App\Console\Commands;

use App\Models\ItemLokasi;
use App\Models\Pesanan;
use App\Models\Produk;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RepairPesananStock extends Command
{
    protected $signature = 'pesanan:repair-stock
                            {--order-id= : Perbaiki satu pesanan berdasarkan ID}
                            {--status= : Filter status pembayaran (bayar|belum_bayar), default: semua}
                            {--fix : Terapkan koreksi stok (default: dry-run / preview saja)}';

    protected $description = 'Deteksi dan perbaiki stok pesanan yang terpengaruh rollback tanpa potong ulang';

    public function handle(): int
    {
        $dryRun = !$this->option('fix');
        $orderId = $this->option('order-id');
        $statusFilter = $this->option('status');

        if ($dryRun) {
            $this->warn('Mode preview (dry-run). Tambahkan --fix untuk menerapkan koreksi.');
        } else {
            if (!$this->confirm('Yakin terapkan koreksi stok ke database?')) {
                $this->info('Dibatalkan.');
                return self::SUCCESS;
            }
        }

        $query = Pesanan::with(['itemPesanan.produk.resep.recipeMaterials.material'])
            ->whereHas('itemPesanan');

        if ($orderId) {
            $query->where('id', $orderId);
        }

        if ($statusFilter) {
            $query->where('payment_status', $statusFilter);
        } 

        $orders = $query->orderBy('id')->get();

        if ($orders->isEmpty()) {
            $this->info('Tidak ada pesanan yang cocok dengan filter.');
            return self::SUCCESS;
        }

        $affectedCount = 0;
        $correctionCount = 0;

        foreach ($orders as $pesanan) {
            $corrections = $this->buildCorrections($pesanan);

            if (empty($corrections)) {
                continue;
            }

            $affectedCount++;
            $hasRollback = ItemLokasi::where('reference_type', Pesanan::class)
                ->where('reference_id', $pesanan->id)
                ->where('keterangan', 'like', '%Rollback penjualan%')
                ->exists();

            $this->newLine();
            $this->line("Pesanan #{$pesanan->no_pesanan} (ID {$pesanan->id}, {$pesanan->payment_status})"
                . ($hasRollback ? ' [ada rollback]' : ''));

            foreach ($corrections as $correction) {
                $materialName = $correction['material_name'];
                $delta = $correction['delta'];
                $action = $delta < 0 ? 'KELUAR' : 'MASUK';
                $qty = abs($delta);

                $this->line(sprintf(
                    '  - Material %s (%d): %s %s (expected net: %s, actual net: %s)',
                    $materialName,
                    $correction['material_id'],
                    $action,
                    $qty,
                    $correction['expected'],
                    $correction['actual']
                ));

                if (!$dryRun) {
                    $this->applyCorrection($pesanan, $correction);
                }

                $correctionCount++;
            }
        }

        $this->newLine();
        if ($affectedCount === 0) {
            $this->info('Semua pesanan sudah konsisten. Tidak ada koreksi diperlukan.');
        } elseif ($dryRun) {
            $this->info("Preview selesai: {$affectedCount} pesanan terpengaruh, {$correctionCount} koreksi material.");
            $this->info('Jalankan: php artisan pesanan:repair-stock --fix');
        } else {
            $this->info("Selesai: {$affectedCount} pesanan diperbaiki, {$correctionCount} koreksi material dicatat.");
        }

        return self::SUCCESS;
    }

    /**
     * @return array<int, array{material_id:int, material_name:string, expected:float, actual:float, delta:float}>
     */
    private function buildCorrections(Pesanan $pesanan): array
    {
        $expectedByMaterial = $this->computeExpectedNet($pesanan);
        $actualByMaterial = $this->computeActualNet($pesanan);

        $materialIds = array_unique(array_merge(
            array_keys($expectedByMaterial),
            array_keys($actualByMaterial)
        ));

        $corrections = [];

        foreach ($materialIds as $materialId) {
            $expected = (float) ($expectedByMaterial[$materialId] ?? 0);
            $actual = (float) ($actualByMaterial[$materialId] ?? 0);
            $delta = $expected - $actual;

            if (abs($delta) < 0.0001) {
                continue;
            }

            $materialName = ItemLokasi::where('material_id', $materialId)
                ->with('material')
                ->first()
                ?->material
                ?->name ?? 'Material #' . $materialId;

            $corrections[] = [
                'material_id' => (int) $materialId,
                'material_name' => $materialName,
                'expected' => $expected,
                'actual' => $actual,
                'delta' => $delta,
            ];
        }

        return $corrections;
    }

    /**
     * Net stok yang seharusnya (negatif = sudah terpakai penjualan).
     *
     * @return array<int, float>
     */
    private function computeExpectedNet(Pesanan $pesanan): array
    {
        $expected = [];

        foreach ($pesanan->itemPesanan as $item) {
            $produk = $item->produk ?? Produk::with(['resep.recipeMaterials.material'])->find($item->produk_id);

            if (!$produk || !$produk->stockable || !$produk->resep || !$produk->resep->recipeMaterials) {
                continue;
            }

            foreach ($produk->resep->recipeMaterials as $recipeMaterial) {
                if (!$recipeMaterial || !$recipeMaterial->material_id) {
                    continue;
                }

                $materialId = (int) $recipeMaterial->material_id;
                $totalOut = (float) $recipeMaterial->quantity * (int) $item->quantity;

                if (!isset($expected[$materialId])) {
                    $expected[$materialId] = 0;
                }

                $expected[$materialId] -= $totalOut;
            }
        }

        return $expected;
    }

    /**
     * Net stok aktual dari riwayat item_lokasi pesanan.
     *
     * @return array<int, float>
     */
    private function computeActualNet(Pesanan $pesanan): array
    {
        $rows = ItemLokasi::where('reference_type', Pesanan::class)
            ->where('reference_id', $pesanan->id)
            ->selectRaw('material_id, SUM(quantity) as net_quantity')
            ->groupBy('material_id')
            ->get();

        $actual = [];

        foreach ($rows as $row) {
            $actual[(int) $row->material_id] = (float) $row->net_quantity;
        }

        return $actual;
    }

    private function applyCorrection(Pesanan $pesanan, array $correction): void
    {
        DB::transaction(function () use ($pesanan, $correction) {
            $materialId = $correction['material_id'];
            $delta = (float) $correction['delta'];
            $currentStock = ItemLokasi::getCurrentStock($pesanan->lokasi_id, $materialId) ?? 0;
            $quantityAfter = $currentStock + $delta;
            $isKeluar = $delta < 0;

            ItemLokasi::create([
                'lokasi_id' => $pesanan->lokasi_id,
                'material_id' => $materialId,
                'tipe' => $isKeluar ? 'keluar' : 'masuk',
                'quantity' => (int) $delta,
                'quantity_before' => $currentStock,
                'quantity_after' => (int) $quantityAfter,
                'reference_type' => Pesanan::class,
                'reference_id' => $pesanan->id,
                'keterangan' => "Koreksi stok penjualan (Pesanan #{$pesanan->no_pesanan} - Repair data)",
                'user_id' => $pesanan->user_id ?? 1,
                'tanggal' => now(),
            ]);
        });
    }
}
