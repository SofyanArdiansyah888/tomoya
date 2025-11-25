import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { Search, Plus } from 'lucide-react'
import { categoryService } from '../../services/category'
import { Kategori } from '../../types/product'
import { toast } from 'sonner'
import { KategoriTable } from './KategoriTable'
import { CategoryForm } from './CategoryForm'

export const KategoriPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Kategori | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Kategori | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // Category hooks
  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories', debouncedSearchTerm],
    queryFn: () => categoryService.getCategories({ search: debouncedSearchTerm }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const categories = categoriesResponse?.data || []

  const createCategory = useMutation({
    mutationFn: (data: Omit<Kategori, 'id' | 'created_at' | 'updated_at' | 'slug' | 'gambar'>) => 
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat kategori')
    },
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Kategori> }) => 
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui kategori')
    },
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus kategori')
    },
  })

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: Kategori) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleSaveCategory = async (data: Omit<Kategori, 'id' | 'created_at' | 'updated_at' | 'slug' | 'gambar'>) => {
    // Validasi
    if (!data.nama || !data.nama.trim()) {
      toast.error('Harap isi nama kategori')
      return
    }

    setIsSaving(true)
    try {
      if (editingCategory) {
        // Update existing category
        updateCategory.mutate({ id: editingCategory.id, data }, {
          onSuccess: () => {
            toast.success('Kategori berhasil diperbarui')
            setIsModalOpen(false)
            setEditingCategory(null)
          },
          onError: (error) => {
            toast.error('Gagal memperbarui kategori')
            console.error('Error:', error)
          }
        })
      } else {
        // Create new category
        createCategory.mutate(data, {
          onSuccess: () => {
            toast.success('Kategori berhasil ditambahkan')
            setIsModalOpen(false)
            setEditingCategory(null)
          },
          onError: (error) => {
            toast.error('Gagal menambahkan kategori')
            console.error('Error:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Terjadi kesalahan saat menyimpan kategori')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (category: Kategori) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete.id)
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kategori</h1>
          <p className="text-gray-600">Kelola kategori produk</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Table */}
      <KategoriTable
        categories={categories ? (categories as Kategori[]) : []}
        isLoading={isLoading}
        onEdit={handleEditCategory}
        onDelete={handleDeleteClick}
        isSaving={isSaving}
        isDeleting={deleteCategory.isPending}
        isDeleteModalOpen={isDeleteModalOpen}
        categoryToDelete={categoryToDelete}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        size="sm"
      >
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  )
}
