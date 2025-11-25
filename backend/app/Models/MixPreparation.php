<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MixPreparation extends Model
{
    protected $table = 'mix_preparation';

    protected $fillable = [
        'lokasi_id',
        'output_material_id',
        'output_quantity',
        'keterangan',
        'created_by',
        'tanggal',
    ];

    protected $casts = [
        'output_quantity' => 'integer',
        'tanggal' => 'datetime',
    ];

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function outputMaterial(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'output_material_id');
    }
}