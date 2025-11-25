import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { Search, Plus } from 'lucide-react'
import { productService } from '../../services/products'
import { Produk } from '../../types/product'
import { toast } from 'sonner'
import { ProdukTable } from './ProdukTable'
import { ProductForm } from './ProductForm'

export const ProdukPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Produk | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // Product hooks
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', { search: debouncedSearchTerm }],
    queryFn: () => productService.getProducts({ search: debouncedSearchTerm }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const products = productsResponse?.data || []

  const createProduct = useMutation({
    mutationFn: (productData: Omit<Produk, 'id' | 'created_at' | 'updated_at' | 'kategori'> & { kategori_id: number }) =>
      productService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat produk')
    },
  })

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Produk> }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Produk berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui produk')
    },
  })

  const deleteProduct = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk')
    },
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Produk) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (data: Omit<Produk, 'id' | 'created_at' | 'updated_at' | 'kategori'> & { kategori_id: number }) => {
    // Validasi field wajib
    if (!data.nama || !data.nama.trim()) {
      toast.error('Harap isi nama produk')
      return
    }

    if (!data.harga || data.harga <= 0) {
      toast.error('Harap isi harga produk dengan nilai yang valid')
      return
    }

    if (!data.kategori_id) {
      toast.error('Harap pilih kategori produk')
      return
    }

    setIsSaving(true)
    try {
      if (editingProduct) {
        // Update existing product
        updateProduct.mutate({ id: editingProduct.id, data }, {
          onSuccess: () => {
            toast.success('Produk berhasil diperbarui')
            setIsModalOpen(false)
            setEditingProduct(null)
            setIsSaving(false)
          },
          onError: (error) => {
            toast.error('Gagal memperbarui produk')
            console.error('Error:', error)
            setIsSaving(false)
          }
        })
      } else {
        // Create new product
        createProduct.mutate(data, {
          onSuccess: () => {
            toast.success('Produk berhasil ditambahkan')
            setIsModalOpen(false)
            setEditingProduct(null)
            setIsSaving(false)
          },
          onError: (error) => {
            toast.error('Gagal menambahkan produk')
            console.error('Error:', error)
            setIsSaving(false)
          }
        })
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Terjadi kesalahan saat menyimpan produk')
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (product: Produk) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete.id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setProductToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Produk</h1>
          <p className="text-gray-600">Kelola produk makanan dan minuman</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Table */}
      <ProdukTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteClick}
        isSaving={isSaving}
        isDeleting={deleteProduct.isPending}
        isDeleteModalOpen={isDeleteModalOpen}
        productToDelete={productToDelete}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  )
}
