import { api } from './api'
import { ShiftKasir, BukaKasirRequest, TutupKasirRequest, ShiftDetail, ShiftFilters } from '../types/shift'
import { PaginatedResponse } from '../types/api'

export const shiftService = {
  async bukaKasir(data: BukaKasirRequest): Promise<ShiftKasir> {
    const response = await api.post('/shift-kasir/buka', data)
    return response.data.data
  },

  async tutupKasir(id: number, data: TutupKasirRequest): Promise<ShiftDetail> {
    const response = await api.post(`/shift-kasir/${id}/tutup`, data)
    return response.data.data
  },

  async getCurrentShift(lokasiId?: number): Promise<ShiftKasir | null> {
    const params = lokasiId ? { lokasi_id: lokasiId } : {}
    const response = await api.get('/shift-kasir/current', { params })
    return response.data.data
  },

  async getShifts(filters?: ShiftFilters): Promise<PaginatedResponse<ShiftKasir>> {
    const response = await api.get('/shift-kasir', { params: filters })
    return response.data
  },

  async getShiftDetail(id: number): Promise<ShiftDetail> {
    const response = await api.get(`/shift-kasir/${id}`)
    return response.data.data
  },

  async inputPemasukan(id: number, data: { jumlah: number; metode_pembayaran?: 'cash' | 'card' | 'qris' | 'other' }): Promise<any> {
    const response = await api.post(`/shift-kasir/${id}/input-pemasukan`, data)
    return response.data
  }
}

