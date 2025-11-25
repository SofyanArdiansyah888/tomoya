<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $table = 'material';

    protected $guarded = [];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'min_stock' => 'integer',
        'min_stok_gudang' => 'integer',
        'nilai_konversi' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function itemLokasi(): HasMany
    {
        return $this->hasMany(ItemLokasi::class);
    }

    public function itemPembelian(): HasMany
    {
        return $this->hasMany(ItemPembelian::class);
    }

    /**
     * Get latest HPP (Harga Pokok Penjualan) from the most recent purchase
     * 
     * @return float|null
     */
    public function getLatestHpp(): ?float
    {
        $latestPurchase = ItemPembelian::where('material_id', $this->id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        return $latestPurchase ? (float) $latestPurchase->harga_satuan : null;
    }
}
