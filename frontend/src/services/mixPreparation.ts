import { api } from './api'
import { StockDivision } from '@/lib/stockDivision'

export interface MixPreparationHeader {
  id: number
  no_mix_preparation: string
  lokasi_id: number
  output_material_id?: number | null
  output_produk_id?: number | null
  output_type?: 'material' | 'produk'
  output_quantity: number
  keterangan?: string
  tanggal: string
  output_material?: { id: number; name: string; sku: string; unit: string }
  output_produk?: { id: number; nama: string; kode: string }
  lokasi?: { id: number; nama: string; tipe: 'gudang' | 'toko' }
  user?: { id: number; name: string; email?: string }
}

export interface MixPreparationListParams {
  lokasi_id?: number
  date_from?: string
  date_to?: string
  stock_division?: StockDivision
}

export const mixPreparationService = {
  async list(params?: MixPreparationListParams): Promise<MixPreparationHeader[]> {
    const res = await api.get('/mix-preparation', { params })
    return res.data?.data || []
  },
  async show(id: number): Promise<any> {
    const res = await api.get(`/mix-preparation/${id}`)
    return res.data?.data
  },
}
