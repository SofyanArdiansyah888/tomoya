import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { Search, Plus } from 'lucide-react'
import { supplierService } from '../../services/supplier'
import { Supplier } from '../../types/purchase'
import { toast } from 'sonner'
import { SupplierTable } from './SupplierTable'
import { SupplierForm } from './SupplierForm'

export const SupplierPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      // Reset to page 1 when search changes
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // Supplier hooks
  const { data: suppliersResponse, isLoading } = useQuery({
    queryKey: ['suppliers', debouncedSearchTerm, currentPage, perPage],
    queryFn: () => supplierService.getSuppliers({ 
      search: debouncedSearchTerm,
      page: currentPage,
      per_page: perPage
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const suppliers = suppliersResponse?.data || []
  const paginationMeta = suppliersResponse?.meta || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null
  }

  const createSupplier = useMutation({
    mutationFn: (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => 
      supplierService.createSupplier(supplierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier berhasil ditambahkan!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan supplier')
    },
  })

  const updateSupplier = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) =>
      supplierService.updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['supplier', id] })
      toast.success('Supplier berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui supplier')
    },
  })

  const deleteSupplier = useMutation({
    mutationFn: (id: number) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus supplier')
    },
  })

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setIsModalOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleSaveSupplier = async (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    // Validasi
    if (!data.nama || !data.alamat) {
      toast.error('Harap isi nama dan alamat supplier')
      return
    }

    setIsSaving(true)
    try {
      if (editingSupplier) {
        // Update existing supplier
        updateSupplier.mutate({ id: editingSupplier.id, data }, {
          onSuccess: () => {
            toast.success('Supplier berhasil diperbarui')
            setIsModalOpen(false)
            setEditingSupplier(null)
          },
          onError: (error) => {
            toast.error('Gagal memperbarui supplier')
            console.error('Error:', error)
          }
        })
      } else {
        // Create new supplier
        createSupplier.mutate(data, {
          onSuccess: () => {
            toast.success('Supplier berhasil ditambahkan')
            setIsModalOpen(false)
            setEditingSupplier(null)
          },
          onError: (error) => {
            toast.error('Gagal menambahkan supplier')
            console.error('Error:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menyimpan supplier')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus supplier "${supplier.nama}"?`)) {
      deleteSupplier.mutate(supplier.id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSupplier(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing per page
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Supplier</h1>
          <p className="text-gray-600">Kelola data supplier</p>
        </div>
        <Button onClick={handleAddSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Supplier
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Supplier Table */}
      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        paginationMeta={paginationMeta}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteSupplier}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        isSaving={isSaving}
        isDeleting={deleteSupplier.isPending}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={"Data Supplier"}
        size="lg"
      >
        <SupplierForm
          supplier={editingSupplier}
          onSave={handleSaveSupplier}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  )
}
