export interface Produk {
  id: number;
  nama: string;
  slug: string;
  kode: string;
  deskripsi: string;
  harga: number;
  kategori_id: number;
  supplier_id?: number;
  gambar?: string;
  is_active: boolean;
  favorite?: boolean;
  stockable: boolean;
  resep_id?: number;
  created_at: string;
  updated_at: string;
  kategori?: Kategori;
  supplier?: Supplier;
  resep?: any;
  gambar_produk?: GambarProduk[];
}

export interface Supplier {
  id: number;
  nama: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi?: string;
  gambar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GambarProduk {
  id: number;
  produk_id: number;
  path_gambar: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdukFilters {
  kategori_id?: number;
  search?: string;
  is_active?: boolean;
  favorite?: boolean;
  page?: number;
  per_page?: number;
}
