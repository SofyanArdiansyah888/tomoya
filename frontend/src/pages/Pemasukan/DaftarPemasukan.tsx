import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { PemasukanForm } from './PemasukanForm'
import { PemasukanTable } from './PemasukanTable'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SearchInput } from '../../components/ui/search-input'
import { Modal } from '../../components/ui/modal'
import { useToast } from '../../hooks/useToast'
import { formatPrice } from '../../lib/formatPrice'
import { pemasukanService } from '../../services/pemasukan'
import { CreatePemasukanRequest, UpdatePemasukanRequest, Pemasukan, PemasukanFilters } from '../../types/pemasukan'

export const DaftarPemasukan = () => {
  const [pemasukans, setPemasukans] = useState<Pemasukan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPemasukan, setEditingPemasukan] = useState<Pemasukan | null>(null)
  const [viewingPemasukan, setViewingPemasukan] = useState<Pemasukan | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [subKategoriFilter, setSubKategoriFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('tanggal-desc')
  
  const [stats, setStats] = useState({
    total_pemasukan: 0,
    total_transaksi: 0,
    pemasukan_by_kategori: {} as Record<string, number>
  })

  const { toast } = useToast()

  // Load data
  const loadPemasukans = async () => {
    setIsLoading(true)
    try {
      // Build filters object
      const filters: PemasukanFilters = {
        search: searchTerm || undefined,
        kategori: kategoriFilter || undefined,
        sub_kategori: subKategoriFilter || undefined,
        tanggal_dari: dateFromFilter || undefined,
        tanggal_sampai: dateToFilter || undefined,
        sort_by: sortFilter.split('-')[0],
        sort_order: sortFilter.split('-')[1] as 'asc' | 'desc'
      }
      
      const response = await pemasukanService.getPemasukans(filters)
      setPemasukans(response.data)
    } catch (error) {
      console.error('Error loading pemasukans:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pemasukan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const filters: PemasukanFilters = {
        tanggal_dari: dateFromFilter || undefined,
        tanggal_sampai: dateToFilter || undefined
      }
      const response = await pemasukanService.getPemasukanStats(filters)
      console.log('Stats response:', response) // Debug log
      console.log('Stats response type:', typeof response) // Debug log
      console.log('Stats response keys:', response ? Object.keys(response) : 'null') // Debug log
      
      if (response && typeof response === 'object') {
        setStats({
          total_pemasukan: Number(response.total_pemasukan) || 0,
          total_transaksi: Number(response.total_transaksi) || 0,
          pemasukan_by_kategori: response.pemasukan_by_kategori || {}
        })
      } else {
        // If response is not in expected format, set defaults
        setStats({
          total_pemasukan: 0,
          total_transaksi: 0,
          pemasukan_by_kategori: {}
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Set default values on error
      setStats({
        total_pemasukan: 0,
        total_transaksi: 0,
        pemasukan_by_kategori: {}
      })
    }
  }

  // Load data on mount and when filters change
  React.useEffect(() => {
    loadPemasukans()
    loadStats()
  }, [searchTerm, kategoriFilter, subKategoriFilter, dateFromFilter, dateToFilter, sortFilter])

  // Handle create/update
  const handleSubmit = async (data: CreatePemasukanRequest) => {
    setIsSaving(true)
    try {
      if (editingPemasukan) {
        const updateData: UpdatePemasukanRequest = {
          id: editingPemasukan.id,
          ...data
        }
        await pemasukanService.updatePemasukan(editingPemasukan.id, updateData)
        toast({
          title: 'Berhasil',
          description: 'Pemasukan berhasil diperbarui'
        })
      } else {
        await pemasukanService.createPemasukan(data)
        toast({
          title: 'Berhasil',
          description: 'Pemasukan berhasil ditambahkan'
        })
      }
      setIsModalOpen(false)
      setEditingPemasukan(null)
      loadPemasukans()
      loadStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pemasukan',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await pemasukanService.deletePemasukan(id)
      toast({
        title: 'Berhasil',
        description: 'Pemasukan berhasil dihapus'
      })
      loadPemasukans()
      loadStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus pemasukan',
        variant: 'destructive'
      })
    }
  }

  // Handle edit
  const handleEdit = (pemasukan: Pemasukan) => {
    setEditingPemasukan(pemasukan)
    setIsModalOpen(true)
  }

  // Handle view
  const handleView = (pemasukan: Pemasukan) => {
    setViewingPemasukan(pemasukan)
  }

  // Handle add new
  const handleAddNew = () => {
    setEditingPemasukan(null)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPemasukan(null)
    setViewingPemasukan(null)
  }

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setKategoriFilter('')
    setSubKategoriFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setSortFilter('tanggal-desc')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daftar Pemasukan</h1>
          <p className="text-gray-600">Kelola pemasukan non kasir</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pemasukan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.total_pemasukan || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_transaksi}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Terbanyak</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {stats.pemasukan_by_kategori && Object.keys(stats.pemasukan_by_kategori).length > 0
                ? Object.entries(stats.pemasukan_by_kategori)
                  .sort(([, a], [, b]) => (b as number) - (a as number))[0][0]
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())
                : '-'
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pemasukan_by_kategori && Object.keys(stats.pemasukan_by_kategori).length > 0
                ? `Rp ${formatPrice(Object.entries(stats.pemasukan_by_kategori).sort(([, a], [, b]) => (b as number) - (a as number))[0][1] as number)}`
                : ''
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="w-full min-w-0">
                <SearchInput
                  label="Cari Pemasukan"
                  placeholder="Cari pemasukan..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Semua Kategori</option>
                  <option value="pemasukan_non_kasir">Pemasukan Non Kasir</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Kategori
                </label>
                <select
                  value={subKategoriFilter}
                  onChange={(e) => setSubKategoriFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Semua Sub Kategori</option>
                  {kategoriFilter === 'pemasukan_kasir' && (
                    <>
                      <option value="penjualan_kasir">Penjualan Kasir</option>
                    </>
                  )}
                  {kategoriFilter === 'pemasukan_non_kasir' && (
                    <>
                      <option value="investasi">Investasi</option>
                      <option value="hibah">Hibah</option>
                      <option value="refund_penjualan">Refund Penjualan</option>
                    </>
                  )}
                  {kategoriFilter === 'lainnya' && (
                    <>
                      <option value="lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  min={dateFromFilter || undefined}
                  className="w-full"
                />
              </div>
            </div>
            <div className="pt-7">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <PemasukanTable
        pemasukans={pemasukans}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingPemasukan ? 'Edit Pemasukan' : 'Tambah Pemasukan'}
        size="lg"
      >
        <PemasukanForm
          pemasukan={editingPemasukan}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          isSaving={isSaving}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingPemasukan}
        onClose={() => setViewingPemasukan(null)}
        title="Detail Pemasukan"
        size="md"
      >
        {viewingPemasukan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama</label>
                <p className="text-lg">{viewingPemasukan.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Jumlah</label>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(viewingPemasukan.jumlah)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kategori</label>
                <p className="text-lg">{viewingPemasukan.kategori_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sub Kategori</label>
                <p className="text-lg">{viewingPemasukan.sub_kategori_label || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal</label>
                <p className="text-lg">
                  {new Date(viewingPemasukan.tanggal).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Metode Pembayaran</label>
                <p className="text-lg">{viewingPemasukan.metode_pembayaran_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="text-lg">{viewingPemasukan.user?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Referensi</label>
                <p className="text-lg">{viewingPemasukan.referensi || '-'}</p>
              </div>
            </div>
            {viewingPemasukan.deskripsi && (
              <div>
                <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                <p className="text-lg">{viewingPemasukan.deskripsi}</p>
              </div>
            )}
           
          </div>
        )}
      </Modal>
    </div>
  )
}
