<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembelian extends Model
{
    protected $table = 'pembelian';
    
    protected $fillable = [
        'user_id',
        'supplier_id',
        'lokasi_id',
        'shift_id',
        'no_pembelian',
        'tanggal_pembelian',
        'total_harga',
        'metode_pembayaran',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pembelian' => 'date',
        'total_harga' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pembelian) {
            if (empty($pembelian->no_pembelian)) {
                $pembelian->no_pembelian = self::generateNoPembelian();
            }
        });
    }

    public static function generateNoPembelian(): string
    {
        $date = now()->format('Ymd');
        $lastPembelian = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPembelian ? (int) substr($lastPembelian->no_pembelian, -4) + 1 : 1;
        
        return 'PBL-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemPembelian::class);
    }

    public function shiftKasir(): BelongsTo
    {
        return $this->belongsTo(ShiftKasir::class);
    }

    public function updateTotalHarga(): void
    {
        $this->total_harga = $this->items()->sum('subtotal');
        $this->save();
    }
}

