import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCashFlows, useCashFlowStats } from '../../hooks/useCashFlow'
import { cashFlowService } from '../../services/cashflow'
import { ArusKasStats } from './ArusKasStats'
import { ArusKasFilters } from './ArusKasFilters'
import { ArusKasTable, SelectionMode } from './ArusKasTable'
import { Button } from '../../components/ui/button'
import { isCashMetode } from '../../types/cashflow'
import { formatLocalDate } from '../../lib/utils'

export const DaftarArusKas = () => {
  const queryClient = useQueryClient()
  const today = formatLocalDate()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [masterKasFilter, setMasterKasFilter] = useState('')
  const [sortFilter, setSortFilter] = useState('created_at-desc')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const masukMasterKasFilter = masterKasFilter === ''
    ? undefined
    : masterKasFilter === 'true'

  const { data: cashFlowData, isLoading, error } = useCashFlows({
    search: searchTerm || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    masuk_master_kas: masukMasterKasFilter,
    sort_by: sortFilter.split('-')[0],
    sort_order: sortFilter.split('-')[1] as 'asc' | 'desc',
    page: 1,
    per_page: 15,
  })
  const { data: stats } = useCashFlowStats({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })
  const cashFlows = cashFlowData?.data || []

  const handleResetFilters = () => {
    const todayStr = formatLocalDate()
    setSearchTerm('')
    setDateFrom(todayStr)
    setDateTo(todayStr)
    setMasterKasFilter('')
    setSortFilter('created_at-desc')
  }

  const handleSelectionChange = (ids: number[], mode: SelectionMode) => {
    setSelectedIds(ids)
    setSelectionMode(mode)
  }

  const handleSync = async (action: 'add' | 'remove') => {
    const idsToProcess = selectedIds.filter(id => {
      const cf = cashFlows.find(c => c.id === id)
      if (!cf) return false
      return action === 'add' ? !cf.masuk_master_kas : cf.masuk_master_kas
    })

    if (idsToProcess.length === 0) {
      toast.error(action === 'add'
        ? 'Pilih arus kas yang belum masuk master kas'
        : 'Pilih arus kas yang sudah masuk master kas')
      return
    }

    if (action === 'add') {
      const selected = cashFlows.filter(cf => idsToProcess.includes(cf.id))
      const jenisSet = new Set(selected.map(cf => cf.jenis))
      const lokasiSet = new Set(selected.map(cf => cf.lokasi_id))
      const metodeGroupSet = new Set(selected.map(cf => isCashMetode(cf.metode_pembayaran) ? 'cash' : 'non_cash'))
      if (jenisSet.size > 1) {
        toast.error('Recap hanya boleh dari jenis yang sama')
        return
      }
      if (lokasiSet.size > 1) {
        toast.error('Recap hanya boleh dari lokasi yang sama')
        return
      }
      if (metodeGroupSet.size > 1) {
        toast.error('Recap hanya boleh dari metode pembayaran yang sama (Cash atau Non Cash)')
        return
      }
    }

    setIsSyncing(true)
    try {
      const result = await cashFlowService.syncToMasterKas(idsToProcess, action)
      toast.success(result.message)
      setSelectedIds([])
      setSelectionMode(null)
      queryClient.invalidateQueries({ queryKey: ['cashFlows'] })
      queryClient.invalidateQueries({ queryKey: ['masterKas'] })
      queryClient.invalidateQueries({ queryKey: ['masterKasStats'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal sinkronisasi master kas')
    } finally {
      setIsSyncing(false)
    }
  }

  const selectedToAdd = selectionMode === 'add' ? selectedIds.length : 0
  const selectedToRemove = selectionMode === 'remove' ? selectedIds.length : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Arus Kas</h1>
          <p className="text-gray-600">Pilih beberapa entri untuk direkap ke 1 master kas</p>
        </div>
        <div className="flex gap-2">
          {selectedToAdd > 0 && (
            <Button
              onClick={() => handleSync('add')}
              disabled={isSyncing}
            >
              Recap ke Master Kas ({selectedToAdd})
            </Button>
          )}
          {selectedToRemove > 0 && (
            <Button
              variant="outline"
              onClick={() => handleSync('remove')}
              disabled={isSyncing}
            >
              Keluarkan dari Master Kas ({selectedToRemove})
            </Button>
          )}
        </div>
      </div>

      <ArusKasStats stats={stats} />

      <ArusKasFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        masterKasFilter={masterKasFilter}
        onMasterKasFilterChange={setMasterKasFilter}
        onReset={handleResetFilters}
      />

      <ArusKasTable
        cashFlows={cashFlows}
        isLoading={isLoading}
        error={error || undefined}
        selectedIds={selectedIds}
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  )
}
