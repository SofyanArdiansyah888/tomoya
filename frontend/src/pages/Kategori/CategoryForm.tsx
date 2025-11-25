import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Kategori } from '../../types/product'

interface CategoryFormProps {
  category?: Kategori | null
  onSave: (data: Omit<Kategori, 'id' | 'created_at' | 'updated_at' | 'slug' | 'gambar'>) => void
  onCancel: () => void
  isLoading?: boolean
}

export const CategoryForm = ({ category, onSave, onCancel, isLoading = false }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    is_active: true
  })

  useEffect(() => {
    if (category) {
      setFormData({
        nama: category.nama || '',
        deskripsi: category.deskripsi || '',
        is_active: category.is_active ?? true
      })
    } else {
      setFormData({
        nama: '',
        deskripsi: '',
        is_active: true
      })
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Kategori *
        </label>
        <Input
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          placeholder="Masukkan nama kategori"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          placeholder="Masukkan deskripsi kategori"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-amber-600 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Kategori Aktif
        </label>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : category ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
