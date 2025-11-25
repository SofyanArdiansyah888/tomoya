import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { hppService } from '../../services/hpp'
import { HppMaterial, HppMaterialFilters } from '../../types/hpp'
import { HppMaterialDetailModal } from './HppMaterialDetailModal'
import { HppMaterialTable } from './HppMaterialTable'

export const HppMaterialPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<HppMaterial | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filters: HppMaterialFilters = debouncedSearchTerm ? {
    search: debouncedSearchTerm,
  } : {}

  const { data: materialsResponse, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['hpp-materials', filters],
    queryFn: async () => {
      console.log('Fetching HPP materials with filters:', filters)
      try {
        const result = await hppService.getHppMaterials(filters)
        console.log('HPP Materials API Response:', result)
        return result
      } catch (err) {
        console.error('Error in queryFn:', err)
        throw err
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  // Force refetch on mount
  useEffect(() => {
    console.log('HPP Material Page mounted, refetching data...')
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle different response structures
  const materials = Array.isArray(materialsResponse?.data) 
    ? materialsResponse.data 
    : Array.isArray(materialsResponse) 
    ? materialsResponse 
    : []

  // Debug and error handling
  useEffect(() => {
    console.log('HPP Materials Query State:', {
      isLoading,
      isFetching,
      error,
      rawResponse: materialsResponse,
      materialsResponseData: materialsResponse?.data,
      materialsCount: materials.length,
      filters,
      isArray: Array.isArray(materialsResponse?.data),
      isArrayResponse: Array.isArray(materialsResponse)
    })
    if (error) {
      console.error('Error loading HPP materials:', error)
      toast.error('Gagal memuat data HPP Material')
    }
  }, [error, materialsResponse, isLoading, isFetching, materials.length, filters])

  const handleViewDetail = (material: HppMaterial) => {
    setSelectedMaterial(material)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedMaterial(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HPP Material</h1>
        <p className="text-gray-600">Harga Pokok Penjualan berdasarkan pembelian terbaru</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari material berdasarkan nama atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error memuat data</p>
              <p className="text-red-600 text-sm mt-1">
                {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data HPP Material'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HPP Material Table */}
      <HppMaterialTable
        materials={materials}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
      />

      {/* Detail Modal */}
      {selectedMaterial && (
        <HppMaterialDetailModal
          material={selectedMaterial}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

