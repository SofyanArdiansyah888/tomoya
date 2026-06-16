import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Eye, Package } from 'lucide-react'
import { Pagination } from '../../components/ui/pagination'
import { Pembelian } from '../../types/purchase'

interface PembelianTableProps {
  purchases: Pembelian[]
  isLoading: boolean
  paginationMeta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
  }
  onView?: (purchase: Pembelian) => void
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    cash: 'Brankas',
    transfer: 'Rekening',
  }
  return methods[method] || method
}

export const PembelianTable = ({
  purchases,
  isLoading,
  paginationMeta,
  onView,
  onPageChange,
  onPerPageChange
}: PembelianTableProps) => {
  console.log("PURCHASES",purchases)
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Pembelian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Tidak ada pembelian ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  const getTotalItems = (purchase: Pembelian) => {
    if (!purchase.items || purchase.items.length === 0) return 0
    return purchase.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Pembelian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.no_pembelian}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.supplier?.nama || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.lokasi?.nama || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(purchase.tanggal_pembelian)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.user?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatPrice(purchase.total_harga)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPaymentMethodLabel(purchase.metode_pembayaran)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                        <div className="text-sm text-gray-900 cursor-pointer">
                          {purchase.items ? `${purchase.items.length} item • ${getTotalItems(purchase)} pcs` : '-'}
                        </div>
                        
                        {/* Hover Popover */}
                        {purchase.items && purchase.items.length > 0 && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                            {/* Arrow */}
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                            <div className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-medium text-gray-900">
                                    Detail Item Pembelian
                                  </h4>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {purchase.items.map((item) => {
                                    const material = item.material;
                                    const isGudang = purchase.lokasi?.tipe === 'gudang';
                                    const displayUnit = material?.unit_gudang;
                                    const displayQuantity = item.quantity;
                                    
                                    return (
                                      <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-md border border-gray-100">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900">
                                            {material?.name || 'Material tidak ditemukan'}
                                          </div>
                                          
                                          {displayUnit && (
                                            <div className="text-xs text-gray-500">
                                              Unit: {displayUnit} {isGudang && '(Gudang)'}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {displayQuantity} {displayUnit}
                                          </div>
                                      
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {purchase.items.length > 0 && (
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-700">Total:</span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {formatPrice(purchase.total_harga)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(purchase)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginationMeta && paginationMeta.total > 0 && (
        <Card className="mt-4">
          <CardContent className="p-6">
            <Pagination
              currentPage={paginationMeta.current_page}
              totalPages={paginationMeta.last_page || 1}
              perPage={paginationMeta.per_page}
              total={paginationMeta.total}
              from={paginationMeta.from}
              to={paginationMeta.to}
              onPageChange={onPageChange || (() => {})}
              onPerPageChange={onPerPageChange}
              itemLabel="pembelian"
            />
          </CardContent>
        </Card>
      )}
    </>
  )
}

