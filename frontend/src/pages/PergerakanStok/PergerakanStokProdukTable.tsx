import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ProdukLokasiPergerakan } from '../../services/inventory'
import { ArrowDown, ArrowUp, Settings, Cake, ShoppingCart } from 'lucide-react'

interface PergerakanStokProdukTableProps {
  movements: ProdukLokasiPergerakan[]
  isLoading: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ALASAN_LABELS: Record<string, string> = {
  rusak: 'Rusak',
  konsumsi_owner: 'Konsumsi Owner',
  koreksi: 'Koreksi',
  lainnya: 'Lainnya',
}

const isMixPreparation = (movement: ProdukLokasiPergerakan) =>
  movement.reference_type?.includes('MixPreparation')

const isPesanan = (movement: ProdukLokasiPergerakan) =>
  movement.reference_type?.includes('Pesanan')

const getTipeLabel = (movement: ProdukLokasiPergerakan) => {
  if (movement.tipe === 'adjustment') {
    return movement.alasan ? ALASAN_LABELS[movement.alasan] || 'Adjustment' : 'Adjustment'
  }
  if (movement.tipe === 'masuk' && isMixPreparation(movement)) return 'Mix Prep. Pastry'
  if (movement.tipe === 'masuk' && isPesanan(movement)) return 'Pembatalan Pesanan'
  if (movement.tipe === 'keluar' && isPesanan(movement)) return 'Penjualan'
  const labels: Record<string, string> = {
    masuk: 'Masuk',
    keluar: 'Keluar',
    adjustment: 'Adjustment',
  }
  return labels[movement.tipe] || movement.tipe
}

const getTipeVariant = (movement: ProdukLokasiPergerakan): 'default' | 'destructive' | 'secondary' | 'outline' => {
  if (isMixPreparation(movement)) return 'outline'
  if (movement.tipe === 'masuk') return 'default'
  if (movement.tipe === 'keluar') return 'destructive'
  return 'outline'
}

const getTipeIcon = (movement: ProdukLokasiPergerakan) => {
  if (isMixPreparation(movement)) return <Cake className="h-3 w-3" />
  if (isPesanan(movement) && movement.tipe === 'keluar') return <ShoppingCart className="h-3 w-3" />
  if (movement.tipe === 'masuk') return <ArrowDown className="h-3 w-3" />
  if (movement.tipe === 'keluar') return <ArrowUp className="h-3 w-3" />
  return <Settings className="h-3 w-3" />
}

export const PergerakanStokProdukTable = ({
  movements,
  isLoading,
}: PergerakanStokProdukTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pergerakan Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="space-y-1"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-4 bg-gray-200 rounded w-20"></div></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Tidak ada pergerakan stok pastry ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pergerakan Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement) => {
                const quantityDisplay = movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity?.toString()
                const mixPrep = isMixPreparation(movement)

                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(movement.tanggal)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.lokasi?.nama || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{movement.lokasi?.tipe || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.produk?.nama || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Kode: {movement.produk?.kode || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={getTipeVariant(movement)}
                        className={`flex items-center gap-1 w-fit ${mixPrep ? 'border-amber-300 bg-amber-50 text-amber-800' : ''}`}
                      >
                        {getTipeIcon(movement)}
                        {getTipeLabel(movement)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          Sebelum: <span className="text-gray-900 font-medium">{movement.quantity_before?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {quantityDisplay}
                        </div>
                        <div className="text-xs text-gray-500">
                          Sesudah: <span className="text-gray-900 font-semibold">{movement.quantity_after?.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.user?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-600 max-w-md whitespace-normal break-words leading-snug">
                        {movement.keterangan || '-'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
