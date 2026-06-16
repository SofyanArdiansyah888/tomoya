import { TrendingDown, TrendingUp, DollarSign, BarChart3, Wallet, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatPrice } from '../../lib/formatPrice'
import { MasterKasStats as MasterKasStatsType } from '../../types/masterKas'

interface MasterKasStatsProps {
  stats?: MasterKasStatsType
}

export const MasterKasStats = ({ stats }: MasterKasStatsProps) => {
  return ( 
    <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats ? formatPrice(stats.total_pemasukan) : 'Rp 0'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats ? formatPrice(stats.total_pengeluaran) : 'Rp 0'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats && stats.saldo_bersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats ? formatPrice(stats.saldo_bersih) : 'Rp 0'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats ? stats.total_transaksi : 0}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Brankas</CardTitle>
          <Wallet className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats && stats.saldo_brankas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats ? formatPrice(stats.saldo_brankas) : 'Rp 0'}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pemasukan {stats ? formatPrice(stats.pemasukan_brankas) : 'Rp 0'}
            {' · '}
            Pengeluaran {stats ? formatPrice(stats.pengeluaran_brankas) : 'Rp 0'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Rekening</CardTitle>
          <Landmark className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats && stats.saldo_rekening >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats ? formatPrice(stats.saldo_rekening) : 'Rp 0'}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pemasukan {stats ? formatPrice(stats.pemasukan_rekening) : 'Rp 0'}
            {' · '}
            Pengeluaran {stats ? formatPrice(stats.pengeluaran_rekening) : 'Rp 0'}
          </p>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
