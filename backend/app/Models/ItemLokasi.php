<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ItemLokasi extends Model
{
    protected $table = 'item_lokasi';
    
    protected $fillable = [
        'lokasi_id',
        'material_id',
        'tipe',
        'quantity',
        'quantity_before',
        'quantity_after',
        'quantity_gudang',
        'quantity_gudang_before',
        'quantity_gudang_after',
        'reference_type',
        'reference_id',
        'keterangan',
        'user_id',
        'tanggal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'quantity_gudang' => 'integer',
        'quantity_gudang_before' => 'integer',
        'quantity_gudang_after' => 'integer',
        'tanggal' => 'datetime',
    ];

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
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

    // Scope untuk filter berdasarkan tipe movement
    public function scopeMasuk($query)
    {
        return $query->where('tipe', 'masuk');
    }

    public function scopeKeluar($query)
    {
        return $query->where('tipe', 'keluar');
    }

    // Helper method untuk mendapatkan current stock dari history
    public static function getCurrentStock($lokasiId, $materialId): int|null
    {
        $latest = static::where('lokasi_id', $lokasiId)
            ->where('material_id', $materialId)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        
        return $latest ? $latest->quantity_after : 0;
    }

    // Helper method untuk mendapatkan current gudang stock dari history
    public static function getCurrentGudangStock($lokasiId, $materialId): int
    {
        $latest = static::where('lokasi_id', $lokasiId)
            ->where('material_id', $materialId)
            ->whereNotNull('quantity_gudang_after')
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        
        return $latest ? $latest->quantity_gudang_after : 0;
    }
}

