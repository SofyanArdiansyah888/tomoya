import { useState } from 'react'
import { useMasterKas, useMasterKasStats, useMasterKasFilterOptions } from '../../hooks/useMasterKas'
import { MasterKasStats } from './MasterKasStats'
import { MasterKasFilters } from './MasterKasFilters'
import { MasterKasTable } from './MasterKasTable'

export const DaftarMasterKas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [jenisFilter, setJenisFilter] = useState<string>('')
  const [kategoriFilter, setKategoriFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortFilter] = useState('created_at-desc')

  const { data: masterKasData, isLoading, error } = useMasterKas({
    search: searchTerm || undefined,
    jenis: jenisFilter as 'pemasukan' | 'pengeluaran' | undefined,
    kategori: kategoriFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: sortFilter.split('-')[0],
    sort_order: sortFilter.split('-')[1] as 'asc' | 'desc',
    page: 1,
    per_page: 15,
  })
  const { data: stats } = useMasterKasStats({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })
  const { data: filterOptions } = useMasterKasFilterOptions()

  const entries = masterKasData?.data || []

  const handleResetFilters = () => {
    setSearchTerm('')
    setJenisFilter('')
    setKategoriFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Master Kas</h1>
          <p className="text-gray-600">Lihat pemasukan dan pengeluaran kas resmi</p>
        </div>
      </div>

      <MasterKasStats stats={stats} />

      <MasterKasFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        jenisFilter={jenisFilter}
        onJenisChange={setJenisFilter}
        kategoriFilter={kategoriFilter}
        onKategoriChange={setKategoriFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        kategoriOptions={filterOptions?.kategoris || []}
        onReset={handleResetFilters}
      />

      <MasterKasTable
        entries={entries}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  )
}
