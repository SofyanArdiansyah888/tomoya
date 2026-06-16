import { DollarSign, Calendar, Package, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ArusKas, isCashMetode, sameMetodeRecapGroup } from '../../types/cashflow'
import { formatPrice } from '../../lib/formatPrice'

export type SelectionMode = 'add' | 'remove' | null

interface ArusKasTableProps {
  cashFlows: ArusKas[]
  isLoading: boolean
  error?: Error | null
  selectedIds: number[]
  selectionMode: SelectionMode
  onSelectionChange: (ids: number[], mode: SelectionMode) => void
}

const getJenisBadgeVariant = (jenis: string) => {
  return jenis === 'pemasukan' ? 'default' : 'destructive'
}

const getJenisIcon = (jenis: string) => {
  return jenis === 'pemasukan' ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : (
    <TrendingDown className="h-4 w-4 text-white-500" />
  )
}

const getJenisTextColor = (jenis: string) => {
  return jenis === 'pemasukan' ? 'text-green-600' : 'text-red-600'
}

export const ArusKasTable = ({
  cashFlows,
  isLoading,
  error,
  selectedIds,
  selectionMode,
  onSelectionChange,
}: ArusKasTableProps) => {
  const addSelectable = cashFlows.filter(cf => !cf.masuk_master_kas)
  const removeSelectable = cashFlows.filter(cf => cf.masuk_master_kas)

  const currentPool = selectionMode === 'remove' ? removeSelectable : addSelectable
  const currentPoolIds = currentPool.map(cf => cf.id)
  const allCurrentSelected = currentPoolIds.length > 0 && currentPoolIds.every(id => selectedIds.includes(id))

  const handleSelectAll = () => {
    const mode: SelectionMode = selectionMode === 'remove' ? 'remove' : 'add'
    if (allCurrentSelected) {
      onSelectionChange([], null)
    } else {
      onSelectionChange(currentPoolIds, mode)
    }
  }

  const handleToggle = (cashFlow: ArusKas, checked: boolean) => {
    const isAdd = !cashFlow.masuk_master_kas
    const mode: SelectionMode = isAdd ? 'add' : 'remove'

    if (checked) {
      if (selectionMode && selectionMode !== mode) {
        toast.error(isAdd
          ? 'Kosongkan pilihan keluarkan terlebih dahulu'
          : 'Kosongkan pilihan recap terlebih dahulu')
        return
      }

      if (mode === 'add' && selectedIds.length > 0) {
        const first = cashFlows.find(c => c.id === selectedIds[0])
        if (first) {
          if (first.jenis !== cashFlow.jenis) {
            toast.error('Recap hanya boleh dari jenis yang sama (pemasukan atau pengeluaran)')
            return
          }
          if (first.lokasi_id !== cashFlow.lokasi_id) {
            toast.error('Recap hanya boleh dari lokasi yang sama')
            return
          }
          if (!sameMetodeRecapGroup(first.metode_pembayaran, cashFlow.metode_pembayaran)) {
            toast.error('Recap hanya boleh dari metode pembayaran yang sama (Cash atau Non Cash)')
            return
          }
        }
      }

      onSelectionChange([...selectedIds, cashFlow.id], mode)
    } else {
      const next = selectedIds.filter(i => i !== cashFlow.id)
      onSelectionChange(next, next.length > 0 ? mode : null)
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Arus Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-red-500 mb-4">
              {error.message || 'Terjadi kesalahan saat memuat data arus kas'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Arus Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cashFlows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Arus Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada arus kas</h3>
            <p className="text-gray-500 mb-4">
              Belum ada arus kas yang ditemukan dengan filter yang dipilih.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Arus Kas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleSelectAll}
                    disabled={currentPoolIds.length === 0}
                    className="h-4 w-4 rounded border-gray-300"
                    title="Pilih semua (mode recap atau keluarkan)"
                  />
                </TableHead>
                <TableHead className='w-[150px]'>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori & Sub Kategori</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>Master Kas</TableHead>
                <TableHead className="text-right w-[150px]">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlows.map((cashFlow) => (
                <TableRow key={cashFlow.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cashFlow.id)}
                      onChange={(e) => handleToggle(cashFlow, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(cashFlow.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{cashFlow.deskripsi}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getJenisBadgeVariant(cashFlow.jenis)}>
                      <div className="flex items-center gap-1">
                        {getJenisIcon(cashFlow.jenis)}
                        {cashFlow.jenis_label}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{cashFlow.kategori_label}</span>
                      </div>
                      {cashFlow.sub_kategori_label ? (
                        <Badge variant="outline" className="text-xs mt-1 ml-6">
                          {cashFlow.sub_kategori_label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs ml-6">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{cashFlow.user?.name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span>
                      {isCashMetode(cashFlow.metode_pembayaran) ? 'Cash' : 'Non Cash'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {cashFlow.masuk_master_kas ? (
                      <Badge variant="default" className="text-xs">Sudah masuk</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${getJenisTextColor(cashFlow.jenis)}`}>
                      {formatPrice(cashFlow.jumlah)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
