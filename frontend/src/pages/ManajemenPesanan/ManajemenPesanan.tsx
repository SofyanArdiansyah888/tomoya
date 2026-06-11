import { Calendar, Eye, FileText, Package, Printer, Tag, Edit } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SearchInput } from '../../components/ui/search-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useOrder, useOrders } from '../../hooks/useOrders'
import { formatPrice } from '../../lib/formatPrice'
import { Pesanan } from '../../types/order'
import { printChecker } from '../../utils/printChecker'
import { printLabel } from '../../utils/printLabel'
import { printReceipt } from '../../utils/printReceipt'
import { EditOrderModal } from './EditOrderModal'
import { OrderDetailModal } from './OrderDetailModal'
import { toast } from 'sonner'
import { orderService } from '../../services/order'

export const ManajemenPesanan = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortFilter, setSortFilter] = useState('tanggal_penjualan-desc')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [editOrderId, setEditOrderId] = useState<number | null>(null)
  const [hoveredOrderId, setHoveredOrderId] = useState<number | null>(null)
  const [printingOrderId, setPrintingOrderId] = useState<number | null>(null)

  const { data: ordersData, isLoading } = useOrders({
    search: searchTerm || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: sortFilter.split('-')[0],
    sort_order: sortFilter.split('-')[1] as 'asc' | 'desc',
    page: 1,
    per_page: 15
  })

  const { data: orderDetail } = useOrder(selectedOrderId || 0)
  const { data: editOrderDetail } = useOrder(editOrderId || 0)

  const orders = ordersData?.data || []

  const handleViewDetail = (order: Pesanan) => {
    setSelectedOrderId(order.id)
  }

  const handleEdit = (order: Pesanan) => {
    setEditOrderId(order.id)
  }

  
  const handlePrintReceipt = async (order: Pesanan, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (printingOrderId === order.id) return
    
    try {
      setPrintingOrderId(order.id)
      
      // Always fetch full order details to ensure items are loaded
      const orderData = await orderService.getOrder(order.id)

      // Check if items exist
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        toast.error('Tidak dapat mencetak struk: Item pesanan tidak ditemukan')
        return
      }

      // Convert order items to cart format for printReceipt
      const cart = orderData.items.map((item: any) => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        produk: item.produk || { nama: 'Produk tidak ditemukan', harga: item.harga_satuan || item.harga || 0 }
      }))

      if (cart.length === 0) {
        toast.error('Tidak dapat mencetak struk: Keranjang kosong')
        return
      }

      // Directly print without modal
      printReceipt(
        cart,
        orderData.total_jumlah || orderData.total_harga || 0,
        orderData.metode_pembayaran,
        orderData.catatan,
        orderData.tanggal_penjualan || orderData.created_at,
        orderData.no_pesanan,
        orderData.nama_client,
        orderData.uang_dibayar,
        orderData.kembalian
      )
    } catch (error: any) {
      console.error('Error printing receipt:', error)
      toast.error('Gagal mencetak struk: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'))
    } finally {
      setPrintingOrderId(null)
    }
  }

  const handlePrintChecker = async (order: Pesanan, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (printingOrderId === order.id) return
    
    try {
      setPrintingOrderId(order.id)
      
      // Always fetch full order details to ensure items are loaded
      const orderData = await orderService.getOrder(order.id)

      // Check if items exist
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        toast.error('Tidak dapat mencetak checker: Item pesanan tidak ditemukan')
        return
      }

      // Convert order items to cart format
      const cart = orderData.items.map((item: any) => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        produk: item.produk || { nama: 'Produk tidak ditemukan', harga: item.harga_satuan || item.harga || 0 }
      }))

      if (cart.length === 0) {
        toast.error('Tidak dapat mencetak checker: Keranjang kosong')
        return
      }

      const formattedDate = new Date(orderData.tanggal_penjualan || orderData.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      printChecker(
        cart,
        orderData.catatan,
        formattedDate,
        orderData.tanggal_penjualan || orderData.created_at,
        orderData.nama_client
      )
    } catch (error: any) {
      console.error('Error printing checker:', error)
      toast.error('Gagal mencetak checker: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'))
    } finally {
      setPrintingOrderId(null)
    }
  }

  const handlePrintLabel = async (order: Pesanan, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (printingOrderId === order.id) return
    
    try {
      setPrintingOrderId(order.id)
      
      // Always fetch full order details to ensure items are loaded
      const orderData = await orderService.getOrder(order.id)

      // Check if items exist
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        toast.error('Tidak dapat mencetak label: Item pesanan tidak ditemukan')
        return
      }

      // Convert order items to cart format
      const cart = orderData.items.map((item: any) => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        produk: item.produk || { nama: 'Produk tidak ditemukan', harga: item.harga_satuan || item.harga || 0 }
      }))

      if (cart.length === 0) {
        toast.error('Tidak dapat mencetak label: Keranjang kosong')
        return
      }

      printLabel(
        cart,
        orderData.nama_client,
        orderData.no_pesanan,
        orderData.tanggal_penjualan || orderData.created_at
      )
    } catch (error: any) {
      console.error('Error printing label:', error)
      toast.error('Gagal mencetak label: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'))
    } finally {
      setPrintingOrderId(null)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setSortFilter('tanggal_penjualan-desc')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="text-gray-600">Daftar semua pesanan yang telah terjadi</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="w-full min-w-0">
                <SearchInput
                  label="Cari Pesanan"
                  placeholder="Cari pesanan..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari Tanggal
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sampai Tanggal
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="w-full"
                />
              </div>

              
            </div>
            <div className="pt-7">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">No Pesanan</TableHead>
                    <TableHead className="w-[140px]">Tanggal</TableHead>
                    <TableHead className="min-w-[50px]">Items</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[130px]">Metode</TableHead>
                    <TableHead className="w-[140px]">User</TableHead>
                    <TableHead className="min-w-[150px] max-w-[200px]">Catatan</TableHead>
                    <TableHead className="text-right w-[160px]">Pembayaran</TableHead>
                    <TableHead className="w-[220px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="text-sm">{order.no_pesanan || `#${order.id}`}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm whitespace-nowrap">
                            {new Date(order.tanggal_penjualan || order.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.tanggal_penjualan || order.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items && order.items.length > 0 ? (
                          <div 
                            className="relative"
                            onMouseEnter={() => setHoveredOrderId(order.id)}
                            onMouseLeave={() => setHoveredOrderId(null)}
                          >
                            <div className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                              {order.items.length} item • {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} pcs
                            </div>
                            {hoveredOrderId === order.id && (
                              <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[250px] max-w-[400px]">
                                <div className="text-xs font-semibold text-gray-700 mb-2 pb-2 border-b">
                                  Daftar Item ({order.items.length})
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                  {order.items.map((item: any, index: number) => (
                                    <div key={item.id || index} className="flex items-start justify-between gap-2 text-xs">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                          {item.produk?.nama || 'Produk tidak ditemukan'}
                                        </div>
                                        {item.catatan && (
                                          <div className="text-gray-500 text-[10px] mt-0.5">
                                            Note: {item.catatan}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right whitespace-nowrap">
                                        <div className="font-medium text-gray-700">
                                          {item.quantity} pcs
                                        </div>
                                        {item.harga_satuan && (
                                          <div className="text-gray-500 text-[10px]">
                                            @ {formatPrice(item.harga_satuan)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {order.items.reduce((sum: number, item: any) => sum + (item.harga_satuan || 0) * item.quantity, 0) > 0 && (
                                  <div className="mt-2 pt-2 border-t text-xs font-semibold text-gray-700">
                                    Subtotal: {formatPrice(order.items.reduce((sum: number, item: any) => sum + (item.harga_satuan || 0) * item.quantity, 0))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs py-0.5 ${
                            order.status === 'bayar' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {order.status === 'bayar' ? 'Bayar' : 'Belum Bayar'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs py-0.5">
                          {getPaymentMethodLabel(order.metode_pembayaran)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{order.user?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        {order.catatan ? (
                          <div className="text-xs text-gray-600 line-clamp-2 max-w-[200px]">
                            {order.catatan}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm whitespace-nowrap">
                            <span className="text-xs text-gray-500">Total: </span>
                            <span className="font-semibold text-green-600">
                              {formatPrice(order.total_jumlah || order.total_harga || 0)}
                            </span>
                          </div>
                          {order.metode_pembayaran === 'cash' && (order as any).uang_dibayar && (
                            <div className="text-xs whitespace-nowrap">
                              <span className="text-gray-500">Dibayar: </span>
                              <span className="font-medium text-gray-700">
                                {formatPrice((order as any).uang_dibayar)}
                              </span>
                            </div>
                          )}
                          {order.metode_pembayaran === 'cash' && (order as any).kembalian !== undefined && (order as any).kembalian !== null && (
                            <div className="text-xs whitespace-nowrap">
                              <span className="text-gray-500">Kembalian: </span>
                              <span className={`font-medium ${(order as any).kembalian >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice((order as any).kembalian)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {order.status === 'belum_bayar' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(order)}
                              className="text-amber-600 border-amber-300 hover:bg-amber-50 text-xs px-2 py-1 h-7"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(order)}
                            className="text-xs px-2 py-1 h-7"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handlePrintReceipt(order, e)}
                            disabled={printingOrderId === order.id}
                            className="text-xs px-2 py-1 h-7"
                            title="Cetak Struk"
                          >
                            <Printer className="h-3 w-3 mr-1" />
                            {printingOrderId === order.id ? '...' : 'Struk'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handlePrintChecker(order, e)}
                            disabled={printingOrderId === order.id}
                            className="text-xs px-2 py-1 h-7"
                            title="Cetak Checker"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {printingOrderId === order.id ? '...' : 'Checker'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handlePrintLabel(order, e)}
                            disabled={printingOrderId === order.id}
                            className="text-xs px-2 py-1 h-7"
                            title="Cetak Label"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {printingOrderId === order.id ? '...' : 'Label'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pesanan</h3>
              <p className="text-gray-500">
                Belum ada pesanan yang ditemukan dengan filter yang dipilih.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        order={orderDetail || null}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={!!editOrderId}
        onClose={() => setEditOrderId(null)}
        order={editOrderDetail || null}
      />
    </div>
  )
}
