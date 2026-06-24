<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ProdukLokasiPergerakan extends Model 
{
    protected $table = 'produk_lokasi_pergerakan';

    public const TIPE_MASUK = 'masuk';
    public const TIPE_KELUAR = 'keluar';
    public const TIPE_ADJUSTMENT = 'adjustment';

    public const ALASAN_RUSAK = 'rusak';
    public const ALASAN_KONSUMSI_OWNER = 'konsumsi_owner';
    public const ALASAN_KOREKSI = 'koreksi';
    public const ALASAN_LAINNYA = 'lainnya';

    protected $fillable = [
        'lokasi_id',
        'produk_id',
        'tipe',
        'quantity',
        'quantity_before',
        'quantity_after',
        'alasan',
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
        'tanggal' => 'datetime',
    ];

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeToko($query)
    {
        return $query->whereHas('lokasi', function ($q) {
            $q->where('tipe', 'toko');
        });
    }
}
