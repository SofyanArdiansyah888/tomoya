import { api } from './api'
import { PaginatedResponse } from '../types/api'
import { Material } from '@/types/material'

export interface InventoriGudang {
  id: number
  gudang_id: number
  produk_id: number
  quantity: number
  reserved_quantity: number
  available_quantity: number
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  last_updated_at: string
  created_at: string
  updated_at: string
  gudang?: {
    id: number
    nama: string
    kode: string
  }
  produk?: {
    id: number
    nama: string
    harga: number
  }
}

export interface InventoriToko {
  id: number
  toko_id: number
  produk_id: number
  quantity: number
  reserved_quantity: number
  available_quantity: number
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  last_updated_at: string
  created_at: string
  updated_at: string
  toko?: {
    id: number
    nama: string
    kode: string
  }
  produk?: {
    id: number
    nama: string
    harga: number
  }
}

export interface Lokasi {
  id: number
  nama: string
  kode: string
  alamat: string
  tipe: 'gudang' | 'toko'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProdukLokasi {
  id: number
  lokasi_id: number
  produk_id: number
  quantity: number
  reserved_quantity: number
  available_quantity: number
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  last_updated_at?: string
  lokasi?: Lokasi
  produk?: {
    id: number
    nama: string
    harga: number
  }
}

export interface ItemLokasi {
  id: number
  lokasi_id: number
  material_id: number
  tipe: 'masuk' | 'keluar' | 'transfer' | 'adjustment' | 'mix_preparation'
  quantity: number // Positive untuk masuk, negative untuk keluar
  quantity_before: number // Stok sebelum movement
  quantity_after: number // Stok setelah movement
  quantity_gudang?: number // Quantity gudang (untuk adjustment gudang)
  quantity_gudang_before?: number // Stok gudang sebelum movement
  quantity_gudang_after?: number // Stok gudang setelah movement
  reference_type?: string // e.g., 'App\Models\Pembelian'
  reference_id?: number // ID dari transaksi
  keterangan?: string
  user_id?: number
  tanggal: string
  created_at: string
  updated_at: string
  lokasi?: Lokasi
  material?: {
    id: number
    name: string
    sku: string
    unit: string,
    unit_gudang: string
  }
  user?: {
    id: number
    name: string
  }
}

export interface InventoriFilters {
  location_type?: 'gudang' | 'toko'
  location_id?: number
  search?: string
  page?: number
  per_page?: number
}

export const inventoryService = {
  // Gudang Inventory
  async getWarehouseInventory(warehouseId: number, filters?: InventoriFilters): Promise<PaginatedResponse<InventoriGudang>> {
    const response = await api.get(`/gudang/${warehouseId}/inventory`, { params: filters })
    return response.data
  },

  async updateWarehouseInventory(warehouseId: number, productId: number, data: Partial<InventoriGudang>): Promise<InventoriGudang> {
    const response = await api.put(`/gudang/${warehouseId}/inventory/${productId}`, data)
    return response.data.data
  },

  // Toko Inventory
  async getShopInventory(shopId: number, filters?: InventoriFilters): Promise<PaginatedResponse<InventoriToko>> {
    const response = await api.get(`/toko/${shopId}/inventory`, { params: filters })
    return response.data
  },

  async updateShopInventory(shopId: number, productId: number, data: Partial<InventoriToko>): Promise<InventoriToko> {
    const response = await api.put(`/toko/${shopId}/inventory/${productId}`, data)
    return response.data.data
  },
}

export const produkLokasiService = {
  // Get inventory by location
  async getInventoryByLocation(lokasiId: number): Promise<ProdukLokasi[]> {
    const response = await api.get('/produk-lokasi', {
      params: { lokasi_id: lokasiId }
    })
    return response.data.data || response.data
  },

  // Get all inventory by location type
  async getInventoryByType(tipe: 'gudang' | 'toko'): Promise<ProdukLokasi[]> {
    const response = await api.get('/produk-lokasi', {
      params: { tipe_lokasi: tipe }
    })
    return response.data.data || response.data
  },

  // Get low stock products
  async getLowStock(tipe?: 'gudang' | 'toko'): Promise<ProdukLokasi[]> {
    const params = tipe ? { tipe_lokasi: tipe } : {}
    const response = await api.get('/produk-lokasi/low-stock', { params })
    return response.data.data || response.data
  },

  // Get product stock calculated from recipe materials
  async getProductStockByRecipe(lokasiId: number): Promise<ProdukLokasi[]> {
    const response = await api.get('/produk-lokasi/stock-by-recipe', {
      params: { lokasi_id: lokasiId }
    })
    return response.data.data || response.data
  }
}

export interface MaterialStock {
  lokasi_id: number
  material_id: number
  quantity?: number
  quantity_gudang?: number
  current_stock?: number
  min_stock?: number
  min_stock_gudang?: number
  lokasi?: Lokasi
  material?: Material
  last_updated?: string
}

export interface ItemLokasiFilters {
  lokasi_id?: number
  material_id?: number
  tipe_lokasi?: 'gudang' | 'toko'
  tipe?: 'masuk' | 'keluar' | 'transfer' | 'adjustment' | 'mix_preparation'
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

export const itemLokasiService = {
  // Get all stock movements (pergerakan stok)
  async getStockMovements(filters?: ItemLokasiFilters): Promise<{ data: ItemLokasi[]; meta: any; links: any }> {
    const response = await api.get('/item-lokasi', { params: filters })
    return response.data
  },

  // Get current stock by location type (gudang/toko)
  async getCurrentStock(tipe: 'gudang' | 'toko', lokasiId?: number): Promise<MaterialStock[]> {
    const params: any = { tipe_lokasi: tipe }
    if (lokasiId) {
      params.lokasi_id = lokasiId
    }
    const response = await api.get('/item-lokasi/current-stock', { params })
    return response.data.data || response.data || []
  },

  // Get stock history for a specific location and material
  async getStockHistory(lokasiId: number, materialId: number): Promise<ItemLokasi[]> {
    const response = await api.get('/item-lokasi/history', {
      params: { lokasi_id: lokasiId, material_id: materialId }
    })
    return response.data.data || response.data || []
  },

  // Transfer stock from gudang to toko
  async transferStock(data: {
    lokasi_tujuan_id: number
    material_id: number
    quantity: number
    keterangan?: string
  }): Promise<any> {
    const response = await api.post('/item-lokasi/transfer', data)
    return response.data
  },

  // Adjust stock at toko
  async adjustStock(data: {
    lokasi_id: number
    material_id: number
    quantity: number // Can be positive (increase) or negative (decrease)
    keterangan: string
  }): Promise<any> {
    const response = await api.post('/item-lokasi/adjust', data)
    return response.data
  },

  // Adjust stock at gudang
  async adjustGudangStock(data: {
    lokasi_id: number
    material_id: number
    quantity: number // Can be positive (increase) or negative (decrease)
    keterangan: string
  }): Promise<any> {
    const response = await api.post('/item-lokasi/adjust-gudang', data)
    return response.data
  },

  // Get low stock materials by location type
  async getLowStockMaterials(tipe?: 'gudang' | 'toko', lokasiId?: number): Promise<MaterialStock[]> {
    const params: any = {}
    if (tipe) params.tipe_lokasi = tipe
    if (lokasiId) params.lokasi_id = lokasiId
    const response = await api.get('/item-lokasi/low-stock', { params })
    return response.data.data || response.data || []
  },
  async createMixPreparation(data: {
    lokasi_id: number
    output_material_id: number
    output_quantity: number
    inputs: { material_id: number; quantity: number }[]
    keterangan?: string
  }): Promise<{ data: ItemLokasi[] }> {
    const response = await api.post('/mix-preparation', data)
    return response.data
  }
}

