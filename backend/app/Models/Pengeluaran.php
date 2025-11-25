<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengeluaran extends Model
{
    use HasFactory;

    protected $table = 'pengeluaran';

    protected $fillable = [
        'user_id',
        'lokasi_id',
        'shift_id',
        'no_pengeluaran',
        'kategori',
        'sub_kategori',
        'nama',
        'deskripsi',
        'jumlah',
        'tanggal',
        'metode_pembayaran',
        'referensi',
        'bukti_pembayaran',
        'is_active'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pengeluaran) {
            if (empty($pengeluaran->no_pengeluaran)) {
                $pengeluaran->no_pengeluaran = self::generateNoPengeluaran();
            }
        });
    }

    public static function generateNoPengeluaran(): string
    {
        $date = now()->format('Ymd');
        $lastPengeluaran = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPengeluaran ? (int) substr($lastPengeluaran->no_pengeluaran, -4) + 1 : 1;
        
        return 'PGL-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }

    public function shiftKasir(): BelongsTo
    {
        return $this->belongsTo(ShiftKasir::class);
    }

    // Scopes
    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeBySubKategori($query, $subKategori)
    {
        return $query->where('sub_kategori', $subKategori);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    public function scopeByLokasi($query, $lokasiId)
    {
        return $query->where('lokasi_id', $lokasiId);
    }


    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors

    public function getKategoriLabelAttribute(): string
    {
        $labels = [
            'pengeluaran_operasional' => 'Pengeluaran Operasional',
            'pengeluaran_lainnya' => 'Pengeluaran Lainnya',
            'pembelian_bahan_baku' => 'Pembelian Bahan Baku'
        ];

        return $labels[$this->kategori] ?? $this->kategori;
    }

    public function getSubKategoriLabelAttribute(): ?string
    {
        if (!$this->sub_kategori) {
            return null;
        }

        $labels = [
            'gaji_karyawan' => 'Gaji Karyawan',
            'listrik_air' => 'Listrik & Air',
            'sewa_tempat' => 'Sewa Tempat',
            'pemeliharaan' => 'Pemeliharaan',
            'pembelian_bahan' => 'Pembelian Bahan',
            'lainnya' => 'Lainnya'
        ];

        return $labels[$this->sub_kategori] ?? $this->sub_kategori;
    }

    public function getMetodePembayaranLabelAttribute(): string
    {
        $labels = [
            'cash' => 'Cash',
            'transfer' => 'Transfer',
            'kredit' => 'Kredit',
            'debit' => 'Debit',
            'qris' => 'QRIS'
        ];

        return $labels[$this->metode_pembayaran] ?? $this->metode_pembayaran;
    }

    public function getJumlahFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->jumlah, 0, ',', '.');
    }
}
