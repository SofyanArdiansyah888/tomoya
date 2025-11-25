import { api } from './api'
import { PaginatedResponse } from '../types/api'

export interface Gudang {
  id: number
  nama: string
  kode: string
  alamat: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GudangFilters {
  search?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export const warehouseService = {
  async getWarehouses(filters?: GudangFilters): Promise<PaginatedResponse<Gudang>> {
    const response = await api.get('/gudang', { params: filters })
    return response.data
  },

  async getWarehouse(id: number): Promise<Gudang> {
    const response = await api.get(`/gudang/${id}`)
    return response.data.data
  },

  async createWarehouse(warehouseData: Omit<Gudang, 'id' | 'created_at' | 'updated_at'>): Promise<Gudang> {
    const response = await api.post('/gudang', warehouseData)
    return response.data.data
  },

  async updateWarehouse(id: number, warehouseData: Partial<Gudang>): Promise<Gudang> {
    const response = await api.put(`/gudang/${id}`, warehouseData)
    return response.data.data
  },

  async deleteWarehouse(id: number): Promise<void> {
    await api.delete(`/gudang/${id}`)
  }
}
