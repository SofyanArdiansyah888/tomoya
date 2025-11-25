import { api } from './api'
import { PaginatedResponse } from '../types/api'

export interface Category {
  id: number
  nama: string
  deskripsi?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryFilters {
  search?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export const categoryService = {
  async getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const response = await api.get('/kategori', { params: filters })
    return response.data
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/kategori/${id}`)
    return response.data.data
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await api.post('/kategori', data)
    return response.data.data
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await api.put(`/kategori/${id}`, data)
    return response.data.data
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/kategori/${id}`)
  }
}
