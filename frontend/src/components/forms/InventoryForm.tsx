import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { NumericInput } from '../ui/NumericInput'

interface InventoryFormProps {
  item?: any
  onSave: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export const InventoryForm = ({ item, onSave, onCancel, isLoading = false }: InventoryFormProps) => {
  const [formData, setFormData] = useState({
    currentStock: '',
    minStock: '',
    maxStock: '',
    notes: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        currentStock: item.currentStock?.toString() || '',
        minStock: item.minStock?.toString() || '',
        maxStock: item.maxStock?.toString() || '',
        notes: ''
      })
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      currentStock: parseInt(formData.currentStock),
      minStock: parseInt(formData.minStock),
      maxStock: parseInt(formData.maxStock)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stok Saat Ini *
          </label>
          <NumericInput
            asString
            value={formData.currentStock}
            onChange={(value) => setFormData({ ...formData, currentStock: value })}
            placeholder="Masukkan stok saat ini"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stok Minimum *
          </label>
          <NumericInput
            asString
            value={formData.minStock}
            onChange={(value) => setFormData({ ...formData, minStock: value })}
            placeholder="Masukkan stok minimum"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stok Maksimum *
          </label>
          <NumericInput
            asString
            value={formData.maxStock}
            onChange={(value) => setFormData({ ...formData, maxStock: value })}
            placeholder="Masukkan stok maksimum"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Masukkan catatan (opsional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}
