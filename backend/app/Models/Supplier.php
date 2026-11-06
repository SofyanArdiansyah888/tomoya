<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use \App\Traits\HasSyncUuid;

    protected $table = 'supplier';
    
    protected $guarded=[];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (empty($supplier->kode)) {
                $supplier->kode = static::generateKode();
            }
        });
    }

    /**
     * Generate unique kode for supplier
     */
    public static function generateKode(): string
    {
        return \App\Support\DocumentNumber::sequential(static::class, 'kode', 'SUP');
    }

    public function produk(): HasMany
    {
        return $this->hasMany(Produk::class);
    }

}
