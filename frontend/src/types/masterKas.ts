export interface MasterKas {
  id: number;
  no_master_kas: string;
  user_id: number;
  lokasi_id: number;
  toko_id?: number; 
  jenis: 'pemasukan' | 'pengeluaran';
  jenis_label: string;
  kategori: 'pemasukan_kasir' | 'pemasukan_non_kasir' | 'lainnya' |
           'pengeluaran_operasional' | 'pengeluaran_lainnya' | 'pembelian_bahan_baku';
  kategori_label: string;
  sub_kategori?: string;
  sub_kategori_label?: string;
  jumlah: number;
  subtotal?: number;
  uang_dibayar?: number;
  kembalian?: number;
  deskripsi: string;
  tanggal: string;
  referensi_id?: number;
  referensi_type?: string;
  metode_pembayaran: 'cash' | 'transfer' | 'qris' | 'kredit' | 'debit';
  metode_pembayaran_label: string;
  status?: boolean;
  is_recap?: boolean;
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
  };
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface MasterKasFilters {
  jenis?: 'pemasukan' | 'pengeluaran';
  kategori?: string;
  sub_kategori?: string;
  lokasi_id?: number;
  toko_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  status?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface MasterKasStats {
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_bersih: number;
  total_transaksi: number;
  breakdown_pemasukan: Record<string, number>;
  breakdown_pengeluaran: Record<string, number>;
}

export interface MasterKasFilterOptions {
  kategoris: string[];
  sub_kategoris: string[];
  lokasi?: Array<{
    id: number;
    nama: string;
  }>;
  toko?: Array<{
    id: number;
    nama: string;
  }>;
  jenis: string[];
  metode_pembayaran: string[];
}
