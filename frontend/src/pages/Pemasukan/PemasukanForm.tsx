import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select-primitives'
import { Pemasukan, CreatePemasukanRequest, PEMASUKAN_METODE_PEMBAYARAN_OPTIONS } from '../../types/pemasukan'

interface PemasukanFormProps {
  pemasukan?: Pemasukan | null
  onSubmit: (data: CreatePemasukanRequest) => void
  onCancel: () => void
  isSaving?: boolean
}

export const PemasukanForm = ({ pemasukan, onSubmit, onCancel, isSaving = false }: PemasukanFormProps) => {
  const [formData, setFormData] = useState<CreatePemasukanRequest>({
    toko_id: 1,
    kategori: 'lainnya',
    nama: '',
    deskripsi: '',
    jumlah: 0,
    tanggal: new Date().toISOString().split('T')[0],
    metode_pembayaran: 'cash',
    referensi: '',
    bukti_pembayaran: '',
    is_active: true,
  })

  useEffect(() => {
    if (pemasukan) {
      setFormData({
        toko_id: pemasukan.toko_id,
        kategori: 'lainnya',
        nama: pemasukan.nama,
        deskripsi: pemasukan.deskripsi || '',
        jumlah: pemasukan.jumlah,
        tanggal: pemasukan.tanggal,
        metode_pembayaran: pemasukan.metode_pembayaran === 'cash' || pemasukan.metode_pembayaran === 'transfer'
          ? pemasukan.metode_pembayaran
          : 'cash',
        referensi: pemasukan.referensi || '',
        bukti_pembayaran: pemasukan.bukti_pembayaran || '',
        is_active: true,
      })
    }
  }, [pemasukan])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      kategori: 'lainnya',
      is_active: true,
    })
  }

  const handleInputChange = (field: keyof CreatePemasukanRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="nama">Nama Pemasukan *</Label>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama pemasukan"
            required
          />
        </div>

        <div>
          <Label htmlFor="jumlah">Jumlah *</Label>
          <CurrencyInput
            value={formData.jumlah}
            onChange={(value) => handleInputChange('jumlah', value)}
            placeholder="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="tanggal">Tanggal *</Label>
          <Input
            id="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleInputChange('tanggal', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="metode_pembayaran">Metode Pembayaran *</Label>
          <Select 
            value={formData.metode_pembayaran} 
            onValueChange={(value) => handleInputChange('metode_pembayaran', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {PEMASUKAN_METODE_PEMBAYARAN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="referensi">Referensi</Label>
          <Input
            id="referensi"
            value={formData.referensi || ''}
            onChange={(e) => handleInputChange('referensi', e.target.value)}
            placeholder="Nomor referensi atau invoice"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            value={formData.deskripsi || ''}
            onChange={(e) => handleInputChange('deskripsi', e.target.value)}
            placeholder="Deskripsi pemasukan"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : pemasukan ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
