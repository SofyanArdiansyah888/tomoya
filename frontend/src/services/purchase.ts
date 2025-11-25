import { api } from './api'
import { Pembelian, CreatePurchaseRequest, PurchaseFilters } from '../types/purchase'

export const purchaseService = {
  async getPurchases(filters?: PurchaseFilters): Promise<{ data: Pembelian[]; meta: any }> {
    const params = new URLSearchParams()
    
    if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString())
    if (filters?.lokasi_id) params.append('lokasi_id', filters.lokasi_id.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/pembelian?${params.toString()}`)
    return response.data
  },

  async getPurchase(id: number): Promise<Pembelian> {
    const response = await api.get(`/pembelian/${id}`)
    return response.data.data
  },

  async createPurchase(purchaseData: CreatePurchaseRequest): Promise<Pembelian> {
    const response = await api.post('/pembelian', purchaseData)
    return response.data.data
  },

  async getPurchaseStats(): Promise<{
    total_pembelian: number;
    total_pengeluaran: number;
  }> {
    const response = await api.get('/pembelian/stats/overview')
    return response.data.data
  }
}
