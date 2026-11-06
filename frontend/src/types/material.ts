export interface Material {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  category_id: number;
  supplier_id: number;
  purchase_price: number;
  unit: string;
  min_stock: number;
  unit_gudang: string;
  min_stok_gudang: number;
  nilai_konversi: number;
  barcode?: string;
  is_active: boolean;
  is_bahan_kopi?: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  supplier?: Supplier;
  recipe_materials?: RecipeMaterial[];
  pivot?: {
    quantity: number;
    unit: string;
    cost?: number;
  };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeMaterial {
  id: number;
  recipe_id: number;
  material_id: number;
  quantity: number;
  unit: string;
  cost?: number;
  created_at: string;
  updated_at: string;
  material?: Material;
}

export interface MaterialFilters {
  category_id?: number;
  supplier_id?: number;
  search?: string;
  is_active?: boolean;
  stock_division?: 'pastry' | 'minuman';
  page?: number;
  per_page?: number;
}
