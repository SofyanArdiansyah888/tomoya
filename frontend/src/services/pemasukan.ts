import { api } from './api'
import { 
  Pemasukan, 
  CreatePemasukanRequest, 
  UpdatePemasukanRequest, 
  PemasukanFilters, 
  PemasukanStats 
} from '../types/pemasukan'

export const pemasukanService = {
  async getPemasukans(filters?: PemasukanFilters): Promise<{ data: Pemasukan[] }> {
    const params = new URLSearchParams()
    
    if (filters?.kategori) params.append('kategori', filters.kategori)
    if (filters?.sub_kategori) params.append('sub_kategori', filters.sub_kategori)
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    if (filters?.tanggal_dari) params.append('tanggal_dari', filters.tanggal_dari)
    if (filters?.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/pemasukan?${params.toString()}`)
    return response.data
  },

  async getPemasukan(id: number): Promise<{ data: Pemasukan }> {
    const response = await api.get(`/pemasukan/${id}`)
    return response.data
  },

  async createPemasukan(data: CreatePemasukanRequest): Promise<{ data: Pemasukan }> {
    const response = await api.post('/pemasukan', data)
    return response.data
  },

  async updatePemasukan(id: number, data: UpdatePemasukanRequest): Promise<{ data: Pemasukan }> {
    const response = await api.put(`/pemasukan/${id}`, data)
    return response.data
  },

  async deletePemasukan(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/pemasukan/${id}`)
    return response.data
  },

  async getPemasukanStats(filters?: PemasukanFilters): Promise<PemasukanStats> {
    const params = new URLSearchParams()
    
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    if (filters?.tanggal_dari) params.append('tanggal_dari', filters.tanggal_dari)
    if (filters?.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai)
    
    const response = await api.get(`/pemasukan/statistics?${params.toString()}`)
    return response.data.data
  }
}
