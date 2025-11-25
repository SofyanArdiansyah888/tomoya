import { Material } from './material';

export type { Material };

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  yield_quantity: number;
  yield_unit: string;
  cost_per_unit?: number;
  instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  materials?: Material[];
  recipe_materials?: RecipeMaterial[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category_id: number;
  supplier_id: number;
  purchase_price: number;
  selling_price: number;
  unit: string;
  min_stock: number;
  max_stock?: number;
  barcode?: string;
  image_url?: string;
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

export interface RecipeFilters {
  product_id?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface RecipeCostCalculation {
  total_cost: number;
  cost_per_unit: number;
  yield_quantity: number;
}
