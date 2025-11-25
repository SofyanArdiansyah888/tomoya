<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    protected $table = 'produk';
    
    protected $fillable = [
        'nama',
        'slug',
        'kode',
        'deskripsi',
        'harga',
        'kategori_id',
        'supplier_id',
        'gambar',
        'is_active',
        'favorite',
        'stockable',
        'resep_id',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'is_active' => 'boolean',
        'favorite' => 'boolean',
        'stockable' => 'boolean',
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }


    public function itemPesanan(): HasMany
    {
        return $this->hasMany(ItemPesanan::class);
    }

    public function produkLokasi(): HasMany
    {
        return $this->hasMany(ProdukLokasi::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function bahanResep(): HasMany
    {
        return $this->hasMany(RecipeMaterial::class);
    }

    public function resep(): BelongsTo
    {
        return $this->belongsTo(Recipe::class, 'resep_id');
    }
}
