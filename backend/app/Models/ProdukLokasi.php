<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdukLokasi extends Model
{
    protected $table = 'produk_lokasi';
    
    protected $fillable = [
        'lokasi_id',
        'produk_id',
        'quantity',
        'reserved_quantity',
        'available_quantity',
        'min_stock_level',
        'max_stock_level',
        'reorder_point',
        'last_updated_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'available_quantity' => 'integer',
        'min_stock_level' => 'integer',
        'max_stock_level' => 'integer',
        'reorder_point' => 'integer',
        'last_updated_at' => 'datetime',
    ];

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }

    // Scope untuk filter berdasarkan tipe lokasi
    public function scopeGudang($query)
    {
        return $query->whereHas('lokasi', function ($q) {
            $q->where('tipe', 'gudang');
        });
    }

    public function scopeToko($query)
    {
        return $query->whereHas('lokasi', function ($q) {
            $q->where('tipe', 'toko');
        }); 
    } 

    public static function getQuantityAtLocation(int $lokasiId, int $produkId): int
    {
        $record = static::where('lokasi_id', $lokasiId)
            ->where('produk_id', $produkId)
            ->first();

        return $record ? (int) $record->quantity : 0;
    }
 
    /**
     * @param bool $allowNegative When true, stock may go below zero (e.g. penjualan pastry).
     * @throws \RuntimeException when adjustment would make stock negative and $allowNegative is false
     */
    public static function adjustQuantity(int $lokasiId, int $produkId, int $delta, bool $allowNegative = false): self
    {
        $record = static::firstOrNew([
            'lokasi_id' => $lokasiId,
            'produk_id' => $produkId,
        ]);

        if (!$record->exists) {
            $record->quantity = 0;
            $record->reserved_quantity = 0;
            $record->available_quantity = 0;
            $record->min_stock_level = 0;
            $record->reorder_point = 0;
        }

        $newQuantity = (int) $record->quantity + $delta;

        if (!$allowNegative && $newQuantity < 0) {
            throw new \RuntimeException('Stok produk tidak mencukupi.');
        }

        $record->quantity = $newQuantity;
        $record->available_quantity = max(0, $newQuantity - (int) $record->reserved_quantity);
        $record->last_updated_at = now();
        $record->save();

        return $record;
    }
}

