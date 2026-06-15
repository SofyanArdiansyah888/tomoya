import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/order'
import { CreateOrderRequest, OrderFilters, UpdateOrderRequest } from '../types/order'
import { toast } from 'sonner'

export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.getOrders(filters),
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['shift-kasir'] })
      // Refresh product stock after order to reflect stock changes
      queryClient.invalidateQueries({ queryKey: ['product-stocks-by-recipe'] })
      toast.success('Pesanan berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan')
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, uang_dibayar }: { id: number; status: string; uang_dibayar?: number }) => 
      orderService.updateOrderStatus(id, status, uang_dibayar),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] }) 
      queryClient.invalidateQueries({ queryKey: ['unpaid-orders'] })
      queryClient.invalidateQueries({ queryKey: ['shift-kasir'] })
      toast.success('Status pesanan diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status pesanan')
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, orderData }: { id: number; orderData: UpdateOrderRequest | FormData }) => 
      orderService.updateOrder(id, orderData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['unpaid-orders'] })
      queryClient.invalidateQueries({ queryKey: ['shift-kasir'] })
      queryClient.invalidateQueries({ queryKey: ['product-stocks-by-recipe'] })
      toast.success('Pesanan berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui pesanan')
    },
  })
}

export const useUnpaidOrders = (filters?: Omit<OrderFilters, 'status'>) => {
  return useQuery({
    queryKey: ['unpaid-orders', filters],
    queryFn: () => orderService.getUnpaidOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderService.cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      toast.success('Pesanan dibatalkan!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan')
    },
  })
}

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: () => orderService.getOrders(), // fallback to a valid method
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
