import { ArusKas, CashFlowFilters, CashFlowStats, FilterOptions } from '../types/cashflow';
import { api } from './api';

export const cashFlowService = {
  async getCashFlows(filters?: CashFlowFilters): Promise<{ data: ArusKas[]; meta: any }> {
    const params = new URLSearchParams()
    
    if (filters?.jenis) params.append('jenis', filters.jenis)
    if (filters?.kategori) params.append('kategori', filters.kategori)
    if (filters?.sub_kategori) params.append('sub_kategori', filters.sub_kategori)
    if (filters?.lokasi_id) params.append('lokasi_id', filters.lokasi_id.toString())
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString()) // Keep for backward compatibility
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.status !== undefined) params.append('status', String(filters.status))
    if (filters?.masuk_master_kas !== undefined) params.append('masuk_master_kas', String(filters.masuk_master_kas))
    if (filters?.search) params.append('search', filters.search) 
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/arus-kas?${params.toString()}`)
    return response.data
  },

  async getCashFlowStats(filters?: CashFlowFilters): Promise<CashFlowStats> {
    const params = new URLSearchParams()
    
    if (filters?.lokasi_id) params.append('lokasi_id', filters.lokasi_id.toString())
    if (filters?.toko_id) params.append('toko_id', filters.toko_id.toString()) // Keep for backward compatibility
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.status !== undefined) params.append('status', String(filters.status))
    
    const response = await api.get(`/arus-kas/stats?${params.toString()}`)
    return response.data.data
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get('/arus-kas/filter-options')
    return response.data.data
  },

  async syncToMasterKas(ids: number[], action: 'add' | 'remove'): Promise<{ message: string; processed: number; errors: string[] }> {
    const response = await api.post('/arus-kas/sync-master-kas', { ids, action })
    return response.data
  },
}
