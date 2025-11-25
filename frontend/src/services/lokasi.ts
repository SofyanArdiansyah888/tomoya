import { api } from './api'
import { PaginatedResponse } from '../types/api'
import { Lokasi } from './inventory'

export interface LokasiFilters {
  search?: string
  tipe?: 'gudang' | 'toko'
  is_active?: boolean
  page?: number
  per_page?: number
}

export const lokasiService = {
  async getLokasi(filters?: LokasiFilters): Promise<PaginatedResponse<Lokasi>> {
    const response = await api.get('/lokasi', { params: filters })
    return response.data
  },

  async getLokasiById(id: number): Promise<Lokasi> {
    const response = await api.get(`/lokasi/${id}`)
    return response.data.data || response.data
  },

  async getGudang(filters?: LokasiFilters): Promise<Lokasi[]> {
    try {
      const response = await api.get('/lokasi/gudang', { params: filters })
      console.log('lokasiService.getGudang - Full response:', response)
      console.log('lokasiService.getGudang - response.data:', response.data)
      console.log('lokasiService.getGudang - response.data type:', typeof response.data)
      
      // Handle Laravel ApiResource::collection format
      // Backend returns: { data: [...] } via ApiResource::collection()
      // Axios response.data is the JSON body, so response.data = { data: [...] }
      if (response.data) {
        // Check if wrapped in data property (ApiResource::collection format)
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('lokasiService.getGudang - Returning response.data.data (wrapped):', response.data.data)
          return response.data.data
        }
        // Check if direct array
        if (Array.isArray(response.data)) {
          console.log('lokasiService.getGudang - Returning response.data (direct array):', response.data)
          return response.data
        }
        // Check if it's an object with data property but not array
        if (typeof response.data === 'object' && response.data.data) {
          console.log('lokasiService.getGudang - Found data property but not array:', response.data.data)
        }
      }
      console.warn('lokasiService.getGudang - No valid data found in response')
      return []
    } catch (error) {
      console.error('lokasiService.getGudang - Error:', error)
      throw error
    }
  },

  async getToko(filters?: LokasiFilters): Promise<Lokasi[]> {
    const response = await api.get('/lokasi/toko', { params: filters })
    // Handle both array and paginated response
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.data || response.data || []
  },

  async createLokasi(lokasiData: Omit<Lokasi, 'id' | 'created_at' | 'updated_at'>): Promise<Lokasi> {
    const response = await api.post('/lokasi', lokasiData)
    return response.data.data || response.data
  },

  async updateLokasi(id: number, lokasiData: Partial<Lokasi>): Promise<Lokasi> {
    const response = await api.put(`/lokasi/${id}`, lokasiData)
    return response.data.data || response.data
  },

  async deleteLokasi(id: number): Promise<void> {
    await api.delete(`/lokasi/${id}`)
  }
}

// Backward compatibility aliases
export const warehouseService = {
  async getWarehouses(filters?: LokasiFilters): Promise<PaginatedResponse<Lokasi>> {
    const result = await lokasiService.getLokasi({ ...filters, tipe: 'gudang' })
    // Ensure result is always in PaginatedResponse<Lokasi> format
    if (Array.isArray(result)) {
      return {
        data: result,
        current_page: 1,
        last_page: 1,
        per_page: result.length,
        total: result.length,
        from: 1,
        to: result.length,
      }
    }
    return result
  },

  async getWarehouse(id: number): Promise<Lokasi> {
    return lokasiService.getLokasiById(id)
  },

  async createWarehouse(warehouseData: Omit<Lokasi, 'id' | 'created_at' | 'updated_at'>): Promise<Lokasi> {
    return lokasiService.createLokasi({ ...warehouseData, tipe: 'gudang' })
  },

  async updateWarehouse(id: number, warehouseData: Partial<Lokasi>): Promise<Lokasi> {
    return lokasiService.updateLokasi(id, warehouseData)
  },

  async deleteWarehouse(id: number): Promise<void> {
    return lokasiService.deleteLokasi(id)
  }
}

export const shopService = {
  async getShops(filters?: LokasiFilters): Promise<PaginatedResponse<Lokasi>> {
    const result = await lokasiService.getLokasi({ ...filters, tipe: 'toko' })
    // Ensure result is always in PaginatedResponse<Lokasi> format
    if (Array.isArray(result)) {
      return {
        data: result,
        current_page: 1,
        last_page: 1,
        per_page: result.length,
        total: result.length,
        from: 1,
        to: result.length,
      }
    }
    return result
  },
  async getShop(id: number): Promise<Lokasi> {
    return lokasiService.getLokasiById(id)
  },

  async createShop(shopData: Omit<Lokasi, 'id' | 'created_at' | 'updated_at'>): Promise<Lokasi> {
    return lokasiService.createLokasi({ ...shopData, tipe: 'toko' })
  },

  async updateShop(id: number, shopData: Partial<Lokasi>): Promise<Lokasi> {
    return lokasiService.updateLokasi(id, shopData)
  },

  async deleteShop(id: number): Promise<void> {
    return lokasiService.deleteLokasi(id)
  }
}

