import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Search } from 'lucide-react'
import { hppService } from '../../services/hpp'
import { HppRecipe, HppRecipeFilters } from '../../types/hpp'
import { HppResepTable } from './HppResepTable'
import { HppResepDetailModal } from './HppResepDetailModal'

export const HppResepPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<HppRecipe | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filters: HppRecipeFilters = debouncedSearchTerm ? {
    search: debouncedSearchTerm,
  } : {}

  const { data: recipesResponse, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['hpp-recipes', filters],
    queryFn: async () => {
      console.log('Fetching HPP recipes with filters:', filters)
      try {
        const result = await hppService.getHppRecipes(filters)
        console.log('HPP Recipes API Response:', result)
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
    console.log('HPP Resep Page mounted, refetching data...')
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle different response structures
  const recipes = Array.isArray(recipesResponse?.data) 
    ? recipesResponse.data 
    : Array.isArray(recipesResponse) 
    ? recipesResponse 
    : []

  // Debug and error handling
  useEffect(() => {
    console.log('HPP Recipes Query State:', {
      isLoading,
      isFetching,
      error,
      rawResponse: recipesResponse,
      recipesResponseData: recipesResponse?.data,
      recipesCount: recipes.length,
      filters,
      isArray: Array.isArray(recipesResponse?.data),
      isArrayResponse: Array.isArray(recipesResponse)
    })
    if (error) {
      console.error('Error loading HPP recipes:', error)
      toast.error('Gagal memuat data HPP Resep')
    }
  }, [error, recipesResponse, isLoading, isFetching, recipes.length, filters])

  const handleViewDetail = (recipe: HppRecipe) => {
    setSelectedRecipe(recipe)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedRecipe(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HPP Resep</h1>
        <p className="text-gray-600">Harga Pokok Penjualan berdasarkan HPP Material</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari resep berdasarkan nama..."
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
                {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data HPP Resep'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HPP Resep Table */}
      <HppResepTable
        recipes={recipes}
        isLoading={isLoading}
        onViewDetail={handleViewDetail}
      />

      {/* Detail Modal */}
      {selectedRecipe && (
        <HppResepDetailModal
          recipe={selectedRecipe}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

