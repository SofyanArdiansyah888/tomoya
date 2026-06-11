<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftKasir extends Model
{
    use HasFactory;

    protected $table = 'shift_kasir';

    protected $fillable = [
        'user_id',
        'lokasi_id',
        'no_shift_kasir',
        'saldo_awal',
        'saldo_akhir',
        'total_penjualan_cash',
        'total_penjualan_card',
        'total_penjualan_qris',
        'total_penjualan_other',
        'total_penjualan',
        'total_pembelian',
        'total_pemasukan',
        'total_pengeluaran',
        'total_arus_kas',
        'selisih',
        'tanggal_buka',
        'tanggal_tutup',
        'status',
        'catatan',
    ];

    protected $casts = [
        'saldo_awal' => 'decimal:2',
        'saldo_akhir' => 'decimal:2',
        'total_penjualan_cash' => 'decimal:2',
        'total_penjualan_card' => 'decimal:2',
        'total_penjualan_qris' => 'decimal:2',
        'total_penjualan_other' => 'decimal:2',
        'total_penjualan' => 'decimal:2',
        'total_pembelian' => 'decimal:2',
        'total_pemasukan' => 'decimal:2',
        'total_pengeluaran' => 'decimal:2',
        'total_arus_kas' => 'decimal:2',
        'selisih' => 'decimal:2',
        'tanggal_buka' => 'datetime',
        'tanggal_tutup' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shiftKasir) {
            if (empty($shiftKasir->no_shift_kasir)) {
                $shiftKasir->no_shift_kasir = self::generateNoShiftKasir();
            }
        });
    }

    public static function generateNoShiftKasir(): string
    {
        $date = now()->format('Ymd');
        $lastShiftKasir = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastShiftKasir ? (int) substr($lastShiftKasir->no_shift_kasir, -4) + 1 : 1;
        
        return 'SHF-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
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

    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class, 'shift_id');
    }

    public function pembelian(): HasMany
    {
        return $this->hasMany(Pembelian::class, 'shift_id');
    }

    public function arusKas(): HasMany
    {
        return $this->hasMany(ArusKas::class, 'shift_id');
    }

    public function pengeluaran(): HasMany
    {
        return $this->hasMany(Pengeluaran::class, 'shift_id');
    }

    public function pemasukan(): HasMany
    {
        return $this->hasMany(Pemasukan::class, 'shift_id');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByLokasi($query, $lokasiId)
    {
        return $query->where('lokasi_id', $lokasiId);
    }

    /**
     * Shift kasir aktif untuk lokasi tertentu.
     */
    public static function findActiveForLokasi(int $lokasiId, ?int $userId = null): ?self
    {
        $query = self::query()
            ->where('lokasi_id', $lokasiId)
            ->where('status', 'open'); 

        if ($userId) {
            $userShift = (clone $query)->where('user_id', $userId)->orderByDesc('id')->first();
            if ($userShift) {
                return $userShift;
            }
        }

        return $query->orderByDesc('id')->first();
    }

    /**
     * Arus kas penjualan kasir (bukan input closing shift).
     */
    public function penjualanArusKasQuery()
    {
        return $this->arusKas()
            ->where('jenis', 'pemasukan')
            ->where('kategori', 'pemasukan_kasir')
            ->where(function ($query) {
                $query->whereNull('sub_kategori')
                    ->orWhere('sub_kategori', '!=', 'penjualan_kasir');
            })
            ->where(function ($query) {
                $query->where('referensi_type', 'Pesanan')
                    ->orWhere('referensi_type', Pesanan::class);
            });
    }

    /**
     * Pesanan yang sudah dibayar dan terkait shift ini.
     */
    public function paidPesananQuery()
    {
        $shiftEnd = $this->tanggal_tutup ?? now();

        $pesananIdsFromArusKas = $this->penjualanArusKasQuery()
            ->pluck('referensi_id')
            ->filter();

        return Pesanan::query()
            ->where('lokasi_id', $this->lokasi_id)
            ->where('payment_status', 'bayar')
            ->where(function ($query) use ($pesananIdsFromArusKas, $shiftEnd) {
                $query->where('shift_id', $this->id);

                if ($pesananIdsFromArusKas->isNotEmpty()) {
                    $query->orWhereIn('id', $pesananIdsFromArusKas);
                }

                $query->orWhere(function ($subQuery) use ($shiftEnd) {
                    $subQuery->whereNull('shift_id')
                        ->where('created_at', '>=', $this->tanggal_buka)
                        ->where('created_at', '<=', $shiftEnd);
                });
            });
    }

    /**
     * Hitung total penjualan per metode pembayaran.
     */
    protected function calculatePenjualanTotals(): array
    {
        $paidPesanan = $this->paidPesananQuery()->get();

        $pesananIdsFromArusKas = $this->penjualanArusKasQuery()
            ->pluck('referensi_id')
            ->filter();

        if ($pesananIdsFromArusKas->isNotEmpty()) {
            $pesananFromArusKas = Pesanan::query()
                ->whereIn('id', $pesananIdsFromArusKas)
                ->where('payment_status', 'bayar')
                ->get();

            $paidPesanan = $paidPesanan
                ->merge($pesananFromArusKas)
                ->unique('id')
                ->values();
        }

        if ($paidPesanan->isNotEmpty()) {
            return [
                'total_penjualan_cash' => $paidPesanan
                    ->where('metode_pembayaran', 'cash')
                    ->sum(fn ($pesanan) => $pesanan->uang_dibayar ?? $pesanan->total_jumlah),
                'total_penjualan_card' => $paidPesanan
                    ->where('metode_pembayaran', 'card')
                    ->sum('total_jumlah'),
                'total_penjualan_qris' => $paidPesanan
                    ->where('metode_pembayaran', 'qris')
                    ->sum('total_jumlah'),
                'total_penjualan_other' => $paidPesanan
                    ->where('metode_pembayaran', 'other')
                    ->sum('total_jumlah'),
                'total_penjualan' => $paidPesanan->sum('total_jumlah'),
            ];
        }

        $arusKasPenjualan = $this->penjualanArusKasQuery()->get();

        return [
            'total_penjualan_cash' => $arusKasPenjualan
                ->where('metode_pembayaran', 'cash')
                ->sum(fn ($arusKas) => $arusKas->uang_dibayar ?? $arusKas->jumlah),
            'total_penjualan_card' => $arusKasPenjualan
                ->where('metode_pembayaran', 'card')
                ->sum('jumlah'),
            'total_penjualan_qris' => $arusKasPenjualan
                ->where('metode_pembayaran', 'qris')
                ->sum('jumlah'),
            'total_penjualan_other' => $arusKasPenjualan
                ->where('metode_pembayaran', 'other')
                ->sum('jumlah'),
            'total_penjualan' => $arusKasPenjualan->sum('jumlah'),
        ];
    }

    /**
     * Calculate totals from all transactions in this shift
     */
    public function calculateTotals(): array
    {
        $penjualanTotals = $this->calculatePenjualanTotals();
        
        // Calculate other totals
        $totalPembelian = $this->pembelian()->sum('total_harga');
        $totalPemasukan = $this->pemasukan()->sum('jumlah');
        $totalPengeluaran = $this->pengeluaran()->sum('jumlah');
        
        // Calculate arus kas (pemasukan - pengeluaran)
        $arusKasPemasukan = $this->arusKas()
            ->where('jenis', 'pemasukan')
            ->sum('jumlah');
        $arusKasPengeluaran = $this->arusKas()
            ->where('jenis', 'pengeluaran')
            ->sum('jumlah');
        $totalArusKas = $arusKasPemasukan - $arusKasPengeluaran;
        
        return array_merge($penjualanTotals, [
            'total_pembelian' => $totalPembelian,
            'total_pemasukan' => $totalPemasukan,
            'total_pengeluaran' => $totalPengeluaran,
            'total_arus_kas' => $totalArusKas,
        ]);
    }
}

