import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NumericInput } from '../../components/ui/NumericInput'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'
import { produkLokasiService, ProdukAdjustmentAlasan } from '../../services/inventory'
import { ProdukSelect } from '../../components/forms'
import { toast } from 'sonner'

const ALASAN_OPTIONS: { value: ProdukAdjustmentAlasan; label: string }[] = [
  { value: 'rusak', label: 'Rusak' },
  { value: 'konsumsi_owner', label: 'Konsumsi Owner' },
  { value: 'koreksi', label: 'Koreksi' },
  { value: 'lainnya', label: 'Lainnya' },
]

interface AdjustProdukStokModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (data: {
    produk_id: number
    quantity: number
    alasan: ProdukAdjustmentAlasan
    keterangan?: string
  }) => void
  isLoading: boolean
  defaultLokasiId: number
}

export const AdjustProdukStokModal = ({
  isOpen,
  onClose,
  onAdjust,
  isLoading,
  defaultLokasiId,
}: AdjustProdukStokModalProps) => {
  const [selectedProdukId, setSelectedProdukId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [alasan, setAlasan] = useState<ProdukAdjustmentAlasan | ''>('')
  const [keterangan, setKeterangan] = useState('')

  const { data: currentStockData = [] } = useQuery({
    queryKey: ['produk-lokasi-toko-for-adjust', defaultLokasiId],
    queryFn: () => produkLokasiService.getCurrentStock('toko', defaultLokasiId, 'pastry'),
    enabled: isOpen,
    staleTime: 1000 * 60 * 1,
  })

  const currentStock = selectedProdukId
    ? currentStockData.find(
        (stock) => stock.produk_id === selectedProdukId && stock.lokasi_id === defaultLokasiId
      )?.quantity ?? 0
    : 0

  const selectedProduk = selectedProdukId
    ? currentStockData.find((stock) => stock.produk_id === selectedProdukId)?.produk
    : undefined

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProdukId || !quantity || !alasan) return

    const qty = parseInt(quantity)
    if (qty === 0) {
      toast.error('Quantity tidak boleh 0')
      return
    }

    if (alasan === 'lainnya' && !keterangan.trim()) {
      toast.error('Keterangan wajib diisi untuk alasan Lainnya')
      return
    }

    const newStock = currentStock + qty
    if (newStock < 0) {
      toast.error(`Stok tidak boleh negatif. Stok saat ini: ${currentStock}`)
      return
    }

    onAdjust({
      produk_id: Number(selectedProdukId),
      quantity: qty,
      alasan,
      keterangan: keterangan.trim() || undefined,
    })
  }

  useEffect(() => {
    if (!isOpen) {
      setSelectedProdukId('')
      setQuantity('')
      setAlasan('')
      setKeterangan('')
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjustment Stok Pastry" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Produk *
          </label>
          <ProdukSelect
            value={selectedProdukId ? String(selectedProdukId) : ''}
            onChange={(value) => {
              setSelectedProdukId(value ? Number(value) : '')
              setQuantity('')
            }}
            placeholder="Pilih Produk Pastry"
            searchable={true}
            stockDivision="pastry"
          />
        </div>

        {selectedProdukId && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Produk</div>
            <div className="text-lg font-semibold text-gray-900">{selectedProduk?.nama}</div>
            <div className="text-sm text-gray-500">Kode: {selectedProduk?.kode}</div>
            <div className="text-sm text-gray-500 mt-1">
              Stok Saat Ini: <span className="font-medium">{currentStock}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alasan *
          </label>
          <select
            value={alasan}
            onChange={(e) => setAlasan(e.target.value as ProdukAdjustmentAlasan | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
            disabled={!selectedProdukId}
          >
            <option value="">Pilih alasan</option>
            {ALASAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Adjustment *
          </label>
          <NumericInput
            asString
            allowNegative
            value={quantity}
            onChange={setQuantity}
            placeholder="Negatif untuk kurangi (rusak/konsumsi), positif untuk tambah"
            required
            disabled={!selectedProdukId}
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan angka negatif untuk mengurangi stok (mis. -2 untuk 2 pcs rusak)
          </p>
          {selectedProdukId && quantity && !isNaN(parseInt(quantity)) && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <div className="text-sm text-blue-800">
                Stok Setelah Adjustment:{' '}
                <span className="font-semibold">{currentStock + parseInt(quantity)}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan {alasan === 'lainnya' ? '*' : '(opsional)'}
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder={
              alasan === 'lainnya'
                ? 'Jelaskan alasan adjustment'
                : 'Catatan tambahan (opsional)'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            required={alasan === 'lainnya'}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedProdukId || !quantity || !alasan}
          >
            {isLoading ? 'Memproses...' : 'Simpan Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
