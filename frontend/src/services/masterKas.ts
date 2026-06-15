import { MasterKas, MasterKasFilters, MasterKasStats, MasterKasFilterOptions } from '../types/masterKas';
import { api } from './api';

export const masterKasService = { 
  async getMasterKas(filters?: MasterKasFilters): Promise<{ data: MasterKas[]; meta: any }> {
    const params = new URLSearchParams()

    if (filters?.jenis) params.append('jenis', filters.jenis)
    if (filters?.kategori) params.append('kategori', filters.kategori)
    if (filters?.sub_kategori) params.append('sub_kategori', filters.sub_kategori)
    if (filters?.lokasi_id) params.append('lokasi_id', filters.lokasi_id.toString())
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.status !== undefined) params.append('status', String(filters.status))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())

    const response = await api.get(`/master-kas?${params.toString()}`)
    return response.data
  },

  async getMasterKasStats(filters?: MasterKasFilters): Promise<MasterKasStats> {
    const params = new URLSearchParams()

    if (filters?.lokasi_id) params.append('lokasi_id', filters.lokasi_id.toString())
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.status !== undefined) params.append('status', String(filters.status))

    const response = await api.get(`/master-kas/stats?${params.toString()}`)
    return response.data.data
  },

  async getFilterOptions(): Promise<MasterKasFilterOptions> {
    const response = await api.get('/master-kas/filter-options')
    return response.data.data
  },
}
