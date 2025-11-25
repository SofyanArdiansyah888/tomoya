import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Switch } from '../../components/ui/switch'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select-primitives'
import { Pengeluaran, CreatePengeluaranRequest, PENGELUARAN_KATEGORI_OPTIONS, PENGELUARAN_SUB_KATEGORI_OPTIONS, PENGELUARAN_METODE_PEMBAYARAN_OPTIONS } from '../../types/expense'

interface PengeluaranFormProps {
  pengeluaran?: Pengeluaran | null
  onSubmit: (data: CreatePengeluaranRequest) => void
  onCancel: () => void
  isSaving?: boolean
}

export const PengeluaranForm = ({ pengeluaran, onSubmit, onCancel, isSaving = false }: PengeluaranFormProps) => {
  const [formData, setFormData] = useState<CreatePengeluaranRequest>({
    toko_id: 1, // Default toko, should be dynamic
    kategori: 'pengeluaran_operasional',
    sub_kategori: '',
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
        sub_kategori: pengeluaran.sub_kategori || '',
        nama: pengeluaran.nama,
        deskripsi: pengeluaran.deskripsi || '',
        jumlah: pengeluaran.jumlah,
        tanggal: pengeluaran.tanggal,
        metode_pembayaran: pengeluaran.metode_pembayaran,
        referensi: pengeluaran.referensi || '',
        bukti_pembayaran: pengeluaran.bukti_pembayaran || '',
        is_active: pengeluaran.is_active,
      })
      setSelectedKategori(pengeluaran.kategori)
    }
  }, [pengeluaran])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
      sub_kategori: '' // Reset sub kategori when kategori changes
    }))
  }

  const getSubKategoriOptions = () => {
    return PENGELUARAN_SUB_KATEGORI_OPTIONS.filter(option => option.kategori === selectedKategori)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Pengeluaran */}
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

        {/* Kategori */}
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

        {/* Sub Kategori */}
        <div>
          <Label htmlFor="sub_kategori">Sub Kategori</Label>
          <Select 
            value={formData.sub_kategori || ''} 
            onValueChange={(value) => handleInputChange('sub_kategori', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih sub kategori" />
            </SelectTrigger>
            <SelectContent>
              {getSubKategoriOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Jumlah */}
        <div>
          <Label htmlFor="jumlah">Jumlah *</Label>
          <CurrencyInput
            value={formData.jumlah}
            onChange={(value) => handleInputChange('jumlah', value)}
            placeholder="0"
            required
          />
        </div>

        {/* Tanggal */}
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

        {/* Metode Pembayaran */}
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


        {/* Referensi */}
        <div>
          <Label htmlFor="referensi">Referensi</Label>
          <Input
            id="referensi"
            value={formData.referensi || ''}
            onChange={(e) => handleInputChange('referensi', e.target.value)}
            placeholder="Nomor referensi atau invoice"
          />
        </div>

        {/* Deskripsi */}
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

        {/* Is Active */}
        <div className="md:col-span-2 flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>
      </div>

      {/* Action Buttons */}
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
