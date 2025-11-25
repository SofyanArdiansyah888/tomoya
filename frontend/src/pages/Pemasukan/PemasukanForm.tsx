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
import { Pemasukan, CreatePemasukanRequest, PEMASUKAN_KATEGORI_OPTIONS, PEMASUKAN_SUB_KATEGORI_OPTIONS, PEMASUKAN_METODE_PEMBAYARAN_OPTIONS } from '../../types/pemasukan'

interface PemasukanFormProps {
  pemasukan?: Pemasukan | null
  onSubmit: (data: CreatePemasukanRequest) => void
  onCancel: () => void
  isSaving?: boolean
}

export const PemasukanForm = ({ pemasukan, onSubmit, onCancel, isSaving = false }: PemasukanFormProps) => {
  const [formData, setFormData] = useState<CreatePemasukanRequest>({
    toko_id: 1, // Default toko, should be dynamic
    kategori: 'pemasukan_non_kasir',
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

  const [selectedKategori, setSelectedKategori] = useState('pemasukan_non_kasir')

  useEffect(() => {
    if (pemasukan) {
      setFormData({
        toko_id: pemasukan.toko_id,
        kategori: pemasukan.kategori,
        sub_kategori: pemasukan.sub_kategori || '',
        nama: pemasukan.nama,
        deskripsi: pemasukan.deskripsi || '',
        jumlah: pemasukan.jumlah,
        tanggal: pemasukan.tanggal,
        metode_pembayaran: pemasukan.metode_pembayaran,
        referensi: pemasukan.referensi || '',
        bukti_pembayaran: pemasukan.bukti_pembayaran || '',
        is_active: pemasukan.is_active,
      })
      setSelectedKategori(pemasukan.kategori)
    }
  }, [pemasukan])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof CreatePemasukanRequest, value: any) => {
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
    return PEMASUKAN_SUB_KATEGORI_OPTIONS.filter(option => option.kategori === selectedKategori)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Pemasukan */}
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

        {/* Kategori */}
        <div>
          <Label htmlFor="kategori">Kategori *</Label>
          <Select value={selectedKategori} onValueChange={handleKategoriChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {PEMASUKAN_KATEGORI_OPTIONS.map((option) => (
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
              {PEMASUKAN_METODE_PEMBAYARAN_OPTIONS.map((option) => (
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
            placeholder="Deskripsi pemasukan"
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
          {isSaving ? 'Menyimpan...' : pemasukan ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
