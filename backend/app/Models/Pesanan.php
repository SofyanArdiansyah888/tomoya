<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pesanan extends Model
{
    protected $table = 'pesanan';
    
    protected $guarded = [];

    // Accessor untuk backward compatibility dengan 'status'
    public function getStatusAttribute()
    {
        return $this->attributes['payment_status'] ?? null;
    }

    // Mutator untuk backward compatibility dengan 'status'
    public function setStatusAttribute($value)
    {
        $this->attributes['payment_status'] = $value;
    }

    protected $casts = [
        'total_jumlah' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'uang_dibayar' => 'decimal:2',
        'kembalian' => 'decimal:2',
        'tanggal_penjualan' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pesanan) {
            if (empty($pesanan->no_pesanan)) {
                $pesanan->no_pesanan = self::generateNoPesanan();
            }
        });
    }

    public static function generateNoPesanan(): string
    {
        $date = now()->format('Ymd');
        $lastPesanan = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPesanan ? (int) substr($lastPesanan->no_pesanan, -4) + 1 : 1;
        
        return 'PSN-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function itemPesanan(): HasMany
    {
        return $this->hasMany(ItemPesanan::class);
    }

    public function shiftKasir(): BelongsTo
    {
        return $this->belongsTo(ShiftKasir::class);
    }
}
