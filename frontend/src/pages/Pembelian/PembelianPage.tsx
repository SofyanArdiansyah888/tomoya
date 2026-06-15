import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { SearchInput } from '../../components/ui/search-input'
import { Modal } from '../../components/ui/modal'
import { Plus, Package, Calendar, MapPin, User, CreditCard, FileText } from 'lucide-react'
import { useCreatePurchase, usePurchases, usePurchase } from '../../hooks/usePurchases'
import { materialService } from '../../services/material'
import { supplierService } from '../../services/supplier'
import { SupplierSelect } from '@/components/forms'

import { Pembelian } from '../../types/purchase'
import { toast } from 'sonner'
import { PembelianTable } from './PembelianTable'
import { PembelianForm } from './PembelianForm'

export const PembelianPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [supplierFilter, setSupplierFilter] = useState<number | undefined>()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Pembelian | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [viewingPurchaseId, setViewingPurchaseId] = useState<number | null>(null)

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

  // Data hooks
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getMaterials(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })



  // Fetch purchases with filters
  // Ensure both date_from and date_to are sent when filtering by date
  // When dates are the same, both parameters should still be sent to backend
  const { data: purchasesResponse, isLoading } = usePurchases({
    supplier_id: supplierFilter,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: currentPage,
    per_page: perPage,
  })

  // Fetch detail purchase when viewing
  const { data: viewingPurchase, isLoading: isLoadingDetail } = usePurchase(viewingPurchaseId ?? 0)

  const purchases = purchasesResponse?.data || []
  const paginationMeta = purchasesResponse?.meta || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null
  }

  const createPurchaseMutation = useCreatePurchase()

  const handleAddPurchase = () => {
    setEditingPurchase(null)
    setIsModalOpen(true)
  }

  const handleViewPurchase = (purchase: Pembelian) => {
    setViewingPurchaseId(purchase.id)
  }

  const handleCloseDetailModal = () => {
    setViewingPurchaseId(null)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSupplierFilter(undefined)
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const handleSavePurchase = async (data: {
    supplier_id: number
    lokasi_id: number
    tanggal_pembelian: string
    catatan?: string
    metode_pembayaran: 'cash' | 'transfer'
    items: Array<{
      material_id: number
      quantity: number
      harga_satuan: number
    }>
  }) => {
    // if (!data.supplier_id || !data.lokasi_id || data.items.length === 0) {
    //   toast.error('Harap isi supplier, lokasi, dan minimal 1 item')
    //   return
    // }

    setIsSaving(true)
    createPurchaseMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['purchases'] })
        toast.success('Pembelian berhasil ditambahkan!')
        setIsModalOpen(false)
        setEditingPurchase(null)
        setIsSaving(false)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Gagal menambahkan pembelian')
        setIsSaving(false)
      }
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPurchase(null)
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

  // Filter purchases by search term
  const filteredPurchases = purchases.filter((purchase: Pembelian) => {
    if (!debouncedSearchTerm) return true
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      purchase.no_pembelian?.toLowerCase().includes(searchLower) ||
      purchase.supplier?.nama?.toLowerCase().includes(searchLower) ||
      purchase.catatan?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pembelian</h1>
          <p className="text-gray-600">Kelola pembelian barang dan stok</p>
        </div>
        <Button onClick={handleAddPurchase}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembelian
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SearchInput
                label="Cari Pembelian"
                placeholder="Cari pembelian..."
                value={searchTerm}
                onChange={setSearchTerm}
              />

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <SupplierSelect
                  value={supplierFilter}
                  onValueChange={(value) => {
                    setSupplierFilter(value as number | undefined)
                    setCurrentPage(1)
                  }}
                  placeholder="Semua Supplier"
                  showAllOption={true}
                  allOptionLabel="Semua Supplier"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setCurrentPage(1)
                  }}
                  min={dateFrom || undefined}
                  className="w-full"
                />
              </div>
            </div>
            <div className="pt-7">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pembelian Table */}
      <PembelianTable
        purchases={filteredPurchases}
        isLoading={isLoading}
        paginationMeta={paginationMeta}
        onView={handleViewPurchase}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPurchase ? 'Edit Pembelian' : 'Tambah Pembelian Baru'}
        size="xl"
      >
        <PembelianForm
          purchase={editingPurchase}
          materials={materials?.data || []}
          suppliers={suppliers?.data || []}
          onSave={handleSavePurchase}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!viewingPurchaseId}
        onClose={handleCloseDetailModal}
        title="Detail Pembelian"
        size="xl"
      >
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : viewingPurchase ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>No. Pembelian</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{viewingPurchase.no_pembelian}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Tanggal Pembelian</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(viewingPurchase.tanggal_pembelian).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>User</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{viewingPurchase.user?.name || '-'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Supplier</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{viewingPurchase.supplier?.nama || '-'}</p>
                {viewingPurchase.supplier?.telepon && (
                  <p className="text-sm text-gray-600">{viewingPurchase.supplier.telepon}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>Lokasi</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{viewingPurchase.lokasi?.nama || '-'}</p>
                {viewingPurchase.lokasi?.alamat && (
                  <p className="text-sm text-gray-600">{viewingPurchase.lokasi.alamat}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  <span>Metode Pembayaran</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {viewingPurchase.metode_pembayaran === 'cash' ? 'Brankas' : 'Rekening'}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Total Harga</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(viewingPurchase.total_harga)}
                </p>
              </div>
            </div>

            {/* Catatan */}
            {viewingPurchase.catatan && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Catatan</span>
                </div>
                <p className="text-gray-900">{viewingPurchase.catatan}</p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Item Pembelian</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewingPurchase.items && viewingPurchase.items.length > 0 ? (
                      viewingPurchase.items.map((item, index) => {
                        const material = item.material
                        const subtotal = item.subtotal || (item.quantity * item.harga_satuan)
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {material?.name || 'Material tidak ditemukan'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {material?.sku || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {item.quantity} {material?.unit || 'pcs'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(item.harga_satuan)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(subtotal)}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada item
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {viewingPurchase.items && viewingPurchase.items.length > 0 && (
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Total Pembelian:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(viewingPurchase.total_harga)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Data pembelian tidak ditemukan</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
