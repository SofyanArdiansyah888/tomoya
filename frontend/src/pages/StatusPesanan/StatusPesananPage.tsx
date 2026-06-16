import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Package, Receipt } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { formatPrice } from '../../lib/formatPrice'
import { publicOrderService, PublicPesanan } from '../../services/publicOrder'
import tomoyaLogo from '../../assets/tomoya_logo.jpg'

const REFETCH_INTERVAL_MS = 10_000

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Tunai',
    card: 'Kartu',
    qris: 'QRIS',
    other: 'Lainnya',
  }
  return labels[method] || method
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getCoffeeStrengthLabel = (strength?: string) => {
  const labels: Record<string, string> = {
    strong: 'Strong',
    medium: 'Medium',
    soft: 'Soft',
    other: 'Other',
  }
  return strength ? labels[strength] || strength : null
}

export const StatusPesananPage = () => {
  const prevNoPesananRef = useRef<string | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)

  const { data: order, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['public-latest-order'],
    queryFn: () => publicOrderService.getLatestOrder(),
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!order?.no_pesanan) return

    if (prevNoPesananRef.current && prevNoPesananRef.current !== order.no_pesanan) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 3000)
      prevNoPesananRef.current = order.no_pesanan
      return () => clearTimeout(timer)
    }

    prevNoPesananRef.current = order.no_pesanan
  }, [order?.no_pesanan])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-8">
          <img
            src={tomoyaLogo}
            alt="Tomoya Coffee"
            className="h-20 w-20 mx-auto rounded-xl border-2 border-amber-300 shadow-md object-cover mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">Status Pesanan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pembaruan otomatis setiap {REFETCH_INTERVAL_MS / 1000} detik
            {isFetching && !isLoading ? ' · memuat...' : ''}
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-12 text-center shadow-sm">
            <div className="h-8 w-48 bg-amber-100 rounded animate-pulse mx-auto mb-4" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white p-12 text-center shadow-sm">
            <Receipt className="h-14 w-14 mx-auto text-amber-300 mb-4" />
            <p className="text-lg font-medium text-gray-700">Belum ada pesanan</p>
            <p className="text-sm text-gray-500 mt-2">Pesanan terbaru akan muncul di sini</p>
          </div>
        ) : (
          <OrderDisplay order={order} isHighlighted={isHighlighted} />
        )}

        {dataUpdatedAt > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Terakhir diperbarui: {new Date(dataUpdatedAt).toLocaleTimeString('id-ID')}
          </p>
        )}
      </div>
    </div>
  )
}

function OrderDisplay({ order, isHighlighted }: { order: PublicPesanan; isHighlighted: boolean }) {
  const total = order.subtotal ?? order.total_jumlah
  const items = order.items || []

  return (
    <div
      className={`rounded-2xl border bg-white shadow-lg overflow-hidden transition-all duration-500 ${
        isHighlighted ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-200'
      }`}
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-5 text-white text-center">
        <p className="text-sm font-medium opacity-90">Nomor Pesanan</p>
        <p className="text-3xl sm:text-4xl font-bold tracking-wide mt-1">{order.no_pesanan}</p>
        {order.nama_client && (
          <p className="text-lg mt-2 opacity-95">{order.nama_client}</p>
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge
            variant="outline"
            className={`text-base px-4 py-1 ${
              order.status === 'bayar'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {order.status === 'bayar' ? 'Sudah Bayar' : 'Belum Bayar'}
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-1">
            {getPaymentMethodLabel(order.metode_pembayaran)}
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {formatDate(order.tanggal_penjualan || order.created_at)}
          </span>
          {order.lokasi?.nama && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm">{order.lokasi.nama}</span>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">Item Pesanan</h2>
          </div>
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-start gap-4 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-lg">
                    {item.produk?.nama || 'Produk'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.quantity} × {formatPrice(item.harga_satuan)}
                  </p>
                  {item.coffee_strength && (
                    <p className="text-xs text-amber-700 mt-1">
                      Kekuatan: {getCoffeeStrengthLabel(item.coffee_strength)}
                    </p>
                  )}
                  {item.catatan && (
                    <p className="text-xs text-gray-500 mt-1 italic">Catatan: {item.catatan}</p>
                  )}
                </div>
                <p className="font-semibold text-gray-900 whitespace-nowrap">
                  {formatPrice(item.subtotal)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-amber-200">
          <span className="text-lg font-semibold text-gray-700">Total</span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-700">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
