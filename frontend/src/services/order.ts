import { api } from './api'
import { Pesanan, CreateOrderRequest, OrderFilters, UpdateOrderRequest } from '../types/order'

export const orderService = {
  async getOrders(filters?: OrderFilters): Promise<{ data: Pesanan[]; meta: any }> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    // 'status' may not exist on OrderFilters, so check more safely
    if ((filters as any)?.status) params.append('status', (filters as any).status)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await api.get(`/pesanan?${params.toString()}`)
    return response.data
  },

  async getOrder(id: number): Promise<Pesanan> {
    const response = await api.get(`/pesanan/${id}`)
    return response.data.data
  },

  async createOrder(orderData: CreateOrderRequest | FormData): Promise<Pesanan> {
    // If FormData, use multipart/form-data headers
    const config = orderData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {}
    const response = await api.post('/pesanan', orderData, config)
    return response.data.data
  },

  async updateOrderStatus(id: number, status: string, uang_dibayar?: number): Promise<Pesanan> {
    const payload: any = { status }
    if (uang_dibayar !== undefined) {
      payload.uang_dibayar = uang_dibayar
    }
    const response = await api.put(`/pesanan/${id}`, payload)
    return response.data.data
  },

  async updateOrder(id: number, orderData: UpdateOrderRequest | FormData): Promise<Pesanan> {
    // If FormData, use multipart/form-data headers
    const config = orderData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {}
    const response = await api.put(`/pesanan/${id}`, orderData, config)
    return response.data.data
  },

  async getUnpaidOrders(filters?: Omit<OrderFilters, 'status'>): Promise<{ data: Pesanan[]; meta: any }> {
    // Manually build the params with 'status' forced to 'belum_bayar'
    // Without extending incompatible types
    const params: Record<string, any> = { ...filters, status: 'belum_bayar' };
    return this.getOrders(params as OrderFilters);
  },

  async cancelOrder(id: number): Promise<Pesanan> {
    const response = await api.delete(`/pesanan/${id}`)
    return response.data.data
  }

  // Note: Order stats endpoint not available in backend yet
  // async getOrderStats(): Promise<{
  //   total_orders: number;
  //   total_revenue: number;
  //   pending_orders: number;
  //   completed_orders: number;
  // }> {
  //   const response = await api.get('/pesanan/stats/overview')
  //   return response.data.data
  // }
}
