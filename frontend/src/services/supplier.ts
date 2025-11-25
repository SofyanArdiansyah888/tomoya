import { api } from './api'
import { Supplier } from '../types/purchase'

export const supplierService = {
  async getSuppliers(filters?: {
    search?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ 
    data: Supplier[]; 
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number | null;
      to: number | null;
    };
    links: {
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
  }> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/supplier?${params.toString()}`)
    return response.data
  },

  async getSupplier(id: number): Promise<Supplier> {
    const response = await api.get(`/supplier/${id}`)
    return response.data.data
  },

  async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const response = await api.post('/supplier', supplierData)
    return response.data.data
  },

  async updateSupplier(id: number, supplierData: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put(`/supplier/${id}`, supplierData)
    return response.data.data
  },

  async deleteSupplier(id: number): Promise<void> {
    await api.delete(`/supplier/${id}`)
  }
}
