<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
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
        $prefix = 'SUP';
        $lastSupplier = static::orderBy('id', 'desc')->first();
        
        if ($lastSupplier && $lastSupplier->kode) {
            // Extract number from existing kode
            $lastNumber = (int) substr($lastSupplier->kode, 3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function produk(): HasMany
    {
        return $this->hasMany(Produk::class);
    }

}
