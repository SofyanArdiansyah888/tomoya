import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { MaterialStock, ProdukStock } from '../../services/inventory'
import { formatPrice } from '../../lib/formatPrice'
import { AlertTriangle } from 'lucide-react'

interface StokTokoTableProps {
  mode?: 'material' | 'produk'
  inventory: MaterialStock[] | ProdukStock[]
  isLoading: boolean
}

export const StokTokoTable = ({
  mode = 'material',
  inventory,
  isLoading
}: StokTokoTableProps) => {
  const isProduk = mode === 'produk'
  const itemLabel = isProduk ? 'Produk' : 'Material'
  const priceLabel = isProduk ? 'Harga Jual' : 'Harga Beli'

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{itemLabel}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stok</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{priceLabel}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, col) => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse bg-gray-200 h-4 rounded w-24" />
                      </td>
                    ))}
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

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) {
      return { label: 'Habis', variant: 'destructive' as const }
    }
    if (quantity <= minStock) {
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{itemLabel}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{priceLabel}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item, index) => {
                const quantity = item.quantity ?? 0
                const minStock = isProduk
                  ? (item as ProdukStock).min_stock_level ?? 0
                  : (item as MaterialStock).material?.min_stock ?? 0
                const status = getStockStatus(quantity, minStock)
                const rowKey = isProduk
                  ? `${item.lokasi_id}-${(item as ProdukStock).produk_id}-${index}`
                  : `${item.lokasi_id}-${(item as MaterialStock).material_id}-${index}`

                return (
                  <tr key={rowKey} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.lokasi?.nama || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{item.lokasi?.kode || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isProduk ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {(item as ProdukStock).produk?.nama || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(item as ProdukStock).produk?.kode || ''}
                            {(item as ProdukStock).produk?.kategori?.nama
                              ? ` · ${(item as ProdukStock).produk?.kategori?.nama}`
                              : ''}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {(item as MaterialStock).material?.name || 'N/A'}
                          </div>
                          {(item as MaterialStock).material?.unit && (
                            <div className="text-sm text-gray-500">
                              Unit: {(item as MaterialStock).material?.unit}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {quantity.toLocaleString('id-ID')}
                        {!isProduk && (item as MaterialStock).material?.unit
                          ? ` ${(item as MaterialStock).material?.unit}`
                          : isProduk ? ' pcs' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-500">{minStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {isProduk
                          ? formatPrice((item as ProdukStock).produk?.harga ?? 0)
                          : (item as MaterialStock).material?.purchase_price
                            ? formatPrice((item as MaterialStock).material!.purchase_price)
                            : '-'}
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
