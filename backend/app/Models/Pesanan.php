<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pesanan extends Model
{
    use \App\Traits\HasSyncUuid;

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
        return \App\Support\DocumentNumber::daily(self::class, 'no_pesanan', 'PSN');
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
        return $this->belongsTo(ShiftKasir::class, 'shift_id'); 
    }
}
