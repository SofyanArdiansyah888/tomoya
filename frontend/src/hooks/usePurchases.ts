import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseService } from '../services/purchase'
import { CreatePurchaseRequest, PurchaseFilters } from '../types/purchase'
import { toast } from 'sonner'

export const usePurchases = (filters?: PurchaseFilters) => {
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => purchaseService.getPurchases(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const usePurchase = (id: number) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.getPurchase(id),
    enabled: !!id,
  })
}

export const useCreatePurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (purchaseData: CreatePurchaseRequest) => 
      purchaseService.createPurchase(purchaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['cash-flows'] })
      toast.success('Pembelian berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat pembelian')
    },
  })
}

export const usePurchaseStats = () => {
  return useQuery({
    queryKey: ['purchase-stats'],
    queryFn: purchaseService.getPurchaseStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
