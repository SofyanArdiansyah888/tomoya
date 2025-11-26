export interface ArusKas {
  id: number;
  no_arus_kas: string;
  user_id: number;
  lokasi_id: number;
  toko_id?: number; // Keep for backward compatibility
  jenis: 'pemasukan' | 'pengeluaran';
  jenis_label: string;
  kategori: 'pemasukan_kasir' | 'pemasukan_non_kasir' | 'lainnya' | 
           'pengeluaran_operasional' | 'pengeluaran_lainnya' | 'pembelian_bahan_baku';
  kategori_label: string;
  sub_kategori?: 'penjualan_kasir' | 'investasi' | 'hibah' | 'refund_penjualan' | 'lainnya' |
                 'gaji_karyawan' | 'listrik_air' | 'sewa_tempat' | 'pemeliharaan' |
                 'pembelian_bahan';
  sub_kategori_label?: string;
  jumlah: number;
  deskripsi: string;
  tanggal: string;
  referensi_id?: number;
  referensi_type?: string;
  metode_pembayaran: 'cash' | 'card' | 'qris' | 'other' | 'transfer' | 'kredit';
  metode_pembayaran_label: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
  lokasi?: {
    id: number;
    nama: string;
    alamat: string;
  };
  toko?: {
    id: number;
    nama: string;
    alamat: string;
  }; // Keep for backward compatibility
}

export interface CreateCashFlowRequest {
  lokasi_id: number;
  toko_id?: number; // Keep for backward compatibility
  jenis: 'pemasukan' | 'pengeluaran';
  kategori: 'pemasukan_kasir' | 'pemasukan_non_kasir' | 'lainnya' | 
           'pengeluaran_operasional' | 'pengeluaran_lainnya' | 'pembelian_bahan_baku';
  sub_kategori?: string;
  jumlah: number;
  deskripsi: string;
  tanggal: string;
  metode_pembayaran?: 'cash' | 'card' | 'qris' | 'other' | 'transfer' | 'kredit';
}

export interface CashFlowFilters {
  jenis?: 'pemasukan' | 'pengeluaran';
  kategori?: string;
  sub_kategori?: string;
  lokasi_id?: number;
  toko_id?: number; // Keep for backward compatibility
  date_from?: string;
  date_to?: string;
  search?: string;
  status?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CashFlowStats {
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_bersih: number;
  total_transaksi: number;
  breakdown_pemasukan: Record<string, number>;
  breakdown_pengeluaran: Record<string, number>;
}

export interface FilterOptions {
  kategoris: string[];
  sub_kategoris: string[];
  lokasi?: Array<{
    id: number;
    nama: string;
  }>;
  toko?: Array<{
    id: number;
    nama: string;
  }>; // Keep for backward compatibility
  jenis: string[];
  metode_pembayaran: string[];
}
