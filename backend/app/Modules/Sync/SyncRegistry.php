<?php

namespace App\Modules\Sync;

/**
 * Daftar tabel yang disinkronkan, urut sesuai dependensi foreign key.
 *
 * kind:
 *  - master      : boleh diubah di kedua node, konflik diselesaikan "perubahan terakhir menang".
 *  - transaction : hanya boleh diubah/dihapus di node asal (`origin`), node lain read-only.
 *  - ledger      : pergerakan stok, append-only. Saat diterima, saldo stok lokal disesuaikan.
 */
class SyncRegistry
{
    public const KIND_MASTER = 'master';
    public const KIND_TRANSACTION = 'transaction';
    public const KIND_LEDGER = 'ledger';

    /**
     * @return array<string, array{kind:string, fks:array<string,string>, morph?:array{0:string,1:string}}>
     */
    public static function tables(): array
    {
        return [
            'users' => ['kind' => self::KIND_MASTER, 'fks' => []],
            'lokasi' => ['kind' => self::KIND_MASTER, 'fks' => []],
            'kategori' => ['kind' => self::KIND_MASTER, 'fks' => []],
            'supplier' => ['kind' => self::KIND_MASTER, 'fks' => []],
            'recipes' => ['kind' => self::KIND_MASTER, 'fks' => []],
            'material' => ['kind' => self::KIND_MASTER, 'fks' => [
                'category_id' => 'kategori',
                'supplier_id' => 'supplier',
            ]],
            'recipe_materials' => ['kind' => self::KIND_MASTER, 'fks' => [
                'recipe_id' => 'recipes',
                'material_id' => 'material',
            ]],
            'produk' => ['kind' => self::KIND_MASTER, 'fks' => [
                'kategori_id' => 'kategori',
                'supplier_id' => 'supplier',
                'resep_id' => 'recipes',
            ]],
            'shift_kasir' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
            ]],
            'pesanan' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
            ]],
            'item_pesanan' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'pesanan_id' => 'pesanan',
                'produk_id' => 'produk',
            ]],
            'pembelian' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'user_id' => 'users',
                'supplier_id' => 'supplier',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
            ]],
            'item_pembelian' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'pembelian_id' => 'pembelian',
                'material_id' => 'material',
            ]],
            'pemasukans' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
            ]],
            'pengeluaran' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
            ]],
            'mix_preparation' => ['kind' => self::KIND_TRANSACTION, 'fks' => [
                'lokasi_id' => 'lokasi',
                'output_material_id' => 'material',
                'output_produk_id' => 'produk',
                'created_by' => 'users',
            ]],
            // Master kas & arus kas boleh diubah dari kedua sisi (mis. rekap arus kas ke master kas).
            'master_kas' => ['kind' => self::KIND_MASTER, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
            ], 'morph' => ['referensi_type', 'referensi_id']],
            'arus_kas' => ['kind' => self::KIND_MASTER, 'fks' => [
                'user_id' => 'users',
                'lokasi_id' => 'lokasi',
                'shift_id' => 'shift_kasir',
                'master_kas_id' => 'master_kas',
            ], 'morph' => ['referensi_type', 'referensi_id']],
            'item_lokasi' => ['kind' => self::KIND_LEDGER, 'fks' => [
                'lokasi_id' => 'lokasi',
                'material_id' => 'material',
                'user_id' => 'users',
            ], 'morph' => ['reference_type', 'reference_id']],
            'produk_lokasi_pergerakan' => ['kind' => self::KIND_LEDGER, 'fks' => [
                'lokasi_id' => 'lokasi',
                'produk_id' => 'produk',
                'user_id' => 'users',
            ], 'morph' => ['reference_type', 'reference_id']],
        ];
    }

    /** Tabel snapshot yang hanya disalin saat bootstrap (saldo stok produk). */
    public static function bootstrapSnapshots(): array
    {
        return [
            'produk_lokasi' => ['kind' => 'snapshot', 'fks' => [
                'lokasi_id' => 'lokasi',
                'produk_id' => 'produk',
            ]],
        ];
    }

    public static function has(string $table): bool
    {
        return array_key_exists($table, self::tables()) || array_key_exists($table, self::bootstrapSnapshots());
    }

    public static function get(string $table): array
    {
        return self::tables()[$table]
            ?? self::bootstrapSnapshots()[$table]
            ?? throw new \InvalidArgumentException("Tabel {$table} tidak disinkronkan.");
    }

    public static function names(): array
    {
        return array_keys(self::tables());
    }

    /**
     * Petakan nilai kolom morph (mis. "Pesanan" atau "App\Models\Pesanan") ke nama tabel tersinkron.
     */
    public static function morphTable(?string $type): ?string
    {
        if (!$type) {
            return null;
        }

        return match (class_basename($type)) {
            'Pesanan' => 'pesanan',
            'Pembelian' => 'pembelian',
            'Pemasukan' => 'pemasukans',
            'Pengeluaran' => 'pengeluaran',
            'ShiftKasir' => 'shift_kasir',
            'MixPreparation' => 'mix_preparation',
            'MasterKas' => 'master_kas',
            'ArusKas' => 'arus_kas',
            'Produk' => 'produk',
            'Material' => 'material',
            default => null,
        };
    }
}
