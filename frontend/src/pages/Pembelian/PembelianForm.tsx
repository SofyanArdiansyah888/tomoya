import { Package, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
import { Material } from '../../types/material'
import { Pembelian } from '../../types/purchase'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { NumericInput } from '@/components/ui/NumericInput'
import { SupplierSelect, LokasiSelect } from '@/components/forms'

interface PembelianFormProps {
  purchase?: Pembelian | null
  materials?: Material[]
  suppliers?: any[] // Not used anymore, SupplierSelect fetches its own data
  onSave: (data: {
    supplier_id: number
    lokasi_id: number
    tanggal_pembelian: string
    catatan?: string
    metode_pembayaran: 'cash' | 'transfer'
    items: Array<{
      material_id: number
      quantity: number
      harga_satuan: number
    }>
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const PembelianForm = ({
  purchase,
  materials = [],
  onSave,
  onCancel,
  isLoading = false
}: PembelianFormProps) => {

  const [formData, setFormData] = useState({
    supplier_id: 0,
    lokasi_id: '1', // Default to gudang (id: 1)
    tanggal_pembelian: new Date().toISOString().split('T')[0],
    catatan: '',
    metode_pembayaran: 'cash' as 'cash' | 'transfer',
    items: [] as Array<{
      id: number
      material_id: number
      quantity: number
      harga_satuan: number
    }>
  })

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier_id: purchase.supplier_id,
        lokasi_id: purchase.lokasi_id.toString(),
        tanggal_pembelian: purchase.tanggal_pembelian,
        catatan: purchase.catatan || '',
        metode_pembayaran: purchase.metode_pembayaran || 'cash',
        items: purchase.items?.map(item => ({
          id: item.id,
          material_id: item.material_id,
          quantity: item.quantity,
          harga_satuan: item.harga_satuan
        })) || []
      })
    } else {
      setFormData({
        supplier_id: 0,
        lokasi_id: '1', // Default to gudang (id: 1)
        tanggal_pembelian: new Date().toISOString().split('T')[0],
        catatan: '',
        metode_pembayaran: 'cash',
        items: []
      })
    }
  }, [purchase])

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        material_id: 0,
        quantity: 1,
        harga_satuan: 0
      }]
    }))
  }

  const handleRemoveItem = (itemId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const handleUpdateItem = (itemId: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleInputChange = (field: string, value: string | number | 'cash' | 'transfer') => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.supplier_id || formData.supplier_id === 0) {
      return
    }
    onSave({
      supplier_id: formData.supplier_id,
      lokasi_id: Number(formData.lokasi_id),
      tanggal_pembelian: formData.tanggal_pembelian,
      catatan: formData.catatan,
      metode_pembayaran: formData.metode_pembayaran,
      items: formData.items.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
        harga_satuan: item.harga_satuan
      }))
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier *
          </label>
          <SupplierSelect
            value={formData.supplier_id || undefined}
            onValueChange={(value) => handleInputChange('supplier_id', value as number)}
            placeholder="Pilih Supplier"
            searchable={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi *
          </label>
          <LokasiSelect
            value={formData.lokasi_id}
            onValueChange={(value) => handleInputChange('lokasi_id', String(value))}
            placeholder="Pilih Lokasi"
            searchable={true}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Pembelian *
          </label>
          <Input
            type="date"
            value={formData.tanggal_pembelian}
            onChange={(e) => handleInputChange('tanggal_pembelian', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran *
          </label>
          <select
            value={formData.metode_pembayaran}
            onChange={(e) => handleInputChange('metode_pembayaran', e.target.value as 'cash' | 'transfer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          >
            <option value="cash">Brankas</option>
            <option value="transfer">Rekening</option>
          </select>
        </div>
      </div>

      {/* Items Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Item Pembelian</h3>
          <Button
            type="button"
            onClick={handleAddItem}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Item
          </Button>
        </div>

        {formData.items.length === 0 ? (
          <Card className="p-8">
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada item yang ditambahkan</p>
              <p className="text-sm">Klik "Tambah Item" untuk menambahkan material</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Material *</TableHead>
                    <TableHead className="w-32">Quantity *</TableHead>
                    <TableHead className="w-40">Harga Satuan *</TableHead>
                    <TableHead className="w-40">Subtotal</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => {
                    const subtotal = item.quantity * item.harga_satuan

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <select
                            value={item.material_id || 0}
                            onChange={(e) => {
                              const selectedMaterialId = Number(e.target.value)
                              const selectedMaterial = materials.find(m => m.id === selectedMaterialId)
                              handleUpdateItem(item.id, 'material_id', selectedMaterialId)
                              if (selectedMaterial && item.harga_satuan === 0) {
                                handleUpdateItem(item.id, 'harga_satuan', selectedMaterial.purchase_price)
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                            required
                          >
                            <option value={0}>Pilih Material</option>
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name} ({material.sku})
                              </option>
                            ))}
                          </select>

                        </TableCell>
                        <TableCell>
                          <NumericInput
                            value={item.quantity || 0}
                            onChange={(value) => handleUpdateItem(item.id, 'quantity', value)}
                            required
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <CurrencyInput
                            value={item.harga_satuan}
                            onChange={(value) => handleUpdateItem(item.id, 'harga_satuan', value)}
                            placeholder="0"
                            required
                            className='w-full'
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          Rp {subtotal.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Catatan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan
        </label>
        <textarea
          value={formData.catatan}
          onChange={(e) => handleInputChange('catatan', e.target.value)}
          placeholder="Tambahkan catatan untuk pembelian ini..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
        />
      </div>

      {/* Total */}
      {formData.items.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Pembelian:</span>
            <span className="text-xl font-bold text-green-600">
              Rp {formData.items.reduce((sum, item) => sum + (item.quantity * item.harga_satuan), 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

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
          disabled={isLoading || formData.items.length === 0}
          className="flex items-center gap-2"
        >
          {isLoading ? 'Menyimpan...' : (purchase ? 'Update Pembelian' : 'Simpan Pembelian')}
        </Button>
      </div>
    </form>
  )
}

