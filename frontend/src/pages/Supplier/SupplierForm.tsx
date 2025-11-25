import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Save } from 'lucide-react'
import { Supplier } from '../../types/purchase'

interface SupplierFormProps {
  supplier?: Supplier | null
  onSave: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
  isLoading?: boolean
}

export const SupplierForm = ({ supplier, onSave, onCancel, isLoading = false }: SupplierFormProps) => {
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    is_active: true
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        nama: supplier.nama || '',
        alamat: supplier.alamat || '',
        telepon: supplier.telepon || '',
        email: supplier.email || '',
        is_active: supplier.is_active ?? true
      })
    } else {
      setFormData({
        nama: '',
        alamat: '',
        telepon: '',
        email: '',
        is_active: true
      })
    }
  }, [supplier])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Supplier *
          </label>
          <Input
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama supplier"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Supplier Aktif
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat *
        </label>
        <textarea
          value={formData.alamat}
          onChange={(e) => handleInputChange('alamat', e.target.value)}
          placeholder="Masukkan alamat lengkap"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telepon
          </label>
          <Input
            value={formData.telepon}
            onChange={(e) => handleInputChange('telepon', e.target.value)}
            placeholder="Masukkan nomor telepon"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Masukkan email"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Menyimpan...' : (supplier ? 'Update Supplier' : 'Simpan Supplier')}
        </Button>
      </div>
    </form>
  )
}
