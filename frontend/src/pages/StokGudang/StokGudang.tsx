import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { Search, Edit } from 'lucide-react'
import { itemLokasiService, MaterialStock } from '../../services/inventory'
import { materialService } from '../../services/material'
import { StokGudangTable } from './StokGudangTable'
import { MaterialSelect } from '../../components/forms'
import { toast } from 'sonner'

export const StokGudang = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  const queryClient = useQueryClient()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch warehouse inventory (material stock from item_lokasi)
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['item-lokasi-gudang', debouncedSearchTerm],
    queryFn: () => itemLokasiService.getCurrentStock('gudang'),
    staleTime: 0, // 2 minutes
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

  const handleOpenAdjustModal = () => {
    setIsAdjustModalOpen(true)
  }

  const handleCloseAdjustModal = () => {
    setIsAdjustModalOpen(false)
  }

  const handleAdjust = async (data: {
    material_id: number
    quantity: number
    keterangan: string
  }) => {
    setIsAdjusting(true)
    try {
      await itemLokasiService.adjustGudangStock({
        lokasi_id: 1, // Default gudang id
        material_id: data.material_id,
        quantity: data.quantity,
        keterangan: data.keterangan,
      })

      toast.success('Adjustment stok gudang berhasil dilakukan')
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-gudang'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      handleCloseAdjustModal()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan adjustment stok gudang')
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stok Gudang</h1>
        <p className="text-sm text-gray-600 mt-1">
          Kelola dan pantau stok material di semua gudang
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
                placeholder="Cari material atau gudang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleOpenAdjustModal} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Adjustment Stok
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <StokGudangTable inventory={filteredInventory} isLoading={isLoading} />

      {/* Adjustment Modal */}
      <AdjustStokModal
        isOpen={isAdjustModalOpen}
        onClose={handleCloseAdjustModal}
        onAdjust={handleAdjust}
        isLoading={isAdjusting}
        lokasiType="gudang"
        defaultLokasiId={1}
        inventory={inventory}
      />
    </div>
  )
}

// Adjustment Stock Modal Component
interface AdjustStokModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (data: { material_id: number; quantity: number; keterangan: string }) => void
  isLoading: boolean
  lokasiType: 'gudang' | 'toko'
  defaultLokasiId: number
  inventory?: MaterialStock[]
}

const AdjustStokModal = ({
  isOpen,
  onClose,
  onAdjust,
  isLoading,
  lokasiType,
  defaultLokasiId,
  inventory = []
}: AdjustStokModalProps) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [stockData, setStockData] = useState<MaterialStock[]>([])
  const [loadingStock, setLoadingStock] = useState(false)

  // Fetch materials list
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getMaterials(),
  })

  const materials = materialsData?.data || []

  // Fetch current stock when material is selected - similar to TransferStokModal pattern
  useEffect(() => {
    if (selectedMaterialId) {
      // If inventory is provided, use it directly (no need to fetch)
      if (inventory.length > 0) {
        setStockData(inventory)
        setLoadingStock(false)
        return
      }
      
      // Otherwise fetch from API
      setLoadingStock(true)
      itemLokasiService.getCurrentStock(lokasiType, defaultLokasiId)
        .then((data: MaterialStock[]) => {
          setStockData(data || [])
        })
        .catch(() => {
          setStockData([])
        })
        .finally(() => setLoadingStock(false))
    } else {
      setStockData([])
      setLoadingStock(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterialId])

  // Get current stock for selected material at default location
  const currentStock = selectedMaterialId
    ? stockData.find((stock) => stock.material_id == selectedMaterialId && stock.lokasi_id === defaultLokasiId)?.quantity ?? 0
    : 0

  // Get selected material info
  const selectedMaterial = materials.find((m) => m.id == selectedMaterialId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterialId || !quantity || !keterangan.trim()) return

    const qty = parseInt(quantity)
    if (qty === 0) {
      toast.error('Quantity tidak boleh 0')
      return
    }

    // Calculate new stock after adjustment
    const newStock = currentStock + qty
    if (newStock < 0) {
      toast.error(`Stok tidak boleh negatif. Stok saat ini: ${currentStock}`)
      return
    }

    onAdjust({
      material_id: Number(selectedMaterialId),
      quantity: qty,
      keterangan: keterangan.trim(),
    })
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMaterialId('')
      setQuantity('')
      setKeterangan('')
      setStockData([])
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjustment Stok ${lokasiType === 'gudang' ? 'Gudang' : 'Toko'}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pilih Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Material *
          </label>
          <MaterialSelect
            value={selectedMaterialId ? String(selectedMaterialId) : ''}
            onChange={(value) => {
              setSelectedMaterialId(value ? Number(value) : '')
              setQuantity('')
            }}
            placeholder="Pilih Material"
            searchable={true}
          />
        </div>

        {/* Current Stock Info */}
        {selectedMaterialId && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Material</div>
              <div className="text-lg font-semibold text-gray-900">{selectedMaterial?.name}</div>
              <div className="text-sm text-gray-500">SKU: {selectedMaterial?.sku}</div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">Satuan</div>
                <div className="text-base font-medium text-gray-900">{selectedMaterial?.unit_gudang || '-'}</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                {loadingStock ? (
                  <span>Mengambil stok gudang...</span>
                ) : (
                  <>
                    Stok Quantity Gudang: <span className="font-semibold">{currentStock} {selectedMaterial?.unit_gudang || ''}</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quantity Adjustment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Adjustment *
          </label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Masukkan quantity (positif untuk tambah, negatif untuk kurang)"
            required
            disabled={!selectedMaterialId || loadingStock}
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan angka positif untuk menambah stok, negatif untuk mengurangi stok
          </p>
          {selectedMaterialId && quantity && !isNaN(parseInt(quantity)) && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <div className="text-sm text-blue-800">
                Stok Quantity Gudang Setelah Adjustment: <span className="font-semibold">
                  {currentStock + parseInt(quantity)} {selectedMaterial?.unit_gudang || ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan / Alasan *
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Masukkan alasan adjustment (wajib)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading || !selectedMaterialId || !quantity || !keterangan.trim()}>
            {isLoading ? 'Memproses...' : 'Simpan Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

