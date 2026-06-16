import { useQuery } from '@tanstack/react-query'
import { masterKasService } from '../services/masterKas'
import { MasterKasFilters } from '../types/masterKas'

export const useMasterKas = (filters?: MasterKasFilters) => {
  return useQuery({
    queryKey: ['masterKas', filters],
    queryFn: () => masterKasService.getMasterKas(filters),
    staleTime: 0,
  })
}

export const useMasterKasStats = (filters?: MasterKasFilters) => {
  return useQuery({
    queryKey: ['masterKasStats', filters],
    queryFn: () => masterKasService.getMasterKasStats(filters),
    staleTime: 0,
  })
}

export const useMasterKasFilterOptions = () => {
  return useQuery({
    queryKey: ['masterKasFilterOptions'],
    queryFn: () => masterKasService.getFilterOptions(),
    staleTime: 0,
  })
}
