import { Material, Category, Supplier } from './material';

export interface HppMaterial {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  category_id: number;
  supplier_id: number;
  purchase_price: number;
  unit: string;
  nilai_konversi?: number;
  min_stock: number;
  is_active: boolean;
  hpp: number | null;
  hpp_unit_price?: number | null;
  hpp_source?: 'mix_preparation' | 'purchase' | 'purchase_fallback';
  latest_purchase: LatestPurchase | null;
  category?: Category;
  supplier?: Supplier;
}

export interface LatestPurchase {
  id: number;
  harga_satuan: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  pembelian: {
    id: number;
    no_pembelian: string;
    tanggal_pembelian: string;
  } | null;
}

export interface HppMaterialDetail extends HppMaterial {
  // Additional detail fields if needed
}

export interface HppBreakdown {
  material_id: number;
  material_name: string;
  quantity: number;
  unit: string;
  hpp_per_unit: number | null;
  cost_per_unit: number;
  subtotal: number;
}

export interface HppRecipe {
  id: number;
  name: string;
  description?: string;
  yield_quantity: number;
  yield_unit: string;
  cost_per_unit?: number | null;
  instructions?: string;
  is_active: boolean;
  hpp: {
    total_hpp: number;
    cost_per_unit: number;
    yield_quantity: number;
    yield_unit: string;
    breakdown: HppBreakdown[];
  };
  materials?: Material[];
  created_at: string;
  updated_at: string;
}

export interface HppRecipeDetail extends HppRecipe {
  // Additional detail fields if needed
}

export interface HppMaterialFilters {
  search?: string;
  is_active?: boolean;
  category_id?: number;
  supplier_id?: number;
  has_hpp?: boolean;
}

export interface HppRecipeFilters {
  search?: string;
  is_active?: boolean;
}

