import { useState } from 'react'
import { useCashFlows, useCashFlowStats, useFilterOptions } from '../../hooks/useCashFlow'
import { ArusKasStats } from './ArusKasStats'
import { ArusKasFilters } from './ArusKasFilters'
import { ArusKasTable } from './ArusKasTable'

export const DaftarArusKas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [jenisFilter, setJenisFilter] = useState<string>('')
  const [kategoriFilter, setKategoriFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortFilter, setSortFilter] = useState('tanggal-desc')

  // API calls
  const { data: cashFlowData, isLoading, error } = useCashFlows({
    search: searchTerm || undefined,
    jenis: jenisFilter as 'pemasukan' | 'pengeluaran' | undefined,
    kategori: kategoriFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: sortFilter.split('-')[0],
    sort_order: sortFilter.split('-')[1] as 'asc' | 'desc',
    page: 1,
    per_page: 15
  })
  const { data: stats } = useCashFlowStats({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined
  })
  const { data: filterOptions } = useFilterOptions()

  const cashFlows = cashFlowData?.data || []

  const handleResetFilters = () => {
    setSearchTerm('')
    setJenisFilter('')
    setKategoriFilter('')
    setDateFrom('')
    setDateTo('')
    setSortFilter('tanggal-desc')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Arus Kas</h1>
          <p className="text-gray-600">Lihat pemasukan dan pengeluaran kas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <ArusKasStats stats={stats} />

      {/* Filters */}
      <ArusKasFilters
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
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
        kategoriOptions={filterOptions?.kategoris || []}
        onReset={handleResetFilters}
      />

      {/* Cash Flows Table */}
      <ArusKasTable
        cashFlows={cashFlows}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  )
}
