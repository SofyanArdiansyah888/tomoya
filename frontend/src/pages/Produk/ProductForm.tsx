import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { CategorySelect } from '../../components/forms/CategorySelect'
import { ResepSelect } from '../../components/forms/ResepSelect'
import { Produk } from '../../types/product'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProductFormProps {
  product?: Produk | null
  onSave: (data: Omit<Produk, 'id' | 'created_at' | 'updated_at' | 'kategori'> & { kategori_id: number }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const ProductForm = ({ product, onSave, onCancel, isLoading = false }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    harga: '',
    deskripsi: '',
    kategori_id: '',
    stockable: false,
    resep_id: '',
    is_active: true
  })


  useEffect(() => {
    if (product) {
      setFormData({
        nama: product.nama || '',
        kode: product.kode || '',
        harga: product.harga?.toString() || '',
        deskripsi: product.deskripsi || '',
        kategori_id: product.kategori_id?.toString() || '',
        stockable: product.stockable ?? false,
        resep_id: product.resep_id?.toString() || '',
        is_active: product.is_active ?? true
      })
    } else {
      setFormData({
        nama: '',
        kode: '',
        harga: '',
        deskripsi: '',
        kategori_id: '',
        stockable: false,
        resep_id: '',
        is_active: true
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate: if stockable is true, resep_id is required
    if (formData.stockable && !formData.resep_id) {
      toast.error('Resep wajib dipilih jika produk stockable')
      return
    }
    
    // Generate slug from nama
    const slug = formData.nama
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Generate kode from nama if not provided (auto-generate)
    const kode = formData.kode.trim() || (() => {
      const generated = formData.nama
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10)
      return generated || 'PROD-' + Date.now().toString().slice(-6)
    })()
    
    onSave({
      nama: formData.nama,
      kode: kode,
      slug: slug,
      deskripsi: formData.deskripsi,
      harga: parseFloat(formData.harga),
      kategori_id: parseInt(formData.kategori_id),
      stockable: formData.stockable,
      resep_id: formData.resep_id ? parseInt(formData.resep_id) : undefined,
      is_active: formData.is_active
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Produk *
        </label>
        <Input
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          placeholder="Masukkan nama produk"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kode Produk
        </label>
        <Input
          value={formData.kode}
          onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
          placeholder="Auto-generate dari nama (opsional)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Kosongkan untuk auto-generate dari nama produk
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga *
        </label>
        <CurrencyInput
          value={formData.harga}
          onChange={(value) => setFormData({ ...formData, harga: value.toString() })}
          placeholder="Masukkan harga"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori *
        </label>
        <CategorySelect
          value={formData.kategori_id ? parseInt(formData.kategori_id) : undefined}
          onValueChange={(value) => setFormData({ ...formData, kategori_id: value.toString() })}
          placeholder="Pilih Kategori"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi *
        </label>
        <textarea
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          placeholder="Masukkan deskripsi produk"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="stockable"
          checked={formData.stockable}
          onChange={(e) => {
            setFormData({ 
              ...formData, 
              stockable: e.target.checked,
              resep_id: e.target.checked ? formData.resep_id : '' // Clear resep_id if stockable is unchecked
            })
          }}
          className="h-4 w-4 text-amber-600 border-gray-300 rounded"
        />
        <label htmlFor="stockable" className="text-sm text-gray-700">
          Stockable (Dapat dibuat dari resep)
        </label>
      </div>

      {formData.stockable && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resep * <span className="text-xs text-gray-500">(Wajib jika stockable)</span>
          </label>
          <ResepSelect
            value={formData.resep_id}
            onChange={(value) => setFormData({ ...formData, resep_id: value })}
            placeholder="Pilih resep"
            required
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-amber-600 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Produk Aktif
        </label>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Menyimpan...' : product ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
