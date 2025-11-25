export interface Pemasukan {
  id: number;
  no_pemasukan: string;
  user_id: number;
  toko_id: number;
  kategori: 'pemasukan_kasir' | 'pemasukan_non_kasir' | 'lainnya';
  kategori_label: string;
  sub_kategori?: 'penjualan_kasir' | 'investasi' | 'hibah' | 'refund_penjualan' | 'lainnya';
  sub_kategori_label?: string;
  nama: string;
  deskripsi?: string;
  jumlah: number;
  jumlah_formatted: string;
  tanggal: string;
  metode_pembayaran: 'cash' | 'transfer' | 'kredit' | 'debit' | 'qris';
  metode_pembayaran_label: string;
  referensi?: string;
  bukti_pembayaran?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  toko?: {
    id: number;
    nama: string;
    alamat: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreatePemasukanRequest {
  toko_id: number;
  kategori: 'pemasukan_kasir' | 'pemasukan_non_kasir' | 'lainnya';
  sub_kategori?: string;
  nama: string;
  deskripsi?: string;
  jumlah: number;
  tanggal: string;
  metode_pembayaran: 'cash' | 'transfer' | 'kredit' | 'debit' | 'qris';
  referensi?: string;
  bukti_pembayaran?: string;
  is_active?: boolean;
}

export interface UpdatePemasukanRequest extends Partial<CreatePemasukanRequest> {
  id: number;
}

export interface PemasukanFilters {
  kategori?: string;
  sub_kategori?: string;
  toko_id?: number;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  is_active?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PemasukanStats {
  total_pemasukan: number;
  total_transaksi: number;
  pemasukan_by_kategori: Record<string, number>;
}

export interface PemasukanFilterOptions {
  kategoris: Array<{
    value: string;
    label: string;
  }>;
  sub_kategoris: Array<{
    value: string;
    label: string;
  }>;
  toko: Array<{
    id: number;
    nama: string;
  }>;
  metode_pembayaran: Array<{
    value: string;
    label: string;
  }>;
}

export const PEMASUKAN_KATEGORI_OPTIONS = [
  { value: 'pemasukan_non_kasir', label: 'Pemasukan Non Kasir' },
  { value: 'lainnya', label: 'Lainnya' }
];

export const PEMASUKAN_SUB_KATEGORI_OPTIONS = [
  
  // Pemasukan Non Kasir
  { value: 'investasi', label: 'Investasi', kategori: 'pemasukan_non_kasir' },
  { value: 'hibah', label: 'Hibah', kategori: 'pemasukan_non_kasir' },
  { value: 'refund_penjualan', label: 'Refund Penjualan', kategori: 'pemasukan_non_kasir' },
  
  // Lainnya
  { value: 'lainnya', label: 'Lainnya', kategori: 'lainnya' }
];

export const PEMASUKAN_METODE_PEMBAYARAN_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'kredit', label: 'Kredit' },
  { value: 'debit', label: 'Debit' },
  { value: 'qris', label: 'QRIS' }
];
