<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPembelian extends Model
{
    protected $table = 'item_pembelian';
    
    protected $fillable = [
        'pembelian_id',
        'material_id',
        'quantity',
        'harga_satuan',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'harga_satuan' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->subtotal = $item->quantity * $item->harga_satuan;
        });

        static::saved(function ($item) {
            $item->pembelian->updateTotalHarga();
        });

        static::deleted(function ($item) {
            $item->pembelian->updateTotalHarga();
        });
    }

    public function pembelian(): BelongsTo
    {
        return $this->belongsTo(Pembelian::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}

