import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ItemLokasi } from '../../services/inventory'
import { ArrowDown, ArrowUp, ArrowRightLeft, Settings } from 'lucide-react'

interface PergerakanStokTableProps {
  movements: ItemLokasi[]
  isLoading: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTipeLabel = (tipe: string) => {
  const labels: Record<string, string> = {
    masuk: 'Masuk',
    keluar: 'Keluar',
    transfer: 'Transfer',
    adjustment: 'Adjustment',
    mix_preparation: 'Mix Preparation'
  }
  return labels[tipe] || tipe
}

const getTipeVariant = (tipe: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  if (tipe === 'masuk') return 'default'
  if (tipe === 'keluar') return 'destructive'
  if (tipe === 'transfer') return 'secondary'
  if (tipe === 'mix_preparation') return 'secondary'
  return 'outline'
}

const getTipeIcon = (tipe: string) => {
  if (tipe === 'masuk') return <ArrowDown className="h-3 w-3" />
  if (tipe === 'keluar') return <ArrowUp className="h-3 w-3" />
  if (tipe === 'transfer') return <ArrowRightLeft className="h-3 w-3" />
  if (tipe === 'mix_preparation') return <ArrowRightLeft className="h-3 w-3" />
  return <Settings className="h-3 w-3" />
}

export const PergerakanStokTable = ({
  movements,
  isLoading
}: PergerakanStokTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0 ">
          <div >
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
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
                    <td className="px-6 py-4 whitespace-nowrap"><div className="space-y-1"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-4 bg-gray-200 rounded w-20"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div></td>
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
          <p className="text-gray-500">Tidak ada pergerakan stok ditemukan</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pergerakan Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.map((movement) => {
                const tipeVariant = getTipeVariant(movement.tipe)
                const tipeIcon = getTipeIcon(movement.tipe)
                const quantityDisplay = movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity?.toString()

                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(movement.tanggal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.lokasi?.nama || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.lokasi?.tipe || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.material?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {movement.material?.sku || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={tipeVariant} className="flex items-center gap-1 w-fit">
                        {tipeIcon}
                        {getTipeLabel(movement.tipe)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {movement.lokasi?.tipe === 'gudang' ? (
                          <>
                            <div className="text-xs text-gray-500">
                              Sebelum: <span className="text-gray-900 font-medium">
                                {movement.quantity_gudang_before?.toLocaleString('id-ID')} {movement.material?.unit_gudang || ''}
                              </span>
                            </div>
                            <div className={`text-sm font-medium ${
                              (movement.quantity_gudang ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(movement.quantity_gudang ?? 0) > 0 ? `+${movement.quantity_gudang}` : movement.quantity_gudang} {movement.material?.unit_gudang || ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              Sesudah: <span className="text-gray-900 font-semibold">
                                {movement.quantity_gudang_after?.toLocaleString('id-ID')} {movement.material?.unit_gudang || ''}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500">
                              Sebelum: <span className="text-gray-900 font-medium">
                                {movement.quantity_before?.toLocaleString('id-ID')} {movement.material?.unit || ''}
                              </span>
                            </div>
                            <div className={`text-sm font-medium ${
                              movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {quantityDisplay} {movement.material?.unit || ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              Sesudah: <span className="text-gray-900 font-semibold">
                                {movement.quantity_after?.toLocaleString('id-ID')} {movement.material?.unit || ''}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.user?.name || '-'}
                      </div>
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

