import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { Search, Plus } from 'lucide-react'
import { recipeService } from '../../services/recipe'
import { Recipe } from '../../types/recipe'
import { toast } from 'sonner'
import { ResepTable } from './ResepTable'
import { RecipeForm } from './RecipeForm'

export const ResepPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // Recipe hooks
  const { data: recipesResponse, isLoading } = useQuery({
    queryKey: ['recipes', { search: debouncedSearchTerm }],
    queryFn: () => recipeService.getRecipes({ search: debouncedSearchTerm }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const recipes = recipesResponse?.data || []

  const createRecipe = useMutation({
    mutationFn: (recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'materials' | 'recipe_materials'>) =>
      recipeService.createRecipe(recipeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Resep berhasil dibuat!')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat resep')
    },
  })

  const updateRecipe = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Recipe> }) =>
      recipeService.updateRecipe(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe', id] })
      toast.success('Resep berhasil diperbarui!')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui resep')
    },
  })

  const deleteRecipe = useMutation({
    mutationFn: (id: number) => recipeService.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Resep berhasil dihapus!')
      setIsDeleteModalOpen(false)
      setRecipeToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus resep')
    },
  })

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setIsModalOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleSaveRecipe = async (formData: any) => {
    if (!formData.name || !formData.name.trim()) {
      toast.error('Harap isi nama resep')
      return
    }

    if (editingRecipe) {
      updateRecipe.mutate({ id: editingRecipe.id, data: formData })
    } else {
      createRecipe.mutate(formData)
    }
  }

  const handleDeleteRecipe = (recipe: Recipe) => {
    setRecipeToDelete(recipe)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (recipeToDelete) {
      deleteRecipe.mutate(recipeToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Resep</h1>
          <p className="text-gray-600">Kelola resep dan bahan-bahan resep</p>
        </div>
        <Button onClick={handleAddRecipe} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Resep
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari resep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipes Table */}
      <ResepTable
        recipes={recipes}
        isLoading={isLoading}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteRecipe}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRecipe(null)
        }}
        title={editingRecipe ? 'Edit Resep' : 'Tambah Resep Baru'}
        size="xl"
      >
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleSaveRecipe}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingRecipe(null)
          }}
          isSaving={createRecipe.isPending || updateRecipe.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setRecipeToDelete(null)
        }}
        title="Hapus Resep"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus resep <strong>{recipeToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setRecipeToDelete(null)
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteRecipe.isPending}
            >
              {deleteRecipe.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

