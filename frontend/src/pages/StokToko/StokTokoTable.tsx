import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { MaterialStock } from '../../services/inventory'
import { formatPrice } from '../../lib/formatPrice'
import { AlertTriangle } from 'lucide-react'

interface StokTokoTableProps {
  inventory: MaterialStock[]
  isLoading: boolean
}

export const StokTokoTable = ({
  inventory,
  isLoading
}: StokTokoTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stok</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-32"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse">
                        <div className="bg-gray-200 h-6 rounded w-20"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (inventory.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Tidak ada stok toko ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  const getStockStatus = (item: MaterialStock) => {
    if ((item.quantity ?? 0) <= 0) {
      return { label: 'Habis', variant: 'destructive' as const }
    }
    const minStock = item.material?.min_stock || 0
    if ((item.quantity ?? 0) <= minStock) {
      return { label: 'Stok Rendah', variant: 'destructive' as const }
    }
    return { label: 'Normal', variant: 'default' as const }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toko
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
            
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stok
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item, index) => {
                const status = getStockStatus(item)
                return (
                  <tr key={`${item.lokasi_id}-${item.material_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.lokasi?.nama || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.lokasi?.kode || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.material?.name || 'N/A'}
                      </div>
                      {item.material?.unit && (
                        <div className="text-sm text-gray-500">
                          Unit: {item.material.unit}
                        </div>
                      )}
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {(item.quantity !== undefined && item.quantity !== null)
                          ? item.quantity.toLocaleString('id-ID')
                          : '-'} {item.material?.unit || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-500">
                        {item.material?.min_stock || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {item.material?.purchase_price ? formatPrice(item.material.purchase_price) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                        {status.label === 'Stok Rendah' && <AlertTriangle className="h-3 w-3" />}
                        {status.label}
                      </Badge>
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

