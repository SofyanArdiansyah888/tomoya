export interface Pengeluaran {
  id: number;
  no_pengeluaran: string;
  user_id: number;
  toko_id: number;
  kategori: 'pengeluaran_operasional' | 'pengeluaran_lainnya' | 'pembelian_bahan_baku';
  kategori_label: string;
  sub_kategori?: 'gaji_karyawan' | 'listrik_air' | 'sewa_tempat' | 'pemeliharaan' | 'pembelian_bahan';
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

export interface CreatePengeluaranRequest {
  toko_id: number;
  kategori: 'pengeluaran_operasional' | 'pengeluaran_lainnya' ;
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

export interface UpdatePengeluaranRequest extends Partial<CreatePengeluaranRequest> {
  id: number;
}

export interface PengeluaranFilters {
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
  exclude_kategori?: string;
}

export interface PengeluaranStats {
  total_pengeluaran: number;
  total_transaksi: number;
  pengeluaran_by_kategori: Record<string, number>;
}

export interface PengeluaranFilterOptions {
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

export const PENGELUARAN_KATEGORI_OPTIONS = [
  { value: 'pengeluaran_operasional', label: 'Pengeluaran Operasional' },
  { value: 'pengeluaran_lainnya', label: 'Pengeluaran Lainnya' },
];

export const PENGELUARAN_SUB_KATEGORI_OPTIONS = [
  // Operasional
  { value: 'gaji_karyawan', label: 'Gaji Karyawan', kategori: 'pengeluaran_operasional' },
  { value: 'listrik_air', label: 'Listrik & Air', kategori: 'pengeluaran_operasional' },
  { value: 'sewa_tempat', label: 'Sewa Tempat', kategori: 'pengeluaran_operasional' },
  { value: 'pemeliharaan', label: 'Pemeliharaan', kategori: 'pengeluaran_operasional' },
  
  // Lainnya
  { value: 'lainnya', label: 'Lainnya', kategori: 'pengeluaran_lainnya' },
  
  // Bahan Baku
  { value: 'pembelian_bahan', label: 'Pembelian Bahan', kategori: 'pembelian_bahan_baku' }
];


export const PENGELUARAN_METODE_PEMBAYARAN_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'kredit', label: 'Kredit' },
  { value: 'debit', label: 'Debit' },
  { value: 'qris', label: 'QRIS' }
];
