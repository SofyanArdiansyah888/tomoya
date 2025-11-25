export interface ShiftKasir {
  id: number;
  no_shift_kasir: string;
  user_id: number;
  lokasi_id: number;
  saldo_awal: number;
  saldo_akhir: number | null;
  total_penjualan_cash: number;
  total_penjualan_card: number;
  total_penjualan_qris: number;
  total_penjualan_other: number;
  total_penjualan: number;
  total_pembelian: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  total_arus_kas: number;
  selisih: number | null;
  tanggal_buka: string;
  tanggal_tutup: string | null;
  status: 'open' | 'closed';
  catatan: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  lokasi?: {
    id: number;
    nama: string;
    alamat?: string;
  };
  pesanan?: Array<{
    id: number;
    total_jumlah: number;
    metode_pembayaran: string;
    tanggal_penjualan: string | null;
  }>;
  pembelian?: Array<{
    id: number;
    no_pembelian: string;
    total_harga: number;
    metode_pembayaran: string;
    tanggal_pembelian: string;
  }>;
  pemasukan?: Array<{
    id: number;
    nama: string;
    jumlah: number;
    metode_pembayaran: string;
    uang_dibayar?: number | null;
    tanggal: string;
  }>;
  pengeluaran?: Array<{
    id: number;
    nama: string;
    jumlah: number;
    metode_pembayaran: string;
    tanggal: string;
  }>;
  arus_kas?: Array<{
    id: number;
    jenis: string;
    jumlah: number;
    metode_pembayaran: string;
    uang_dibayar?: number | null;
    deskripsi: string;
    tanggal: string;
  }>;
}

export interface BukaKasirRequest {
  lokasi_id: number;
  saldo_awal: number;
  catatan?: string;
}

export interface TutupKasirRequest {
  saldo_akhir: number;
  catatan?: string;
}

export interface ShiftDetail extends ShiftKasir {
  pesanan: Array<{
    id: number;
    total_jumlah: number;
    metode_pembayaran: string;
    tanggal_penjualan: string | null;
  }>;
  pembelian: Array<{
    id: number;
    no_pembelian: string;
    total_harga: number;
    metode_pembayaran: string;
    tanggal_pembelian: string;
  }>;
  pemasukan: Array<{
    id: number;
    nama: string;
    jumlah: number;
    metode_pembayaran: string;
    uang_dibayar?: number | null;
    tanggal: string;
  }>;
  pengeluaran: Array<{
    id: number;
    nama: string;
    jumlah: number;
    metode_pembayaran: string;
    tanggal: string;
  }>;
  arus_kas: Array<{
    id: number;
    jenis: string;
    jumlah: number;
    metode_pembayaran: string;
    uang_dibayar?: number | null;
    deskripsi: string;
    tanggal: string;
  }>;
}

export interface ShiftFilters {
  user_id?: number;
  lokasi_id?: number;
  status?: 'open' | 'closed';
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

