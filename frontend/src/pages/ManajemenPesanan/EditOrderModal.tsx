import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '../../components/ui/modal'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { formatPrice } from '../../lib/formatPrice'
import { Pesanan } from '../../types/order'
import { useUpdateOrder } from '../../hooks/useOrders'
import { CartItem } from '../Kasir/CartItem'
import { produkLokasiService } from '../../services/inventory'
import { Plus, X } from 'lucide-react'
import { productService } from '../../services/products'
import { toast } from 'sonner'

const DEFAULT_SHOP_LOCATION_ID = 2

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Pesanan | null
}

interface CartItemType {
  produk_id: number
  quantity: number
  produk: any
}

export const EditOrderModal = ({ isOpen, onClose, order }: EditOrderModalProps) => {
  const [cart, setCart] = useState<CartItemType[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris' | 'other'>('cash')
  const [paymentStatus, setPaymentStatus] = useState<'bayar' | 'belum_bayar'>('belum_bayar')
  const [notes, setNotes] = useState('')
  const [clientName, setClientName] = useState('')
  const [qrisImage, setQrisImage] = useState<File | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [searchProduct, setSearchProduct] = useState('')
  const [amountPaid, setAmountPaid] = useState<number | ''>('')

  const updateOrder = useUpdateOrder()

  // Fetch product stock
  const { data: productStocks } = useQuery({
    queryKey: ['product-stocks-by-recipe', DEFAULT_SHOP_LOCATION_ID],
    queryFn: async () => {
      return await produkLokasiService.getProductStockByRecipe(DEFAULT_SHOP_LOCATION_ID)
    },
    enabled: isOpen,
  })

  // Fetch products for adding
  const { data: products } = useQuery({
    queryKey: ['products', { search: searchProduct, is_active: true }],
    queryFn: async () => {
      return await productService.getProducts({
        search: searchProduct,
        is_active: true,
      })
    },
    enabled: showAddProduct && isOpen,
  })

  // Initialize form from order
  useEffect(() => {
    if (order && isOpen) {
      // Convert order items to cart format
      const cartItems: CartItemType[] = (order.items || []).map((item: any) => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        produk: item.produk || { 
          id: item.produk_id,
          nama: 'Produk tidak ditemukan',
          harga: item.harga_satuan || item.harga || 0
        }
      }))
      
      setCart(cartItems)
      setPaymentMethod(order.metode_pembayaran || 'cash')
      setPaymentStatus(order.status || 'belum_bayar')
      setNotes(order.catatan || '')
      setClientName(order.nama_client || '')
      setQrisImage(null) // Reset QRIS image
      setAmountPaid((order as any).uang_dibayar || '')
    }
  }, [order, isOpen])

  // Get product stock
  const getProductStock = (productId: number): number => {
    if (!productStocks) return 0
    const stock = productStocks.find((s: any) => s.produk_id === productId)
    return stock?.quantity || 0
  }

  // Handle quantity change
  const handleQuantityChange = (produkId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0
      setCart(cart.filter(item => item.produk_id !== produkId))
    } else {
      setCart(cart.map(item => 
        item.produk_id === produkId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  // Handle add product
  const handleAddProduct = (product: any) => {
    const existingItem = cart.find(item => item.produk_id === product.id)
    if (existingItem) {
      handleQuantityChange(product.id, existingItem.quantity + 1)
    } else {
      setCart([...cart, {
        produk_id: product.id,
        quantity: 1,
        produk: product
      }])
    }
    setShowAddProduct(false)
    setSearchProduct('')
  }

  // Handle remove item
  const handleRemoveItem = (produkId: number) => {
    setCart(cart.filter(item => item.produk_id !== produkId))
  }

  // Calculate total
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.quantity * (item.produk?.harga || 0))
  }, 0)
  const total = subtotal
  const kembalian = paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' && amountPaid > 0
    ? Math.max(0, amountPaid - total)
    : 0

  // Reset amountPaid when payment method or status changes (if not cash or not bayar)
  useEffect(() => {
    if (paymentMethod !== 'cash' || paymentStatus !== 'bayar') {
      setAmountPaid('')
    }
  }, [paymentMethod, paymentStatus])

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!order) return

    if (cart.length === 0) {
      toast.error('Pesanan harus memiliki minimal 1 item')
      return
    }

    // Validate stock
    for (const item of cart) {
      if (item.produk?.stockable) {
        const availableStock = getProductStock(item.produk_id)
        if (item.quantity > availableStock) {
          toast.error(`${item.produk?.nama}: Stok tidak mencukupi! Stok tersedia: ${availableStock}`)
          return
        }
      }
    }

    // Create FormData for file upload
    const orderData: any = {
      status: paymentStatus,
      metode_pembayaran: paymentMethod,
      subtotal: subtotal,
      uang_dibayar: paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' ? amountPaid : undefined,
      kembalian: paymentMethod === 'cash' && paymentStatus === 'bayar' ? kembalian : undefined,
      items: cart.map(item => ({
        produk_id: item.produk_id,
        quantity: item.quantity,
        harga_satuan: item.produk?.harga || 0,
      })),
    }

    if (notes) {
      orderData.catatan = notes
    }

    if (clientName) {
      orderData.nama_client = clientName
    }

    // gambar_qris: for file, should be handled appropriately by API (if needed)
    if (qrisImage && paymentMethod === 'qris') {
      orderData.gambar_qris = qrisImage
    }

    updateOrder.mutate(
      { id: order.id, orderData },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  if (!order) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Pesanan"
        size="lg"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat data pesanan...</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pesanan #${order.no_pesanan}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Cart Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Items</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddProduct(!showAddProduct)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Produk
            </Button>
          </div>

          {/* Add Product Search */}
          {showAddProduct && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Input
                type="text"
                placeholder="Cari produk..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="mb-3"
              />
              <div className="max-h-40 overflow-y-auto space-y-2">
                {products?.data?.filter((p: any) => 
                  !cart.find(item => item.produk_id === p.id)
                ).map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div>
                      <p className="font-medium text-sm">{product.nama}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(product.harga || 0)}
                        {product.stockable && (
                          <span className="ml-2">
                            • Stok: {getProductStock(product.id)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.produk_id} className="relative">
                  <CartItem
                    item={item}
                    availableStock={getProductStock(item.produk_id)}
                    onQuantityChange={handleQuantityChange}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveItem(item.produk_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Tidak ada item. Klik "Tambah Produk" untuk menambahkan.
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 pt-4 border-t">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Client (Opsional)
            </label>
            <Input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Masukkan nama client..."
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Pembayaran
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'bayar' | 'belum_bayar')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="belum_bayar">Belum Bayar</option>
              <option value="bayar">Bayar</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="cash">Tunai</option>
              <option value="card">Kartu</option>
              <option value="qris">QRIS</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          {/* QRIS Image Upload */}
          {paymentMethod === 'qris' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bukti QRIS (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setQrisImage(file)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
              {qrisImage && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">File terpilih: {qrisImage.name}</p>
                  <img
                    src={URL.createObjectURL(qrisImage)}
                    alt="QRIS Preview"
                    className="w-full h-32 object-contain border border-gray-300 rounded-md mt-1"
                  />
                </div>
              )}
              {order.gambar_qris && !qrisImage && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Gambar QRIS saat ini:</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/storage/${order.gambar_qris}`}
                    alt="QRIS Current"
                    className="w-full h-32 object-contain border border-gray-300 rounded-md mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan untuk pesanan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t pb-3 border-b">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(total)}
            </span>
          </div>

          {/* Uang Dibayar - Only show for cash payment and bayar status */}
          {paymentMethod === 'cash' && paymentStatus === 'bayar' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uang Dibayar
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">Rp</span>
                <Input
                  type="text"
                  value={typeof amountPaid === 'number' && amountPaid > 0 
                    ? new Intl.NumberFormat('id-ID').format(amountPaid)
                    : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    // Remove all non-digit characters
                    const cleaned = value.replace(/[^\d]/g, '')
                    
                    if (cleaned === '') {
                      setAmountPaid('')
                    } else {
                      const numValue = parseFloat(cleaned)
                      if (!isNaN(numValue) && numValue >= 0) {
                        setAmountPaid(numValue)
                      }
                    }
                  }}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Kembalian - Only show for cash payment and bayar status when amountPaid is provided */}
          {paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' && amountPaid > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-700">Kembalian:</span>
              <span className={`text-lg font-bold ${kembalian >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(kembalian)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <form onSubmit={handleSubmit} className="pt-4 border-t">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateOrder.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={updateOrder.isPending || cart.length === 0}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {updateOrder.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

