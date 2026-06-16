import axios from 'axios'
import { getApiBaseUrl } from '../utils/apiUrl'

export interface PublicPesananItem {
  quantity: number
  harga_satuan: number
  subtotal: number
  coffee_strength?: string
  catatan?: string
  produk?: {
    nama: string
  } | null
} 

export interface PublicPesanan {
  no_pesanan: string
  status: 'bayar' | 'belum_bayar'
  payment_status: 'bayar' | 'belum_bayar'
  metode_pembayaran: 'cash' | 'card' | 'qris' | 'other'
  nama_client?: string
  subtotal?: number
  total_jumlah: number
  tanggal_penjualan?: string
  created_at: string
  items?: PublicPesananItem[]
  lokasi?: {
    nama: string
  }
}

const publicApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const publicOrderService = {
  async getLatestOrder(): Promise<PublicPesanan | null> {
    const response = await publicApi.get<{ data: PublicPesanan | null }>('/public/pesanan/terbaru')
    return response.data.data
  },
}
