<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArusKas extends Model
{
    use HasFactory;

    protected $table = 'arus_kas';

    protected $guarded = [];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'uang_dibayar' => 'decimal:2',
        'kembalian' => 'decimal:2', 
        'status' => 'boolean',
        'masuk_master_kas' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($arusKas) {
            if (empty($arusKas->no_arus_kas)) {
                $arusKas->no_arus_kas = self::generateNoArusKas();
            }
        });
    }

    public static function generateNoArusKas(): string
    {
        $date = now()->format('Ymd');
        $lastArusKas = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastArusKas ? (int) substr($lastArusKas->no_arus_kas, -4) + 1 : 1;
        
        return 'AK-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
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

    public function masterKas(): BelongsTo
    {
        return $this->belongsTo(MasterKas::class, 'master_kas_id');
    }

    // Scopes
    public function scopePemasukan($query)
    {
        return $query->where('jenis', 'pemasukan');
    }

    public function scopePengeluaran($query)
    {
        return $query->where('jenis', 'pengeluaran');
    }

    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    public function scopeByLokasi($query, $lokasiId)
    {
        return $query->where('lokasi_id', $lokasiId);
    } 

    /**
     * Entri yang masuk laporan:
     * - pemasukan kasir non-cash per pesanan (langsung)
     * - pemasukan kasir cash agregat saat tutup shift
     */
    public function scopeForLaporan($query)
    { 
        return $query->where(function ($q) {
            $q->where('kategori', '!=', 'pemasukan_kasir')
                ->orWhere(function ($q2) {
                    $q2->where('kategori', 'pemasukan_kasir')
                        ->where('sub_kategori', 'penjualan_kasir')
                        ->where('referensi_type', 'ShiftKasir');
                })
                ->orWhere(function ($q3) {
                    $q3->where('kategori', 'pemasukan_kasir')
                        ->whereIn('referensi_type', ['Pesanan', Pesanan::class])
                        ->where('metode_pembayaran', '!=', 'cash');
                });
        });
    }

    // Accessors
    public function getKategoriLabelAttribute(): string
    {
        $labels = [
            'pemasukan_kasir' => 'Pemasukan Kasir',
            'pemasukan_non_kasir' => 'Pemasukan Non Kasir',
            'lainnya' => 'Lainnya',
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
            // Pemasukan subcategories
            'penjualan_kasir' => 'Penjualan Kasir',
            'investasi' => 'Investasi',
            'hibah' => 'Hibah',
            'refund_penjualan' => 'Refund Penjualan',
            'lainnya' => 'Lainnya',
            // Pengeluaran subcategories
            'gaji_karyawan' => 'Gaji Karyawan',
            'listrik_air' => 'Listrik & Air',
            'sewa_tempat' => 'Sewa Tempat',
            'pemeliharaan' => 'Pemeliharaan',
            'pembelian_bahan' => 'Pembelian Bahan'
        ];

        return $labels[$this->sub_kategori] ?? $this->sub_kategori;
    }

    public function getJenisLabelAttribute(): string
    {
        return $this->jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    }

    public function getMetodePembayaranLabelAttribute(): string
    {
        $labels = [
            'cash' => 'Cash',
            'transfer' => 'Transfer',
            'kredit' => 'Kredit'
        ];

        return $labels[$this->metode_pembayaran] ?? $this->metode_pembayaran;
    }
}
