<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lokasi extends Model
{
    protected $table = 'lokasi';
    
    protected $fillable = [
        'nama',
        'kode',
        'alamat',
        'tipe',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function produkLokasi(): HasMany
    {
        return $this->hasMany(ProdukLokasi::class);
    }

    public function itemLokasi(): HasMany
    {
        return $this->hasMany(ItemLokasi::class);
    }

    public function transferStokAsal(): HasMany
    {
        return $this->hasMany(TransferStokLokasi::class, 'lokasi_asal_id');
    }

    public function transferStokTujuan(): HasMany
    {
        return $this->hasMany(TransferStokLokasi::class, 'lokasi_tujuan_id');
    }

    public function pergerakanStok(): HasMany
    {
        return $this->hasMany(PergerakanStokLokasi::class);
    }

    public function alertStok(): HasMany
    {
        return $this->hasMany(AlertStokLokasi::class);
    }

    // Scope untuk filter berdasarkan tipe
    public function scopeGudang($query)
    {
        return $query->where('tipe', 'gudang');
    }

    public function scopeToko($query)
    {
        return $query->where('tipe', 'toko');
    }
}
