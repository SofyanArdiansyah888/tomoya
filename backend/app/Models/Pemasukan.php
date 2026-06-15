<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pemasukan extends Model
{
    use HasFactory;

    protected $table = 'pemasukans';

    protected $fillable = [
        'user_id',
        'lokasi_id',
        'shift_id',
        'no_pemasukan',
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

        static::creating(function ($pemasukan) {
            if (empty($pemasukan->no_pemasukan)) {
                $pemasukan->no_pemasukan = self::generateNoPemasukan();
            }
        });
    }

    public static function generateNoPemasukan(): string
    {
        $date = now()->format('Ymd');
        $lastPemasukan = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastPemasukan ? (int) substr($lastPemasukan->no_pemasukan, -4) + 1 : 1;
        
        return 'PMS-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
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
            'pemasukan_kasir' => 'Pemasukan Kasir',
            'pemasukan_non_kasir' => 'Pemasukan Non Kasir',
            'lainnya' => 'Lainnya'
        ];

        return $labels[$this->kategori] ?? $this->kategori;
    }

    public function getSubKategoriLabelAttribute(): ?string
    {
        if (!$this->sub_kategori) {
            return null;
        }

        $labels = [
            'penjualan_kasir' => 'Penjualan Kasir',
            'investasi' => 'Investasi',
            'hibah' => 'Hibah',
            'refund_penjualan' => 'Refund Penjualan',
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
