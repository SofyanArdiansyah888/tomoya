<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPesanan extends Model
{
    protected $table = 'item_pesanan';
    
    protected $fillable = [
        'pesanan_id',
        'produk_id',
        'quantity',
        'harga',
        'hpp',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'harga' => 'decimal:2',
        'hpp' => 'decimal:2',
    ];

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }
}
