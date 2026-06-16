import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Switch } from '../../components/ui/switch'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { NumericInput } from '../../components/ui/NumericInput'
import { SupplierSelect } from '../../components/forms/SupplierSelect'
import { CategorySelect } from '../../components/forms/CategorySelect'
import { UnitSelect } from '../../components/forms/UnitSelect'
import { Loader2 } from 'lucide-react'
import { Material } from '../../types/material'

interface MaterialFormProps {
  material?: Material | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isSaving?: boolean
}

export const MaterialForm = ({ material, onSubmit, onCancel, isSaving = false }: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: undefined as number | undefined,
    supplier_id: undefined as number | undefined,
    purchase_price: '',
    unit: 'kg',
    min_stock: '0',
    unit_gudang: 'kg',
    min_stok_gudang: '0',
    nilai_konversi: '',
    barcode: '',
    is_active: true,
    is_bahan_kopi: false,
  })

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        sku: material.sku || '',
        description: material.description || '',
        category_id: material.category_id,
        supplier_id: material.supplier_id,
        purchase_price: material.purchase_price.toString(),
        unit: material.unit,
        min_stock: material.min_stock.toString(),
        unit_gudang: material.unit_gudang,
        min_stok_gudang: material?.min_stok_gudang?.toString(),
        nilai_konversi: material?.nilai_konversi?.toString(),
        barcode: material.barcode || '',
        is_active: material.is_active,
        is_bahan_kopi: !!material.is_bahan_kopi,
      })
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category_id: undefined,
        supplier_id: undefined,
        purchase_price: '',
        unit: 'kg',
        min_stock: '0',
        unit_gudang: 'kg',
        min_stok_gudang: '0',
        nilai_konversi: '',
        barcode: '',
        is_active: true,
        is_bahan_kopi: false,
      })
    }
  }, [material])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price),
      min_stock: parseInt(formData.min_stock),
      min_stok_gudang: parseInt(formData.min_stok_gudang),
      nilai_konversi: parseInt(formData.nilai_konversi),
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Dasar */}
      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Material *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
              placeholder="Masukkan nama material"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('sku', e.target.value)}
              placeholder="Masukkan SKU material"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
            placeholder="Masukkan deskripsi material"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori *</Label>
            <CategorySelect
              value={formData.category_id}
              onValueChange={(value: string | number) => handleChange('category_id', value)}
              placeholder="Pilih kategori"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <SupplierSelect
              value={formData.supplier_id}
              onValueChange={(value: string | number | undefined) => handleChange('supplier_id', value ?? 0)}
              placeholder="Pilih supplier"
            />
          </div>
        </div>
      </div>

      {/* Informasi Harga & Unit */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Harga Beli *</Label>
            <CurrencyInput
              value={formData.purchase_price}
              onChange={(value) => handleChange('purchase_price', value.toString())}
              placeholder="Masukkan harga beli"
              required
            />
          </div>



          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('barcode', e.target.value)}
              placeholder="Masukkan barcode"
            />
          </div>
        </div>
      </div>

      {/* Informasi Gudang */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit_gudang">Unit Gudang *</Label>
            <UnitSelect
              value={formData.unit_gudang}
              onChange={(value) => handleChange('unit_gudang', value)}
              placeholder="Pilih unit"
              required
            />
          </div>





          <div className="space-y-2">
            <Label htmlFor="nilai_konversi">Nilai Konversi *</Label>
            <NumericInput
              id="nilai_konversi"
              asString
              value={formData.nilai_konversi}
              onChange={(value) => handleChange('nilai_konversi', value)}
              placeholder="Masukkan nilai konversi"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <UnitSelect
              value={formData.unit}
              onChange={(value) => handleChange('unit', value)}
              placeholder="Pilih unit"
              required
            />
          </div>
        </div>
      </div>

      {/* Stok Minimum */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_stock">Stok Minimum</Label>
            <NumericInput
              id="min_stock"
              asString
              value={formData.min_stock}
              onChange={(value) => handleChange('min_stock', value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_stok_gudang">Stok Min Gudang *</Label>
            <NumericInput
              id="min_stok_gudang"
              asString
              value={formData.min_stok_gudang}
              onChange={(value) => handleChange('min_stok_gudang', value)}
              placeholder="0"
              required
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked: boolean) => handleChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Material Aktif</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_bahan_kopi"
            checked={formData.is_bahan_kopi}
            onCheckedChange={(checked: boolean) => handleChange('is_bahan_kopi', checked)}
          />
          <Label htmlFor="is_bahan_kopi">Bahan Kopi</Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Menyimpan...' : (material ? 'Perbarui' : 'Simpan')}
        </Button>
      </div>
    </form>
  )
}
