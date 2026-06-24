<?php

namespace App\Support;

use App\Models\MixPreparation;
use App\Models\Pesanan; 
use App\Models\ProdukLokasi;
use App\Models\ProdukLokasiPergerakan;
use Illuminate\Database\Eloquent\Model;

class ProdukStockMovement
{
    /**
     * Record a product stock movement and update produk_lokasi snapshot.
     *
     * @throws \RuntimeException when adjustment would make stock negative and $allowNegative is false
     */
    public static function record(
        int $lokasiId,
        int $produkId,
        int $delta,
        string $tipe,
        ?string $alasan = null,
        ?string $keterangan = null,
        ?Model $reference = null,
        bool $allowNegative = false,
        ?int $userId = null,
    ): ProdukLokasiPergerakan {
        $quantityBefore = ProdukLokasi::getQuantityAtLocation($lokasiId, $produkId);
        $quantityAfter = $quantityBefore + $delta;

        if (!$allowNegative && $quantityAfter < 0) {
            throw new \RuntimeException('Stok produk tidak mencukupi.');
        }

        ProdukLokasi::adjustQuantity($lokasiId, $produkId, $delta, $allowNegative);

        return ProdukLokasiPergerakan::create([
            'lokasi_id' => $lokasiId,
            'produk_id' => $produkId,
            'tipe' => $tipe,
            'quantity' => $delta,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'alasan' => $alasan,
            'reference_type' => $reference ? $reference->getMorphClass() : null,
            'reference_id' => $reference?->getKey(),
            'keterangan' => $keterangan,
            'user_id' => $userId,
            'tanggal' => now(),
        ]);
    }

    public static function recordMixPreparationOutput(
        int $lokasiId,
        int $produkId,
        int $quantity,
        MixPreparation $header,
        ?int $userId = null,
        ?string $userKeterangan = null,
    ): ProdukLokasiPergerakan {
        $suffix = ' (Mix Preparation #' . $header->no_mix_preparation . ')';
        $defaultText = 'Mix Preparation masuk';
        $keterangan = !empty($userKeterangan)
            ? $userKeterangan . $suffix
            : $defaultText . $suffix;

        return self::record(
            $lokasiId,
            $produkId,
            $quantity,
            ProdukLokasiPergerakan::TIPE_MASUK,
            keterangan: $keterangan,
            reference: $header,
            userId: $userId,
        );
    }

    public static function recordOrderDeduction(
        int $lokasiId,
        int $produkId,
        int $quantity,
        Pesanan $pesanan,
        ?int $userId = null,
        string $suffix = '',
    ): ProdukLokasiPergerakan {
        $keterangan = 'Penjualan pesanan #' . $pesanan->no_pesanan . $suffix;

        return self::record(
            $lokasiId,
            $produkId,
            -$quantity,
            ProdukLokasiPergerakan::TIPE_KELUAR,
            keterangan: $keterangan,
            reference: $pesanan,
            allowNegative: true,
            userId: $userId,
        );
    }

    public static function recordOrderReversal(
        int $lokasiId,
        int $produkId,
        int $quantity,
        Pesanan $pesanan,
        ?int $userId = null,
    ): ProdukLokasiPergerakan {
        $keterangan = 'Pembatalan/ubah pesanan #' . $pesanan->no_pesanan;

        return self::record(
            $lokasiId,
            $produkId,
            $quantity,
            ProdukLokasiPergerakan::TIPE_MASUK,
            keterangan: $keterangan,
            reference: $pesanan,
            userId: $userId,
        );
    }

    public static function recordAdjustment(
        int $lokasiId,
        int $produkId,
        int $quantity,
        string $alasan,
        string $keterangan,
        ?int $userId = null,
    ): ProdukLokasiPergerakan {
        return self::record(
            $lokasiId,
            $produkId,
            $quantity,
            ProdukLokasiPergerakan::TIPE_ADJUSTMENT,
            alasan: $alasan,
            keterangan: $keterangan,
            allowNegative: false,
            userId: $userId,
        );
    }
}
