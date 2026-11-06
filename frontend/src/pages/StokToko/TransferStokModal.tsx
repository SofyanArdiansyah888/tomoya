import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NumericInput } from '../../components/ui/NumericInput'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { itemLokasiService } from '../../services/inventory'
import { materialService } from '../../services/material'
import { MaterialSelect } from '../../components/forms'
import { toast } from 'sonner'
import { StockDivision } from '../../lib/stockDivision'

interface TransferStokModalProps {
  isOpen: boolean
  onClose: () => void
  onTransfer: (data: { lokasi_tujuan_id: number; material_id: number; quantity: number; keterangan?: string }) => void
  isLoading: boolean
  stockDivision?: StockDivision
}

export const TransferStokModal = ({
  isOpen,
  onClose,
  onTransfer,
  isLoading,
  stockDivision
}: TransferStokModalProps) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [gudangStock, setGudangStock] = useState<any[]>([])
  const [loadingGudangStock, setLoadingGudangStock] = useState(false)

  // Default toko id = 2, gudang id = 1 (handled in backend)
  const DEFAULT_TOKO_ID = 2

  // Fetch materials list
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getMaterials(),
  })

  const materials = materialsData?.data || []

  // Fetch gudang stock only for selected material and only when material changes
  useEffect(() => {
    if (selectedMaterialId) {
      setLoadingGudangStock(true)
      itemLokasiService.getCurrentStock('gudang')
        .then((data: any[]) => {
          setGudangStock(data || [])
        })
        .finally(() => setLoadingGudangStock(false))
    } else {
      setGudangStock([])
    }
  }, [selectedMaterialId])

  
  // Calculate total available stock from all gudang for current selected material
  const availableStock = selectedMaterialId
    ? gudangStock.reduce(
        (sum, stock) =>
          stock.material_id == Number(selectedMaterialId) ? sum + (stock.quantity ?? 0) : sum,
        0
      )
    : 0
    

  // Get selected material info
  const selectedMaterial = materials.find((m) => m.id === Number(selectedMaterialId))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterialId || !quantity) return

    const qty = parseInt(quantity)
    if (qty <= 0) {
      toast.error('Quantity harus lebih dari 0')
      return
    }

    if (qty > availableStock) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`)
      return
    }

    onTransfer({
      lokasi_tujuan_id: DEFAULT_TOKO_ID,
      material_id: Number(selectedMaterialId),
      quantity: qty,
      keterangan: keterangan || undefined,
    })
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedMaterialId('')
      setQuantity('')
      setKeterangan('')
      setGudangStock([])
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ambil Stok dari Gudang" size="md">
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
            stockDivision={stockDivision}
          />
        </div>

        {/* Material Info & Available Gudang Stock */}
        {selectedMaterialId && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Material</div>
              <div className="text-lg font-semibold text-gray-900">{selectedMaterial?.name}</div>
              
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                {loadingGudangStock ? (
                  <span>Mengambil stok gudang...</span>
                ) : (
                  <>
                    Stok Tersedia di Gudang <span className="font-semibold">(quantity_gudang)</span>: <span className="font-semibold">{availableStock} {selectedMaterial?.unit_gudang || ''}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Stok akan diambil dari gudang default secara otomatis
              </div>
              {selectedMaterialId && quantity && !isNaN(Number(quantity)) && (
                <div className="mt-2 p-2 bg-blue-100 rounded">
                  <div className="text-xs text-blue-900">
                    <span>Sebelum transfer: </span>
                    <span className="font-semibold">{availableStock}</span>
                    <span> {selectedMaterial?.unit_gudang || ''} (quantity_gudang_before)</span>
                    <br />
                    <span>Setelah transfer: </span>
                    <span className="font-semibold">{availableStock - parseInt(quantity)}</span>
                    <span> {selectedMaterial?.unit_gudang || ''} (quantity_gudang_after)</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <NumericInput
            asString
            value={quantity}
            onChange={setQuantity}
            placeholder="Masukkan quantity"
            required
            disabled={!selectedMaterialId || loadingGudangStock}
          />
          {selectedMaterialId && (
            <p className="text-xs text-gray-500 mt-1">
              Maksimal: {availableStock} {selectedMaterial?.unit_gudang || ''}
            </p>
          )}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Tambahkan keterangan (opsional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading || !selectedMaterialId || !quantity || loadingGudangStock}>
            {isLoading ? 'Memproses...' : 'Transfer Stok'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
