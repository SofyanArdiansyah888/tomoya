import { Modal } from '../../components/ui/modal'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar, DollarSign, Package, CheckCircle } from 'lucide-react'
import { formatPrice } from '../../lib/formatPrice'
import { Pesanan } from '../../types/order'
import { useUpdateOrderStatus } from '../../hooks/useOrders'

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Pesanan | null
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Tunai',
    card: 'Kartu',
    qris: 'QRIS',
    other: 'Lainnya'
  }
  return labels[method] || method
}

export const OrderDetailModal = ({ isOpen, onClose, order }: OrderDetailModalProps) => {
  const updateOrderStatus = useUpdateOrderStatus()

  if (!order) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleMarkAsPaid = () => {
    if (order.status === 'belum_bayar') {
      // Calculate total amount (use subtotal if available, otherwise total_jumlah)
      const totalAmount = (order as any).subtotal || order.total_jumlah || order.total_harga || 0
      
      updateOrderStatus.mutate(
        { 
          id: order.id, 
          status: 'bayar',
          uang_dibayar: totalAmount // Set uang_dibayar equal to total when marking as paid
        },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Pesanan #${order.no_pesanan}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Tanggal Pesanan</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-base">
                {formatDate(order.tanggal_penjualan || order.created_at)}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Status Pembayaran</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={order.status === 'bayar' 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
                }
              >
                {order.status === 'bayar' ? 'Bayar' : 'Belum Bayar'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Metode Pembayaran</label>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="mt-1">
                {getPaymentMethodLabel(order.metode_pembayaran)}
              </Badge>
            </div>
          </div>

          {(order.lokasi || order.toko) && (
            <div>
              <label className="text-sm font-medium text-gray-500">Lokasi</label>
              <p className="text-base mt-1">
                {(order.lokasi || order.toko)?.nama || '-'}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">User</label>
            <p className="text-base mt-1">{order.user?.name || '-'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Total</label>
            <p className="text-lg font-bold text-green-600 mt-1">
              {formatPrice(order.total_jumlah || order.total_harga || 0)}
            </p>
          </div>

          {order.metode_pembayaran === 'cash' && order.status === 'bayar' && (order as any).uang_dibayar && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Uang Dibayar</label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {formatPrice((order as any).uang_dibayar)}
                </p>
              </div>

              {(order as any).kembalian !== null && (order as any).kembalian !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kembalian</label>
                  <p className={`text-base font-bold mt-1 ${(order as any).kembalian >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice((order as any).kembalian)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {order.catatan && (
          <div>
            <label className="text-sm font-medium text-gray-500">Catatan Pesanan (lama)</label>
            <p className="text-base mt-1 p-3 bg-gray-50 rounded-md">
              {order.catatan}
            </p>
          </div>
        )}

        {/* Items */}
        <div>
          <label className="text-sm font-medium text-gray-500 mb-3 block">Items</label>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produk</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Harga</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="font-medium">{item.produk?.nama || 'Produk tidak ditemukan'}</span>
                            {item.catatan && (
                              <p className="text-xs text-gray-500 mt-0.5">Catatan: {item.catatan}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{item.quantity}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatPrice(item.harga_satuan || item.harga || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPrice((item.harga_satuan || item.harga || 0) * item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Tidak ada item
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {formatPrice(order.total_jumlah || order.total_harga || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'belum_bayar' && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={handleMarkAsPaid}
              disabled={updateOrderStatus.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {updateOrderStatus.isPending ? 'Memproses...' : 'Tandai sebagai Bayar'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

