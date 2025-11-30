<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\MixPreparation;
use App\Models\ItemPembelian;
use App\Models\ItemLokasi;

class Material extends Model
{
    protected $table = 'material';

    protected $guarded = [];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'min_stock' => 'integer',
        'min_stok_gudang' => 'integer',
        'nilai_konversi' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function itemLokasi(): HasMany
    {
        return $this->hasMany(ItemLokasi::class);
    }

    public function itemPembelian(): HasMany
    {
        return $this->hasMany(ItemPembelian::class);
    }

    /**
     * Get latest HPP (Harga Pokok Penjualan) from the most recent purchase
     * 
     * @return float|null
     */
    public function getLatestHpp(): ?float
    {
        $latestPurchase = ItemPembelian::where('material_id', $this->id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        return $latestPurchase ? (float) $latestPurchase->harga_satuan : null;
    }

    /**
     * Get purchase-based unit HPP considering conversion
     */
    public function getUnitHpp(): float
    {
        $latestHpp = $this->getLatestHpp();
        $conversion = $this->nilai_konversi ? (float) $this->nilai_konversi : 0.0;
        $basePriceRaw = $latestHpp !== null ? (float) $latestHpp : (float) $this->purchase_price;
        $hppUnitPrice = $conversion > 0 ? ($basePriceRaw / $conversion) : $basePriceRaw;
        return round($hppUnitPrice, 2);
    }

    /**
     * Get unit HPP from latest Mix Preparation producing this material
     * Returns cost per unit = total inputs cost / output_quantity
     */
    public function getMixPreparationUnitHpp(): ?float
    {
        $mp = MixPreparation::where('output_material_id', $this->id)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->first();
        if (!$mp) {
            return null;
        }

        $inputs = ItemLokasi::where('reference_type', MixPreparation::class)
            ->where('reference_id', $mp->id)
            ->where('quantity', '<', 0)
            ->get();

        $totalCost = 0.0;
        foreach ($inputs as $input) {
            $materialInput = Material::find($input->material_id);
            if (!$materialInput) {
                continue;
            }
            $unitHppInput = $materialInput->getUnitHpp();
            $qtyAbs = abs((float) $input->quantity);
            $totalCost += ($unitHppInput * $qtyAbs);
        }

        $outputQty = (float) $mp->output_quantity;
        if ($outputQty <= 0) {
            return null;
        }
        $unitCost = $totalCost / $outputQty;
        return round($unitCost, 2);
    }

    /**
     * Get effective unit HPP prioritizing mix preparation
     */
    public function getEffectiveUnitHpp(): float
    {
        $mixUnit = $this->getMixPreparationUnitHpp();
        if ($mixUnit !== null) {
            return $mixUnit;
        }
        return $this->getUnitHpp();
    }
}
