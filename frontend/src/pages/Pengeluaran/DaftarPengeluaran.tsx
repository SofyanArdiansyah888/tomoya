import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { PengeluaranForm } from './PengeluaranForm'
import { PengeluaranTable } from './PengeluaranTable'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SearchInput } from '../../components/ui/search-input'
import { Modal } from '../../components/ui/modal'
import { useToast } from '../../hooks/useToast'
import { formatPrice } from '../../lib/formatPrice'
import { expenseService } from '../../services/expense'
import { CreatePengeluaranRequest, UpdatePengeluaranRequest, Pengeluaran, PengeluaranFilters } from '../../types/expense'

export const DaftarPengeluaran = () => {
  const [pengeluarans, setPengeluarans] = useState<Pengeluaran[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPengeluaran, setEditingPengeluaran] = useState<Pengeluaran | null>(null)
  const [viewingPengeluaran, setViewingPengeluaran] = useState<Pengeluaran | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [subKategoriFilter, setSubKategoriFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('tanggal-desc')
  
  const [stats, setStats] = useState({
    total_pengeluaran: 0,
    total_transaksi: 0,
    pengeluaran_by_kategori: {} as Record<string, number>
  })

  const { toast } = useToast()

  // Load data
  const loadPengeluarans = async () => {
    setIsLoading(true)
    try {
      // Build filters object
      const filters: PengeluaranFilters = {
        search: searchTerm || undefined,
        kategori: kategoriFilter || undefined,
        sub_kategori: subKategoriFilter || undefined,
        tanggal_dari: dateFromFilter || undefined,
        tanggal_sampai: dateToFilter || undefined,
        sort_by: sortFilter.split('-')[0],
        sort_order: sortFilter.split('-')[1] as 'asc' | 'desc',
        exclude_kategori: 'pembelian_bahan_baku'
      }
      
      const response = await expenseService.getPengeluarans(filters)
      console.log('API Response:', response)
      console.log('Pengeluarans data:', response.data)
      
      // Additional client-side filtering to ensure no pembelian_bahan_baku
      const filteredData = response.data.filter(pengeluaran => 
        pengeluaran.kategori !== 'pembelian_bahan_baku'
      )
      
      setPengeluarans(filteredData)
    } catch (error) {
      console.error('Error loading pengeluarans:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pengeluaran',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const filters: PengeluaranFilters = {
        tanggal_dari: dateFromFilter || undefined,
        tanggal_sampai: dateToFilter || undefined,
        exclude_kategori: 'pembelian_bahan_baku'
      }
      const response = await expenseService.getPengeluaranStats(filters)
      setStats(response)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Load data on mount and when filters change
  React.useEffect(() => {
    loadPengeluarans()
    loadStats()
  }, [searchTerm, kategoriFilter, subKategoriFilter, dateFromFilter, dateToFilter, sortFilter])

  // Handle create/update
  const handleSubmit = async (data: CreatePengeluaranRequest) => {
    setIsSaving(true)
    try {
      if (editingPengeluaran) {
        const updateData: UpdatePengeluaranRequest = {
          id: editingPengeluaran.id,
          ...data
        }
        await expenseService.updatePengeluaran(editingPengeluaran.id, updateData)
        toast({
          title: 'Berhasil',
          description: 'Pengeluaran berhasil diperbarui'
        })
      } else {
        await expenseService.createPengeluaran(data)
        toast({
          title: 'Berhasil',
          description: 'Pengeluaran berhasil ditambahkan'
        })
      }
      setIsModalOpen(false)
      setEditingPengeluaran(null)
      loadPengeluarans()
      loadStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengeluaran',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await expenseService.deletePengeluaran(id)
      toast({
        title: 'Berhasil',
        description: 'Pengeluaran berhasil dihapus'
      })
      loadPengeluarans()
      loadStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus pengeluaran',
        variant: 'destructive'
      })
    }
  }

  // Handle edit
  const handleEdit = (pengeluaran: Pengeluaran) => {
    setEditingPengeluaran(pengeluaran)
    setIsModalOpen(true)
  }

  // Handle view
  const handleView = (pengeluaran: Pengeluaran) => {
    setViewingPengeluaran(pengeluaran)
  }

  // Handle add new
  const handleAddNew = () => {
    setEditingPengeluaran(null)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPengeluaran(null)
    setViewingPengeluaran(null)
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
          <h1 className="text-2xl font-bold">Daftar Pengeluaran</h1>
          <p className="text-gray-600">Kelola pengeluaran non bahan baku</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPrice(stats.total_pengeluaran || 0)}
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
              {Object.keys(stats.pengeluaran_by_kategori).length > 0
                ? Object.entries(stats.pengeluaran_by_kategori)
                    .sort(([, a], [, b]) => b - a)[0][0].replace(/_/g, ' ')
                : '-'
              }
            </div>
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
                  label="Cari Pengeluaran"
                  placeholder="Cari pengeluaran..."
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
                  <option value="pengeluaran_operasional">Pengeluaran Operasional</option>
                  <option value="pengeluaran_lainnya">Pengeluaran Lainnya</option>
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
                  {kategoriFilter === 'pengeluaran_operasional' && (
                    <>
                      <option value="gaji_karyawan">Gaji Karyawan</option>
                      <option value="listrik_air">Listrik & Air</option>
                      <option value="sewa_tempat">Sewa Tempat</option>
                      <option value="pemeliharaan">Pemeliharaan</option>
                    </>
                  )}
                  {kategoriFilter === 'pengeluaran_lainnya' && (
                    <>
                      <option value="lainnya">Lainnya</option>
                    </>
                  )}
                  {kategoriFilter === 'pembelian_bahan_baku' && (
                    <>
                      <option value="pembelian_bahan">Pembelian Bahan</option>
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
      <PengeluaranTable
        pengeluarans={pengeluarans}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingPengeluaran ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
        size="lg"
      >
        <PengeluaranForm
          pengeluaran={editingPengeluaran}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          isSaving={isSaving}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingPengeluaran}
        onClose={() => setViewingPengeluaran(null)}
        title="Detail Pengeluaran"
        size="md"
      >
        {viewingPengeluaran && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama</label>
                <p className="text-lg">{viewingPengeluaran.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Jumlah</label>
                <p className="text-lg font-bold text-red-600">
                  {formatPrice(viewingPengeluaran.jumlah)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kategori</label>
                <p className="text-lg">{viewingPengeluaran.kategori_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sub Kategori</label>
                <p className="text-lg">{viewingPengeluaran.sub_kategori_label || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal</label>
                <p className="text-lg">
                  {new Date(viewingPengeluaran.tanggal).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Metode Pembayaran</label>
                <p className="text-lg">{viewingPengeluaran.metode_pembayaran_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="text-lg">{viewingPengeluaran.user?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Referensi</label>
                <p className="text-lg">{viewingPengeluaran.referensi || '-'}</p>
              </div>
            </div>
            {viewingPengeluaran.deskripsi && (
              <div>
                <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                <p className="text-lg">{viewingPengeluaran.deskripsi}</p>
              </div>
            )}
            {viewingPengeluaran.bukti_pembayaran && (
              <div>
                <label className="text-sm font-medium text-gray-500">Bukti Pembayaran</label>
                <p className="text-lg">{viewingPengeluaran.bukti_pembayaran}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
