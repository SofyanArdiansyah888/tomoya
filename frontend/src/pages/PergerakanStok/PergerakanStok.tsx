import { useState, useEffect, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Search } from 'lucide-react'
import {
  itemLokasiService,
  produkLokasiService,
  ItemLokasiFilters,
  ProdukLokasiPergerakanFilters,
  ProdukAdjustmentAlasan,
} from '../../services/inventory'
import { PergerakanStokTable } from './PergerakanStokTable'
import { PergerakanStokProdukTable } from './PergerakanStokProdukTable'
import { Pagination } from '../../components/ui/pagination'
import { LokasiSelect, MaterialSelect, ProdukSelect } from '../../components/forms'

type MovementTab = 'material' | 'pastry'

const filterSelectClass =
  'w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'

const FilterField = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="w-full min-w-0">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
)

export const PergerakanStok = () => {
  const [activeTab, setActiveTab] = useState<MovementTab>('material')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [lokasiFilter, setLokasiFilter] = useState<number | undefined>()
  const [materialFilter, setMaterialFilter] = useState<number | undefined>()
  const [produkFilter, setProdukFilter] = useState<number | undefined>()
  const [tipeFilter, setTipeFilter] = useState<'masuk' | 'keluar' | 'transfer' | 'adjustment' | 'mix_preparation' | ''>('')
  const [produkTipeFilter, setProdukTipeFilter] = useState<'masuk' | 'keluar' | 'adjustment' | ''>('')
  const [alasanFilter, setAlasanFilter] = useState<ProdukAdjustmentAlasan | ''>('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const materialFilters: ItemLokasiFilters = {
    page: currentPage,
    per_page: perPage,
  }
  if (lokasiFilter) materialFilters.lokasi_id = lokasiFilter
  if (materialFilter) materialFilters.material_id = materialFilter
  if (tipeFilter) materialFilters.tipe = tipeFilter
  if (dateFromFilter) materialFilters.date_from = dateFromFilter
  if (dateToFilter) materialFilters.date_to = dateToFilter

  const produkFilters: ProdukLokasiPergerakanFilters = {
    page: currentPage,
    per_page: perPage,
    tipe_lokasi: 'toko',
  }
  if (produkFilter) produkFilters.produk_id = produkFilter
  if (produkTipeFilter) produkFilters.tipe = produkTipeFilter
  if (alasanFilter) produkFilters.alasan = alasanFilter
  if (dateFromFilter) produkFilters.date_from = dateFromFilter
  if (dateToFilter) produkFilters.date_to = dateToFilter

  const { data: movementsResponse, isLoading: isLoadingMaterial } = useQuery({
    queryKey: ['stock-movements', materialFilters, debouncedSearchTerm],
    queryFn: () => itemLokasiService.getStockMovements(materialFilters),
    enabled: activeTab === 'material',
    staleTime: 1000 * 60 * 1,
  })

  const { data: produkMovementsResponse, isLoading: isLoadingProduk } = useQuery({
    queryKey: ['produk-stock-movements', produkFilters, debouncedSearchTerm],
    queryFn: () => produkLokasiService.getProdukMovements(produkFilters),
    enabled: activeTab === 'pastry',
    staleTime: 1000 * 60 * 1,
  })

  const isPastryTab = activeTab === 'pastry'
  const isLoading = isPastryTab ? isLoadingProduk : isLoadingMaterial
  const movements = movementsResponse?.data || []
  const produkMovements = produkMovementsResponse?.data || []
  const paginationMeta = (isPastryTab ? produkMovementsResponse?.meta : movementsResponse?.meta) || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
  }

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

  const filteredProdukMovements = produkMovements.filter((movement) => {
    if (!debouncedSearchTerm) return true
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (
      movement.produk?.nama?.toLowerCase().includes(searchLower) ||
      movement.produk?.kode?.toLowerCase().includes(searchLower) ||
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

  const handleTabChange = (tab: MovementTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm('')
    setDebouncedSearchTerm('')
    if (tab === 'pastry') {
      setLokasiFilter(undefined)
    }
    setMaterialFilter(undefined)
    setProdukFilter(undefined)
    setTipeFilter('')
    setProdukTipeFilter('')
    setAlasanFilter('')
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setLokasiFilter(undefined)
    setMaterialFilter(undefined)
    setProdukFilter(undefined)
    setTipeFilter('')
    setProdukTipeFilter('')
    setAlasanFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pergerakan Stok</h1>
        <p className="text-sm text-gray-600 mt-1">
          Riwayat pergerakan stok bahan (minuman) dan produk pastry di semua lokasi
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => handleTabChange('material')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'material'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bahan (Minuman)
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('pastry')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'pastry'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Produk Pastry
        </button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={
                  isPastryTab
                    ? 'Cari produk, lokasi, atau keterangan...'
                    : 'Cari material, lokasi, atau keterangan...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isPastryTab ? (
                <>
                  <FilterField label="Produk">
                    <ProdukSelect
                      value={produkFilter ? String(produkFilter) : ''}
                      onChange={(value) => {
                        setProdukFilter(value ? Number(value) : undefined)
                        setCurrentPage(1)
                      }}
                      placeholder="Semua Produk"
                      searchable={true}
                      showAllOption={true}
                      allOptionLabel="Semua Produk"
                      stockDivision="pastry"
                    />
                  </FilterField>
                  <FilterField label="Tipe Pergerakan">
                    <select
                      value={produkTipeFilter}
                      onChange={(e) => {
                        setProdukTipeFilter(e.target.value as typeof produkTipeFilter)
                        setCurrentPage(1)
                      }}
                      className={filterSelectClass}
                    >
                      <option value="">Semua Tipe</option>
                      <option value="masuk">Masuk</option>
                      <option value="keluar">Keluar</option>
                      <option value="adjustment">Adjustment</option>
                    </select>
                  </FilterField>
                  <FilterField label="Alasan">
                    <select
                      value={alasanFilter}
                      onChange={(e) => {
                        setAlasanFilter(e.target.value as ProdukAdjustmentAlasan | '')
                        setCurrentPage(1)
                      }}
                      className={filterSelectClass}
                    >
                      <option value="">Semua Alasan</option>
                      <option value="rusak">Rusak</option>
                      <option value="konsumsi_owner">Konsumsi Owner</option>
                      <option value="koreksi">Koreksi</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </FilterField>
                </>
              ) : (
                <>
                  <FilterField label="Lokasi">
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
                  </FilterField>
                  <FilterField label="Material">
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
                  </FilterField>
                  <FilterField label="Tipe Pergerakan">
                    <select
                      value={tipeFilter}
                      onChange={(e) => {
                        setTipeFilter(e.target.value as typeof tipeFilter)
                        setCurrentPage(1)
                      }}
                      className={filterSelectClass}
                    >
                      <option value="">Semua Tipe</option>
                      <option value="masuk">Masuk</option>
                      <option value="keluar">Keluar</option>
                      <option value="transfer">Transfer</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="mix_preparation">Mix Preparation</option>
                    </select>
                  </FilterField>
                </>
              )}

              <FilterField label="Dari Tanggal">
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full"
                />
              </FilterField>

              <FilterField label="Sampai Tanggal">
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full"
                />
              </FilterField>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isPastryTab ? (
        <PergerakanStokProdukTable movements={filteredProdukMovements} isLoading={isLoading} />
      ) : (
        <PergerakanStokTable movements={filteredMovements} isLoading={isLoading} />
      )}

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
