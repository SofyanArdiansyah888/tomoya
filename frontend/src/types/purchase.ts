export interface Supplier {
  id: number;
  nama: string;
  kode?: string;
  alamat: string;
  telepon: string;
  email?: string;
  kontak_person?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pembelian {
  id: number;
  user_id: number;
  supplier_id: number;
  lokasi_id: number;
  no_pembelian: string;
  tanggal_pembelian: string;
  total_harga: number;
  metode_pembayaran: 'cash' | 'transfer' | 'credit';
  catatan?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  lokasi?: {
    id: number;
    nama: string;
    alamat: string;
    tipe?: 'gudang' | 'toko';
  };
  items?: ItemPembelian[];
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface ItemPembelian {
  id: number;
  pembelian_id: number;
  material_id: number;
  quantity: number;
  harga_satuan: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  material?: {
    id: number;
    name: string;
    sku: string;
    purchase_price: number;
    unit: string;
    unit_gudang?: string;
    nilai_konversi?: number;
    category?: {
      id: number;
      name: string;
    };
  };
}

export interface CreatePurchaseRequest {
  supplier_id: number;
  lokasi_id: number;
  tanggal_pembelian: string;
  items: {
    material_id: number;
    quantity: number;
    harga_satuan: number;
  }[];
  metode_pembayaran: 'cash' | 'transfer' | 'credit';
  catatan?: string;
}

export interface PurchaseFilters {
  supplier_id?: number;
  lokasi_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}
