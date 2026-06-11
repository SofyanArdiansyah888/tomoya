import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Package, Warehouse, Store, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Receipt, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { itemLokasiService } from '../../services/inventory'
import { cashFlowService } from '../../services/cashflow'
import { useUnpaidOrders } from '../../hooks/useOrders'
import { formatPrice } from '../../lib/formatPrice'
import { formatLocalDate } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { CategorySelect } from '../../components/forms/CategorySelect'
import { useState, useMemo } from 'react'
import { Button } from '../../components/ui/button'
import { useNavigate } from 'react-router-dom'

export const Dashboard = () => {
  const navigate = useNavigate()
  const [selectedGudangCategory, setSelectedGudangCategory] = useState<number | string>("")
  
  // Tanggal lokal (WIB) — jangan pakai toISOString() karena itu UTC
  const today = new Date()
  const todayStr = formatLocalDate(today)
  const todayEndStr = todayStr

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthStartStr = formatLocalDate(monthStart)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const monthEndStr = formatLocalDate(monthEnd)

  // Get low stock materials from gudang
  const { data: lowStockGudang, isLoading: loadingGudang } = useQuery({
    queryKey: ['low-stock-materials', 'gudang'],
    queryFn: () => itemLokasiService.getLowStockMaterials('gudang'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Get low stock materials from toko
  const { data: lowStockToko, isLoading: loadingToko } = useQuery({
    queryKey: ['low-stock-materials', 'toko'],
    queryFn: () => itemLokasiService.getLowStockMaterials('toko'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Get today's cash flow stats
  const { data: statsToday, isLoading: loadingStatsToday } = useQuery({
    queryKey: ['cash-flow-stats', 'today'],
    queryFn: () => cashFlowService.getCashFlowStats({
      date_from: todayStr,
      date_to: todayEndStr
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Get this month's cash flow stats
  const { data: statsMonth, isLoading: loadingStatsMonth } = useQuery({
    queryKey: ['cash-flow-stats', 'month'],
    queryFn: () => cashFlowService.getCashFlowStats({
      date_from: monthStartStr,
      date_to: monthEndStr
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Get unpaid orders
  const { data: unpaidOrdersData, isLoading: loadingUnpaidOrders } = useUnpaidOrders({
    per_page: 5,
    sort_by: 'tanggal_penjualan',
    sort_order: 'desc'
  })

  const lowStockGudangList = lowStockGudang || []
  const filteredLowStockGudang = useMemo(() => {
    if (!selectedGudangCategory || selectedGudangCategory === " ") return lowStockGudangList
    return lowStockGudangList.filter((item: any) => {
      const cid = Number(item.material?.category_id ?? item.material?.category?.id ?? -1)
      return cid === Number(selectedGudangCategory)
    })
  }, [lowStockGudangList, selectedGudangCategory])
  const lowStockTokoList = lowStockToko || []
  const unpaidOrders = unpaidOrdersData?.data || []
  
  const pemasukanHariIni = statsToday?.total_pemasukan || 0
  const pengeluaranHariIni = statsToday?.total_pengeluaran || 0
  const pemasukanBulanIni = statsMonth?.total_pemasukan || 0
  const pengeluaranBulanIni = statsMonth?.total_pengeluaran || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen inventori Tomoya Coffee</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pemasukan Hari Ini */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pemasukan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingStatsToday ? '...' : formatPrice(pemasukanHariIni)}
                </p>
                <p className="text-sm text-gray-500">
                  Dari arus kas
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran Hari Ini */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pengeluaran Hari Ini</p>
                <p className="text-2xl font-bold text-red-600">
                  {loadingStatsToday ? '...' : formatPrice(pengeluaranHariIni)}
                </p>
                <p className="text-sm text-gray-500">
                  Dari arus kas
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pemasukan Bulan Ini */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pemasukan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingStatsMonth ? '...' : formatPrice(pemasukanBulanIni)}
                </p>
                <p className="text-sm text-gray-500">
                  Dari arus kas
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran Bulan Ini */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pengeluaran Bulan Ini</p>
                <p className="text-2xl font-bold text-red-600">
                  {loadingStatsMonth ? '...' : formatPrice(pengeluaranBulanIni)}
                </p>
                <p className="text-sm text-gray-500">
                  Dari arus kas
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-600" />
              Pesanan Belum Bayar
            </CardTitle>
            {unpaidOrders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pesanan?status=belum_bayar')}
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingUnpaidOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : unpaidOrders.length > 0 ? (
            <div className="space-y-3">
              {unpaidOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/pesanan`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        Pesanan #{order.id}
                      </p>
                      {order.nama_client && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-600">{order.nama_client}</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{formatDate(order.tanggal_penjualan || order.created_at)}</span>
                      <span>•</span>
                      <span>{order.items?.length || 0} item</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-amber-600">
                      {formatPrice(order.total_jumlah || order.total_harga || 0)}
                    </span>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      Belum Bayar
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Tidak ada pesanan yang belum dibayar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Low Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Material Rendah - Gudang</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockGudangList.length}</p>
                <p className="text-sm text-red-600">
                  Perlu perhatian
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Material Rendah - Toko</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockTokoList.length}</p>
                <p className="text-sm text-red-600">
                  Perlu perhatian
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Store className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Material Rendah</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lowStockGudangList.length + lowStockTokoList.length}
                </p>
                <p className="text-sm text-gray-500">
                  Di semua lokasi
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gudang Low Stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-red-600" />
                Material Rendah - Gudang
              </CardTitle>
              <div className="w-48">
                <CategorySelect
                  value={selectedGudangCategory}
                  onValueChange={(v) => {
                    const num = typeof v === 'string' ? Number(v) : (v as number)
                    setSelectedGudangCategory(Number.isFinite(num) ? num : "")
                  }}
                  placeholder="Semua Kategori"
                  filterPredicate={(c: any) => c.nama?.toLowerCase().includes('bahan')}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGudangCategory(" ")}
                className="shrink-0"
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingGudang ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : filteredLowStockGudang.length > 0 ? (
              <div className="space-y-3">
                {filteredLowStockGudang.map((item: any, index: number) => (
                  <div
                    key={`${item.lokasi_id}-${item.material_id}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.current_stock === 0
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${
                        item.current_stock === 0 ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        {item.material?.name || 'Material tidak ditemukan'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-sm ${
                          item.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          Stok: {item.current_stock} {item.material?.unit_gudang}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          Min: {item.min_stock} {item.material?.unit_gudang || ''}
                        </p>
                        {item.lokasi && (
                          <>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-600">{item.lokasi.nama}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        item.current_stock === 0 ? 'text-red-500' : 'text-yellow-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Tidak ada material dengan stok rendah di gudang</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toko Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-red-600" />
              Material Rendah - Toko
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingToko ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : lowStockTokoList.length > 0 ? (
              <div className="space-y-3">
                {lowStockTokoList.map((item: any, index: number) => (
                  <div
                    key={`${item.lokasi_id}-${item.material_id}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.current_stock === 0
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${
                        item.current_stock === 0 ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        {item.material?.name || 'Material tidak ditemukan'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-sm ${
                          item.current_stock === 0 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          Stok: {item.current_stock} {item.material?.unit || ''}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          Min: {item.min_stock} {item.material?.unit || ''}
                        </p>
                        {item.lokasi && (
                          <>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-600">{item.lokasi.nama}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        item.current_stock === 0 ? 'text-red-500' : 'text-yellow-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Tidak ada material dengan stok rendah di toko</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
