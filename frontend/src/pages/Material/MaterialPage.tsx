import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { Search, Plus } from 'lucide-react'
import { materialService } from '../../services/material'
import { Material } from '../../types/material'
import { toast } from 'sonner'
import { MaterialTable } from './MaterialTable'
import { MaterialForm } from './MaterialForm'

export const MaterialPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // Material hooks
  const { data: materialsResponse, isLoading } = useQuery({
    queryKey: ['materials', { search: debouncedSearchTerm }],
    queryFn: () => materialService.getMaterials({ search: debouncedSearchTerm }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const materials = materialsResponse?.data?.filter((material: Material) =>
    material.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    material?.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ) || []

  const createMaterial = useMutation({
    mutationFn: (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'category' | 'supplier' | 'recipe_materials' | 'pivot'>) =>
      materialService.createMaterial(materialData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat material')
    },
  })

  const updateMaterial = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Material> }) =>
      materialService.updateMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material', id] })
      toast.success('Material berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui material')
    },
  })

  const deleteMaterial = useMutation({
    mutationFn: (id: number) => materialService.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus material')
    },
  })

  const handleAddMaterial = () => {
    setEditingMaterial(null)
    setIsModalOpen(true)
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setIsModalOpen(true)
  }

  const handleSaveMaterial = async (formData: any) => {
    // Validasi
    if (!formData.name || !formData.name.trim()) {
      toast.error('Harap isi nama material')
      return
    }

    if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
      toast.error('Harap isi harga beli dengan nilai yang valid')
      return
    }

    const submitData = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price),
      min_stock: parseInt(formData.min_stock),
    }

    if (editingMaterial) {
      // Update existing material
      updateMaterial.mutate({ id: editingMaterial.id, data: submitData }, {
        onSuccess: () => {
          toast.success('Material berhasil diperbarui')
          setIsModalOpen(false)
          setEditingMaterial(null)
        },
        onError: (error) => {
          toast.error('Gagal memperbarui material')
          console.error('Error:', error)
        }
      })
    } else {
      // Create new material
      createMaterial.mutate(submitData, {
        onSuccess: () => {
          toast.success('Material berhasil ditambahkan')
          setIsModalOpen(false)
          setEditingMaterial(null)
        },
        onError: (error) => {
          toast.error('Gagal menambahkan material')
          console.error('Error:', error)
        }
      })
    }
  }

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (materialToDelete) {
      deleteMaterial.mutate(materialToDelete.id)
      setIsDeleteModalOpen(false)
      setMaterialToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setMaterialToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMaterial(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Material</h1>
          <p className="text-gray-600">Kelola bahan mentah untuk produksi</p>
        </div>
        <Button onClick={handleAddMaterial} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Material
        </Button>
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

      {/* Material Table */}
      <MaterialTable
        materials={materials}
        isLoading={isLoading}
        onEdit={handleEditMaterial}
        onDelete={handleDeleteClick}
        isSaving={createMaterial.isPending || updateMaterial.isPending}
        isDeleting={deleteMaterial.isPending}
        isDeleteModalOpen={isDeleteModalOpen}
        materialToDelete={materialToDelete}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMaterial ? 'Edit Material' : 'Tambah Material'}
      >
        <MaterialForm
          material={editingMaterial}
          onSubmit={handleSaveMaterial}
          onCancel={handleCloseModal}
          isSaving={createMaterial.isPending || updateMaterial.isPending}
        />
      </Modal>
    </div>
  )
}
