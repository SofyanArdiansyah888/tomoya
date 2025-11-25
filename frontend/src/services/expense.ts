import { api } from './api'
import { 
  Pengeluaran, 
  CreatePengeluaranRequest, 
  UpdatePengeluaranRequest, 
  PengeluaranFilters, 
  PengeluaranStats 
} from '../types/expense'

export const expenseService = {
  async getPengeluarans(filters?: PengeluaranFilters): Promise<{ data: Pengeluaran[] }> {
    const params = new URLSearchParams()
    
    if (filters?.kategori) params.append('kategori', filters.kategori)
    if (filters?.sub_kategori) params.append('sub_kategori', filters.sub_kategori)
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    // Removed because 'status' does not exist on type 'PengeluaranFilters'
    if (filters?.tanggal_dari) params.append('tanggal_dari', filters.tanggal_dari)
    if (filters?.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    if (filters?.exclude_kategori) params.append('exclude_kategori', filters.exclude_kategori)
    
    const response = await api.get(`/pengeluaran?${params.toString()}`)
    return response.data
  },

  async getPengeluaran(id: number): Promise<{ data: Pengeluaran }> {
    const response = await api.get(`/pengeluaran/${id}`)
    return response.data
  },

  async createPengeluaran(data: CreatePengeluaranRequest): Promise<{ data: Pengeluaran }> {
    const response = await api.post('/pengeluaran', data)
    return response.data
  },

  async updatePengeluaran(id: number, data: UpdatePengeluaranRequest): Promise<{ data: Pengeluaran }> {
    const response = await api.put(`/pengeluaran/${id}`, data)
    return response.data
  },

  async deletePengeluaran(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/pengeluaran/${id}`)
    return response.data
  },

  async getPengeluaranStats(filters?: PengeluaranFilters): Promise<PengeluaranStats> {
    const params = new URLSearchParams()
    
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    if (filters?.tanggal_dari) params.append('tanggal_dari', filters.tanggal_dari)
    if (filters?.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai)
    if (filters?.exclude_kategori) params.append('exclude_kategori', filters.exclude_kategori)
    
    const response = await api.get(`/pengeluaran/statistics?${params.toString()}`)
    return response.data.data
  }
}
