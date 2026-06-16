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
import { Pengeluaran, CreatePengeluaranRequest, PENGELUARAN_KATEGORI_OPTIONS, PENGELUARAN_METODE_PEMBAYARAN_OPTIONS } from '../../types/expense'

interface PengeluaranFormProps {
  pengeluaran?: Pengeluaran | null
  onSubmit: (data: CreatePengeluaranRequest) => void
  onCancel: () => void
  isSaving?: boolean
}

export const PengeluaranForm = ({ pengeluaran, onSubmit, onCancel, isSaving = false }: PengeluaranFormProps) => {
  const [formData, setFormData] = useState<CreatePengeluaranRequest>({
    toko_id: 1,
    kategori: 'pengeluaran_operasional',
    nama: '',
    deskripsi: '',
    jumlah: 0,
    tanggal: new Date().toISOString().split('T')[0],
    metode_pembayaran: 'cash',
    referensi: '',
    bukti_pembayaran: '',
    is_active: true,
  })

  const [selectedKategori, setSelectedKategori] = useState('pengeluaran_operasional')

  useEffect(() => {
    if (pengeluaran) {
      setFormData({
        toko_id: pengeluaran.toko_id,
        kategori: pengeluaran.kategori === 'pembelian_bahan_baku' ? 'pengeluaran_operasional' : pengeluaran.kategori,
        nama: pengeluaran.nama,
        deskripsi: pengeluaran.deskripsi || '',
        jumlah: pengeluaran.jumlah,
        tanggal: pengeluaran.tanggal,
        metode_pembayaran: pengeluaran.metode_pembayaran === 'cash' || pengeluaran.metode_pembayaran === 'transfer'
          ? pengeluaran.metode_pembayaran
          : 'cash',
        referensi: pengeluaran.referensi || '',
        bukti_pembayaran: pengeluaran.bukti_pembayaran || '',
        is_active: true,
      })
      setSelectedKategori(pengeluaran.kategori)
    }
  }, [pengeluaran])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      is_active: true,
    })
  }

  const handleInputChange = (field: keyof CreatePengeluaranRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKategoriChange = (kategori: string) => {
    setSelectedKategori(kategori)
    setFormData(prev => ({
      ...prev,
      kategori: kategori as any,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="nama">Nama Pengeluaran *</Label>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
            placeholder="Masukkan nama pengeluaran"
            required
          />
        </div>

        <div>
          <Label htmlFor="kategori">Kategori *</Label>
          <Select value={selectedKategori} onValueChange={handleKategoriChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {PENGELUARAN_KATEGORI_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {PENGELUARAN_METODE_PEMBAYARAN_OPTIONS.map((option) => (
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
            placeholder="Deskripsi pengeluaran"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : pengeluaran ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
