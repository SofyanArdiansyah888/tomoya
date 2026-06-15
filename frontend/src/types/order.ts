export interface Pesanan {
  id: number;
  no_pesanan: string;
  user_id: number;
  lokasi_id: number;
  toko_id?: number; // Keep for backward compatibility
  total_jumlah: number;
  total_harga?: number; // Keep for backward compatibility
  subtotal?: number;
  uang_dibayar?: number;
  kembalian?: number;
  status: 'bayar' | 'belum_bayar';
  metode_pembayaran: 'cash' | 'card' | 'qris' | 'other';
  catatan?: string;
  nama_client?: string;
  gambar_qris?: string;
  tanggal_penjualan?: string;
  created_at: string;
  updated_at: string;
  items?: ItemPesanan[];
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
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ItemPesanan {
  id: number;
  pesanan_id: number;
  produk_id: number;
  quantity: number;
  harga_satuan: number;
  subtotal: number;
  catatan?: string;
  coffee_strength?: 'strong' | 'medium' | 'soft' | 'other';
  created_at: string;
  updated_at: string;
  produk?: {
    id: number;
    nama: string;
    harga: number;
    kategori?: {
      id: number;
      nama: string;
    };
  };
}

export interface CreateOrderRequest {
  lokasi_id: number;
  items: {
    produk_id: number;
    quantity: number;
    harga_satuan: number;
    coffee_strength?: 'strong' | 'medium' | 'soft' | 'other';
    coffee_grams?: number;
    target_material_id?: number;
    catatan?: string;
  }[];
  metode_pembayaran: 'cash' | 'card' | 'qris' | 'other';
  status?: 'bayar' | 'belum_bayar';
  subtotal?: number;
  uang_dibayar?: number;
  kembalian?: number;
  catatan?: string;
  nama_client?: string;
  gambar_qris?: File;
}

export interface UpdateOrderRequest {
  status?: 'bayar' | 'belum_bayar';
  items?: {
    produk_id: number;
    quantity: number;
    harga_satuan: number;
    coffee_strength?: 'strong' | 'medium' | 'soft' | 'other';
    coffee_grams?: number;
    target_material_id?: number;
    catatan?: string;
  }[];
  metode_pembayaran?: 'cash' | 'card' | 'qris' | 'other';
  subtotal?: number;
  uang_dibayar?: number;
  kembalian?: number;
  catatan?: string;
  nama_client?: string;
  gambar_qris?: File;
  alamat_pengiriman?: string;
}

export interface OrderFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
