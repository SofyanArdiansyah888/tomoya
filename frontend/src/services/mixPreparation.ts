import { api } from './api'

export interface MixPreparationHeader {
  id: number
  lokasi_id: number
  output_material_id: number
  output_quantity: number
  keterangan?: string
  tanggal: string
}

export const mixPreparationService = {
  async list(lokasiId?: number): Promise<MixPreparationHeader[]> {
    const res = await api.get('/mix-preparation', { params: { lokasi_id: lokasiId } })
    return res.data?.data || []
  },
  async show(id: number): Promise<any> {
    const res = await api.get(`/mix-preparation/${id}`)
    return res.data?.data
  },
}