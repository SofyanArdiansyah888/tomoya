import { api } from './api'
import { Produk, Kategori, ProdukFilters } from '../types/product'
import { PaginatedResponse } from '../types/api'

export const productService = {
  async getProducts(filters?: ProdukFilters): Promise<PaginatedResponse<Produk>> {
    const response = await api.get('/produk', { params: filters })
    return response.data
  },

  async getProduct(id: number): Promise<Produk> {
    const response = await api.get(`/produk/${id}`)
    return response.data.data
  },

  async createProduct(productData: Omit<Produk, 'id' | 'created_at' | 'updated_at'>): Promise<Produk> {
    const response = await api.post('/produk', productData)
    return response.data.data
  },

  async updateProduct(id: number, productData: Partial<Produk>): Promise<Produk> {
    const response = await api.put(`/produk/${id}`, productData)
    return response.data.data
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/produk/${id}`)
  },

  async getCategories(): Promise<Kategori[]> {
    const response = await api.get('/kategori')
    return response.data.data
  },

  async getCategory(id: number): Promise<Kategori> {
    const response = await api.get(`/kategori/${id}`)
    return response.data.data
  },

  async createCategory(categoryData: Omit<Kategori, 'id' | 'created_at' | 'updated_at'>): Promise<Kategori> {
    const response = await api.post('/kategori', categoryData)
    return response.data.data
  },

  async updateCategory(id: number, categoryData: Partial<Kategori>): Promise<Kategori> {
    const response = await api.put(`/kategori/${id}`, categoryData)
    return response.data.data
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/kategori/${id}`)
  },

  async toggleFavorite(id: number): Promise<Produk> {
    const response = await api.post(`/produk/${id}/toggle-favorite`)
    return response.data.data
  }
}
