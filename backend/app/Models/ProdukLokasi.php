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
}

