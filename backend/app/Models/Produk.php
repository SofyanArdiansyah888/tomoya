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

    public function isPastryDivision(): bool
    {
        $this->loadMissing('kategori');

        return \App\Support\StockDivision::isPastryCategoryName($this->kategori?->nama);
    }

    /**
     * Produk yang stoknya dilacak di produk_lokasi (bukan dari bahan resep).
     */
    public function usesProdukLokasiStock(?int $lokasiId = null): bool
    {
        $this->loadMissing('kategori');
 
        if ($this->isPastryDivision()) {
            return true;
        }

        $query = ProdukLokasi::where('produk_id', $this->id);

        if ($lokasiId !== null) {
            $query->where('lokasi_id', $lokasiId);
        }

        return $query->exists();
    }

    public function scopeStockDivision($query, string $division)
    {
        $pastryCategoryIds = \App\Support\StockDivision::pastryCategoryIds();

        if ($division === \App\Support\StockDivision::PASTRY) {
            return $query->whereIn('kategori_id', $pastryCategoryIds);
        }

        if ($division === \App\Support\StockDivision::MINUMAN) {
            return $query->where(function ($q) use ($pastryCategoryIds) {
                $q->whereNotIn('kategori_id', $pastryCategoryIds)
                    ->orWhereNull('kategori_id');
            });
        } 

        return $query;
    }

    public static function belongsToStockDivision(int $produkId, string $division): bool
    {
        $produk = self::with('kategori')->find($produkId);

        if (!$produk) {
            return false;
        }

        $isPastry = $produk->isPastryDivision();

        return $division === \App\Support\StockDivision::PASTRY ? $isPastry : !$isPastry;
    }
}
