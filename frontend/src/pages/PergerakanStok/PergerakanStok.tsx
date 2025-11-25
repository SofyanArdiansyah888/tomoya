import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Search } from 'lucide-react'
import { itemLokasiService, ItemLokasiFilters } from '../../services/inventory'
import { PergerakanStokTable } from './PergerakanStokTable'
import { Pagination } from '../../components/ui/pagination'
import { LokasiSelect, MaterialSelect } from '../../components/forms'

export const PergerakanStok = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [lokasiFilter, setLokasiFilter] = useState<number | undefined>()
  const [materialFilter, setMaterialFilter] = useState<number | undefined>()
  const [tipeLokasiFilter, setTipeLokasiFilter] = useState<'gudang' | 'toko' | ''>('')
  const [tipeFilter, setTipeFilter] = useState<'masuk' | 'keluar' | 'transfer' | 'adjustment' | ''>('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])


  // Build filters
  const filters: ItemLokasiFilters = {
    page: currentPage,
    per_page: perPage,
  }

  if (lokasiFilter) filters.lokasi_id = lokasiFilter
  if (materialFilter) filters.material_id = materialFilter
  if (tipeLokasiFilter) filters.tipe_lokasi = tipeLokasiFilter
  if (tipeFilter) filters.tipe = tipeFilter
  if (dateFromFilter) filters.date_from = dateFromFilter
  if (dateToFilter) filters.date_to = dateToFilter

  // Fetch stock movements
  const { data: movementsResponse, isLoading } = useQuery({
    queryKey: ['stock-movements', filters, debouncedSearchTerm],
    queryFn: () => itemLokasiService.getStockMovements(filters),
    staleTime: 1000 * 60 * 1, // 1 minute
  })

  const movements = movementsResponse?.data || []
  const paginationMeta = movementsResponse?.meta || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null
  }

  // Filter movements by search term (client-side for material name, lokasi name, etc)
  const filteredMovements = movements.filter((movement) => {
    if (!debouncedSearchTerm) return true
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      movement.material?.name?.toLowerCase().includes(searchLower) ||
      movement.material?.sku?.toLowerCase().includes(searchLower) ||
      movement.lokasi?.nama?.toLowerCase().includes(searchLower) ||
      movement.keterangan?.toLowerCase().includes(searchLower)
    )
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setLokasiFilter(undefined)
    setMaterialFilter(undefined)
    setTipeLokasiFilter('')
    setTipeFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pergerakan Stok</h1>
        <p className="text-sm text-gray-600 mt-1">
          Riwayat pergerakan stok material di semua lokasi
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari material, lokasi, atau keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filter Grid */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <LokasiSelect
                    value={lokasiFilter}
                    onValueChange={(value) => {
                      setLokasiFilter(value as number | undefined)
                      setCurrentPage(1)
                    }}
                    placeholder="Semua Lokasi"
                    showAllOption={true}
                    allOptionLabel="Semua Lokasi"
                    searchable={true}
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <MaterialSelect
                    value={materialFilter ? String(materialFilter) : ''}
                    onChange={(value) => {
                      setMaterialFilter(value ? Number(value) : undefined)
                      setCurrentPage(1)
                    }}
                    placeholder="Semua Material"
                    searchable={true}
                    showAllOption={true}
                    allOptionLabel="Semua Material"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Pergerakan
                  </label>
                  <select
                    value={tipeFilter}
                    onChange={(e) => {
                      setTipeFilter(e.target.value as 'masuk' | 'keluar' | 'transfer' | 'adjustment' | '')
                      setCurrentPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="masuk">Masuk</option>
                    <option value="keluar">Keluar</option>
                    <option value="transfer">Transfer</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dari Tanggal
                  </label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => {
                      setDateFromFilter(e.target.value)
                      setCurrentPage(1)
                    }}
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
                    onChange={(e) => {
                      setDateToFilter(e.target.value)
                      setCurrentPage(1)
                    }}
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
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <PergerakanStokTable movements={filteredMovements} isLoading={isLoading} />

      {/* Pagination */}
      {paginationMeta && paginationMeta.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <Pagination
              currentPage={paginationMeta.current_page}
              totalPages={paginationMeta.last_page || 1}
              perPage={paginationMeta.per_page}
              total={paginationMeta.total}
              from={paginationMeta.from}
              to={paginationMeta.to}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              itemLabel="pergerakan"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

