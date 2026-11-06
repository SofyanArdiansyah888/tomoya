import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Search, ArrowDown, Edit } from 'lucide-react'
import { itemLokasiService, produkLokasiService, MaterialStock, ProdukStock } from '../../services/inventory'
import { StokTokoTable } from './StokTokoTable'
import { TransferStokModal } from './TransferStokModal'
import { AdjustStokModal } from './AdjustStokModal'
import { AdjustProdukStokModal } from './AdjustProdukStokModal'
import { toast } from 'sonner'
import { StockDivision, getStockDivisionLabel } from '../../lib/stockDivision'
import { ProdukAdjustmentAlasan } from '../../services/inventory'

interface StokTokoProps {
  division: StockDivision
}

export const StokToko = ({ division }: StokTokoProps) => {
  const isPastry = division === 'pastry'
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const materialQuery = useQuery({
    queryKey: ['item-lokasi-toko', division, debouncedSearchTerm],
    queryFn: () => itemLokasiService.getCurrentStock('toko', undefined, division),
    enabled: !isPastry,
    staleTime: 0,
  })

  const produkQuery = useQuery({
    queryKey: ['produk-lokasi-toko', division, debouncedSearchTerm],
    queryFn: () => produkLokasiService.getCurrentStock('toko', undefined, division),
    enabled: isPastry,
    staleTime: 0,
  })

  const isLoading = isPastry ? produkQuery.isLoading : materialQuery.isLoading
  const materialInventory = (materialQuery.data ?? []) as MaterialStock[]
  const produkInventory = (produkQuery.data ?? []) as ProdukStock[]

  const filteredMaterialInventory = materialInventory.filter((item) => {
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      item.material?.name?.toLowerCase().includes(searchLower) ||
      item.material?.sku?.toLowerCase().includes(searchLower) ||
      item.lokasi?.nama?.toLowerCase().includes(searchLower) ||
      item.lokasi?.kode?.toLowerCase().includes(searchLower)
    )
  })

  const filteredProdukInventory = produkInventory.filter((item) => {
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      item.produk?.nama?.toLowerCase().includes(searchLower) ||
      item.produk?.kode?.toLowerCase().includes(searchLower) ||
      item.produk?.kategori?.nama?.toLowerCase().includes(searchLower) ||
      item.lokasi?.nama?.toLowerCase().includes(searchLower) ||
      item.lokasi?.kode?.toLowerCase().includes(searchLower)
    )
  })

  const filteredInventory = isPastry ? filteredProdukInventory : filteredMaterialInventory

  const totalItems = filteredInventory.length
  const lowStockItems = isPastry
    ? filteredProdukInventory.filter(
        (item) => typeof item.quantity === 'number' && item.quantity <= (item.min_stock_level ?? 0)
      ).length
    : filteredMaterialInventory.filter(
        (item) =>
          item.material &&
          typeof item.quantity === 'number' &&
          item.quantity <= (item.material.min_stock || 0)
      ).length
  const outOfStockItems = filteredInventory.filter(
    (item) => typeof item.quantity === 'number' && item.quantity <= 0
  ).length
  const totalQuantity = filteredInventory.reduce(
    (sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0),
    0
  )

  const invalidateStockQueries = () => {
    if (isPastry) {
      queryClient.invalidateQueries({ queryKey: ['produk-lokasi-toko', division] })
    } else {
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-toko', division] })
    }
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
      invalidateStockQueries()
      queryClient.invalidateQueries({ queryKey: ['item-lokasi-gudang'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      setIsTransferModalOpen(false)
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
        lokasi_id: 2,
        material_id: data.material_id,
        quantity: data.quantity,
        keterangan: data.keterangan,
      })
      toast.success('Adjustment stok berhasil dilakukan')
      invalidateStockQueries()
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      setIsAdjustModalOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan adjustment stok')
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleAdjustProduk = async (data: {
    produk_id: number
    quantity: number
    alasan: ProdukAdjustmentAlasan
    keterangan?: string
  }) => {
    setIsAdjusting(true)
    try {
      await produkLokasiService.adjustProdukStock({
        lokasi_id: 2,
        produk_id: data.produk_id,
        quantity: data.quantity,
        alasan: data.alasan,
        keterangan: data.keterangan,
      })
      toast.success('Adjustment stok pastry berhasil dilakukan')
      invalidateStockQueries()
      queryClient.invalidateQueries({ queryKey: ['produk-stock-movements'] })
      setIsAdjustModalOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan adjustment stok pastry')
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stok Toko {getStockDivisionLabel(division)}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isPastry
            ? 'Pantau dan sesuaikan stok produk jadi pastry/cake di toko'
            : `Kelola dan pantau stok material ${getStockDivisionLabel(division).toLowerCase()} di toko`}
        </p>
      </div>

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

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={isPastry ? 'Cari produk atau toko...' : 'Cari material atau toko...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          {isPastry ? (
            <Button onClick={() => setIsAdjustModalOpen(true)} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Adjustment Stok
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Ambil dari Gudang
              </Button>
              <Button onClick={() => setIsAdjustModalOpen(true)} variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Adjustment Stok
              </Button>
            </>
          )}
          </div>
        </CardContent>
      </Card>

      <StokTokoTable
        mode={isPastry ? 'produk' : 'material'}
        inventory={filteredInventory}
        isLoading={isLoading}
      />

      {!isPastry ? (
        <>
          <TransferStokModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            onTransfer={handleTransfer}
            isLoading={isTransferring}
            stockDivision={division}
          />
          <AdjustStokModal
            isOpen={isAdjustModalOpen}
            onClose={() => setIsAdjustModalOpen(false)}
            onAdjust={handleAdjust}
            isLoading={isAdjusting}
            lokasiType="toko"
            defaultLokasiId={2}
            stockDivision={division}
          />
        </>
      ) : (
        <AdjustProdukStokModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          onAdjust={handleAdjustProduk}
          isLoading={isAdjusting}
          defaultLokasiId={2}
        />
      )}
    </div>
  )
}
