import { DollarSign, Calendar, Package, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ArusKas } from '../../types/cashflow'
import { formatPrice } from '../../lib/formatPrice'

interface ArusKasTableProps {
  cashFlows: ArusKas[]
  isLoading: boolean
  error?: Error | null
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
  error
}: ArusKasTableProps) => {
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
            <p className="text-sm text-gray-500">
              Silakan coba lagi atau hubungi administrator jika masalah berlanjut
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
                <TableHead className='w-[150px]'>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori & Sub Kategori</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                {/* <TableHead>Lokasi</TableHead> */}
                <TableHead className="text-right w-[150px]">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlows.map((cashFlow) => (
                <TableRow key={cashFlow.id}>
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
                    <div className="flex items-center gap-2">
                      <span>
                        {cashFlow.metode_pembayaran === 'cash' ? 'Cash' : 'Non Cash'}
                      </span>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    {(cashFlow.lokasi || cashFlow.toko) ? (
                      <span className="text-sm text-gray-600">
                        {(cashFlow.lokasi || cashFlow.toko)?.nama}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell> */}
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

