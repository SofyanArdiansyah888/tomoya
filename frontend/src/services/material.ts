import { api } from './api'
import { Material, MaterialFilters, Category, Supplier } from '../types/material'
import { PaginatedResponse } from '../types/api'

export const materialService = {
  async getMaterials(filters?: MaterialFilters): Promise<PaginatedResponse<Material>> {
    const response = await api.get('/material', { params: filters })
    return response.data
  },

  async getMaterial(id: number): Promise<Material> {
    const response = await api.get(`/material/${id}`)
    return response.data.data
  },

  async createMaterial(materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const response = await api.post('/material', materialData)
    return response.data.data
  },

  async updateMaterial(id: number, materialData: Partial<Material>): Promise<Material> {
    const response = await api.put(`/material/${id}`, materialData)
    return response.data.data
  },

  async deleteMaterial(id: number): Promise<void> {
    await api.delete(`/material/${id}`)
  },

  async getLowStockMaterials(): Promise<Material[]> {
    const response = await api.get('/material/low-stock')
    return response.data.data
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/kategori')
    return response.data.data
  },

  async getSuppliers(): Promise<Supplier[]> {
    const response = await api.get('/supplier')
    return response.data.data
  }
}
