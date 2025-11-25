import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Search, ArrowDown, Edit } from 'lucide-react'
import { itemLokasiService, MaterialStock } from '../../services/inventory'
import { StokTokoTable } from './StokTokoTable'
import { TransferStokModal } from './TransferStokModal'
import { AdjustStokModal } from './AdjustStokModal'
import { toast } from 'sonner'

export const StokToko = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  const queryClient = useQueryClient()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch shop inventory (material stock from item_lokasi)
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['item-lokasi-toko', debouncedSearchTerm],
    queryFn: () => itemLokasiService.getCurrentStock('toko'),
    staleTime: 0
  })


  // Filter inventory by search term
  const filteredInventory = inventory.filter((item: MaterialStock) => {
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      item.material?.name?.toLowerCase().includes(searchLower) ||
      item.material?.sku?.toLowerCase().includes(searchLower) ||
      item.lokasi?.nama?.toLowerCase().includes(searchLower) ||
      item.lokasi?.kode?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate statistics
  const totalItems = filteredInventory.length
  const lowStockItems = filteredInventory.filter(
    (item: MaterialStock) =>
      item.material &&
      typeof item.quantity === 'number' &&
      item.quantity <= (item.material.min_stock || 0)
  ).length
  const outOfStockItems = filteredInventory.filter(
    (item: MaterialStock) =>
      typeof item.quantity === 'number' && item.quantity <= 0
  ).length
  const totalQuantity = filteredInventory.reduce(
    (sum: number, item: MaterialStock) => sum + (typeof item.quantity === 'number' ? item.quantity : 0),
    0
  )

  const handleOpenTransferModal = () => {
    setIsTransferModalOpen(true)
  }

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false)
  }

  const handleOpenAdjustModal = () => {
    setIsAdjustModalOpen(true)
  }

  const handleCloseAdjustModal = () => {
    setIsAdjustModalOpen(false)
  }

  const handleTransfer = async (data: {
    lokasi_tujuan_id: number
    material_id: number
    quantity: number
    keterangan?: string
  }) => {
    setIsTransferring(true)
    try {
      await itemLokasiService.transferStock({
        lokasi_tujuan_id: data.lokasi_tujuan_id,
        material_id: data.material_id,
        quantity: data.quantity,
        keterangan: data.keterangan,
      })

      toast.success('Transfer stok berhasil dilakukan')
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-toko'] })
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-gudang'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      handleCloseTransferModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan transfer stok')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleAdjust = async (data: {
    material_id: number
    quantity: number
    keterangan: string
  }) => {
    setIsAdjusting(true)
    try {
      await itemLokasiService.adjustStock({
        lokasi_id: 2, // Default toko id
        material_id: data.material_id,
        quantity: data.quantity,
        keterangan: data.keterangan,
      })

      toast.success('Adjustment stok berhasil dilakukan')
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-toko'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      handleCloseAdjustModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan adjustment stok')
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stok Toko</h1>
        <p className="text-sm text-gray-600 mt-1">
          Kelola dan pantau stok material di semua toko
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Item</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Stok</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalQuantity.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Stok Rendah</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Stok Habis</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{outOfStockItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari material atau toko..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleOpenTransferModal} className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Ambil dari Gudang
            </Button>
            <Button onClick={handleOpenAdjustModal} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Adjustment Stok
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <StokTokoTable 
        inventory={filteredInventory} 
        isLoading={isLoading}
      />

      {/* Transfer Modal */}
      <TransferStokModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        onTransfer={handleTransfer}
        isLoading={isTransferring}
      />

      {/* Adjustment Modal */}
      <AdjustStokModal
        isOpen={isAdjustModalOpen}
        onClose={handleCloseAdjustModal}
        onAdjust={handleAdjust}
        isLoading={isAdjusting}
        lokasiType="toko"
        defaultLokasiId={2}
      />
    </div>
  )
}

