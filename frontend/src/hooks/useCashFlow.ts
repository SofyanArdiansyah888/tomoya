import { useQuery } from '@tanstack/react-query'
import { cashFlowService } from '../services/cashflow'
import { CashFlowFilters } from '../types/cashflow'

export const useCashFlows = (filters?: CashFlowFilters) => {
  return useQuery({
    queryKey: ['cashFlows', filters],
    queryFn: () => cashFlowService.getCashFlows(filters),
    staleTime: 0, // 2 minutes
  })
}

export const useCashFlowStats = (filters?: CashFlowFilters) => {
  return useQuery({
    queryKey: ['cashFlowStats', filters],
    queryFn: () => cashFlowService.getCashFlowStats(filters),
    staleTime: 0, // 2 minutes
  })
}

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['cashFlowFilterOptions'],
    queryFn: () => cashFlowService.getFilterOptions(),
    staleTime: 0, // 2 minutes
  })
}