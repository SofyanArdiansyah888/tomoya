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

interface AdjustStokModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (data: { material_id: number; quantity: number; keterangan: string }) => void
  isLoading: boolean
  lokasiType: 'gudang' | 'toko'
  defaultLokasiId: number
  stockDivision?: StockDivision
}

export const AdjustStokModal = ({
  isOpen,
  onClose,
  onAdjust,
  isLoading,
  lokasiType,
  defaultLokasiId,
  stockDivision
}: AdjustStokModalProps) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [keterangan, setKeterangan] = useState('')

  // Fetch materials list
  const { data: materialsData } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getMaterials(),
    staleTime: 1000 * 60 * 5,
  })

  const materials = materialsData?.data || []

  // Fetch current stock for selected material
  const { data: currentStockData = [] } = useQuery({
    queryKey: [`item-lokasi-${lokasiType}-for-adjust`, selectedMaterialId],
    queryFn: () => itemLokasiService.getCurrentStock(lokasiType),
    enabled: !!selectedMaterialId,
    staleTime: 1000 * 60 * 1,
  })

  // Get current stock for selected material at default location
  const currentStock = selectedMaterialId
    ? currentStockData.find((stock) => stock.material_id == selectedMaterialId && stock.lokasi_id === defaultLokasiId)?.quantity || 0
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
            stockDivision={stockDivision}
          />
        </div>

        {/* Current Stock Info */}
        {selectedMaterialId && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Material</div>
            <div className="text-lg font-semibold text-gray-900">{selectedMaterial?.name}</div>
            <div className="text-sm text-gray-500">SKU: {selectedMaterial?.sku}</div>
            <div className="text-sm text-gray-500 mt-1">
              Stok Saat Ini: <span className="font-medium">{currentStock} {selectedMaterial?.unit || ''}</span>
            </div>
          </div>
        )}

        {/* Quantity Adjustment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Adjustment *
          </label>
          <NumericInput
            asString
            allowNegative
            value={quantity}
            onChange={setQuantity}
            placeholder="Masukkan quantity (positif untuk tambah, negatif untuk kurang)"
            required
            disabled={!selectedMaterialId}
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan angka positif untuk menambah stok, negatif untuk mengurangi stok
          </p>
          {selectedMaterialId && quantity && !isNaN(parseInt(quantity)) && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <div className="text-sm text-blue-800">
                Stok Setelah Adjustment: <span className="font-semibold">
                  {currentStock + parseInt(quantity)} {selectedMaterial?.unit || ''}
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

