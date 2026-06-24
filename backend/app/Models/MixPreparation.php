<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MixPreparation extends Model
{
    protected $table = 'mix_preparation';

    protected $fillable = [
        'no_mix_preparation',
        'lokasi_id',
        'output_material_id',
        'output_produk_id',
        'output_type',
        'output_quantity',
        'keterangan',
        'created_by',
        'tanggal',
    ];

    protected $casts = [
        'output_quantity' => 'integer',
        'tanggal' => 'datetime',
    ]; 

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mix) {
            if (empty($mix->no_mix_preparation)) {
                $mix->no_mix_preparation = self::generateNoMixPreparation();
            }
        });
    }

    public static function generateNoMixPreparation(): string
    {
        $date = now()->format('Ymd');
        $last = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $last ? (int) substr($last->no_mix_preparation, -4) + 1 : 1;

        return 'MIX-' . $date . '-' . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }
 
    public function outputMaterial(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'output_material_id');
    }

    public function outputProduk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'output_produk_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isPastryOutput(): bool
    {
        return $this->output_type === 'produk' || $this->output_produk_id !== null;
    }
}
