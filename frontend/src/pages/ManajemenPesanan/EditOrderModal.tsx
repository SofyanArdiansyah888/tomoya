import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Modal } from '../../components/ui/modal'
import { useUpdateOrder } from '../../hooks/useOrders'
import { formatPrice } from '../../lib/formatPrice'
import { produkLokasiService } from '../../services/inventory'
import { productService } from '../../services/products'
import { Pesanan } from '../../types/order'
import { CartItem } from '../Kasir/CartItem'

const DEFAULT_SHOP_LOCATION_ID = 2

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Pesanan | null
}

interface CartItemType {
  line_id: string
  produk_id: number
  quantity: number
  produk: any
  coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
  coffee_grams?: number
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
  const [initialItemsSnapshot, setInitialItemsSnapshot] = useState<string>('')

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

  const buildItemsPayload = (cartItems: CartItemType[]) =>
    cartItems.map(item => ({
      produk_id: Number(item.produk_id),
      quantity: Number(item.quantity),
      harga_satuan: Number(item.produk?.harga || 0),
      coffee_strength: item.coffee_strength,
      coffee_grams: typeof item.coffee_grams === 'number' ? item.coffee_grams : undefined,
      target_material_id: resolveCoffeeMaterialId(item.produk),
    }))

  const snapshotItems = (cartItems: CartItemType[]) =>
    JSON.stringify(
      buildItemsPayload(cartItems)
        .map(item => ({
          produk_id: item.produk_id,
          quantity: item.quantity,
          harga_satuan: item.harga_satuan,
          coffee_strength: item.coffee_strength ?? null,
          coffee_grams: item.coffee_grams ?? null,
        }))
        .sort((a, b) =>
          `${a.produk_id}-${a.quantity}-${a.harga_satuan}`.localeCompare(
            `${b.produk_id}-${b.quantity}-${b.harga_satuan}`
          )
        )
    )

  // Initialize form from order
  useEffect(() => {
    if (order && isOpen) {
      // Convert order items to cart format
      const cartItems: CartItemType[] = (order.items || []).map((item: any, idx: number) => ({
        line_id: `line-${item.produk_id}-${idx}`,
        produk_id: item.produk_id,
        quantity: item.quantity,
        produk: item.produk || { 
          id: item.produk_id,
          nama: 'Produk tidak ditemukan',
          harga: item.harga_satuan || item.harga || 0,
          kategori: item.produk?.kategori || undefined,
          resep: item.produk?.resep || undefined,
        },
        coffee_strength: item.coffee_strength,
        coffee_grams: typeof item.coffee_grams === 'number' ? item.coffee_grams : undefined,
      }))
      
      setCart(cartItems)
      setInitialItemsSnapshot(snapshotItems(cartItems))
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
  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(cart.filter(item => item.line_id !== lineId))
    } else {
      setCart(cart.map(item => 
        item.line_id === lineId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  // Handle add product
  const handleAddProduct = (product: any) => {
    const existingItem = cart.find(item => item.produk_id === product.id)
    if (existingItem) {
      handleQuantityChange(existingItem.line_id, existingItem.quantity + 1)
    } else {
      setCart([...cart, {
        line_id: `line-${product.id}-${Date.now()}`,
        produk_id: product.id,
        quantity: 1,
        produk: product
      }])
    }
    setShowAddProduct(false)
    setSearchProduct('')
  }

  // Handle remove item
  const handleRemoveItem = (lineId: string) => {
    setCart(cart.filter(item => item.line_id !== lineId))
  }

  const handleCoffeeOptionChange = (lineId: string, strength: 'strong' | 'medium' | 'soft' | 'other' | undefined, grams: number) => {
    setCart(cart.map(item => (
      item.line_id === lineId ? { ...item, coffee_strength: strength, coffee_grams: grams } : item
    )))
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
  const resolveCoffeeMaterialId = (product: any): number | undefined => {
    const materials = product?.resep?.recipeMaterials || product?.resep?.recipe_materials || []
    // Priority 1: flagged coffee material
    for (const rm of materials) {
      if (rm?.material?.is_bahan_kopi) return rm.material_id
    }
    // Priority 2: name includes coffee keywords
    for (const rm of materials) {
      const name = rm?.material?.nama?.toLowerCase?.() || ''
      if (name.includes('kopi') || name.includes('coffee') || name.includes('espresso')) return rm.material_id
    }
    // Priority 3: unit grams
    for (const rm of materials) {
      const unit = rm?.material?.unit?.toLowerCase?.() || ''
      if (unit.includes('gram')) return rm.material_id
    }
    return undefined
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!order) return

    if (cart.length === 0) {
      toast.error('Pesanan harus memiliki minimal 1 item')
      return
    }

    const itemsPayload = buildItemsPayload(cart)
    const itemsChanged = snapshotItems(cart) !== initialItemsSnapshot

    const orderData: any = {
      status: paymentStatus,
      metode_pembayaran: paymentMethod,
      subtotal: Number(subtotal),
    }

    if (itemsChanged) {
      orderData.items = itemsPayload
    }
    if (notes) orderData.catatan = notes
    if (clientName) orderData.nama_client = clientName
    if (paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number') {
      orderData.uang_dibayar = Number(amountPaid)
      orderData.kembalian = Number(kembalian)
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
                ).map((product: any) => {
                  const stock = getProductStock(product.id)
                  return ( 
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 rounded border bg-white hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div>
                        <p className="font-medium text-sm">{product.nama}</p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(product.harga || 0)}
                          {product.stockable && (
                            <span className="ml-2">
                              • Stok: {stock}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.produk_id} className="relative">
                  <CartItem
                    item={item as any}
                    availableStock={getProductStock(item.produk_id)}
                    onQuantityChange={handleQuantityChange}
                    onRemove={(lineId) => handleRemoveItem(lineId)}
                    onCoffeeOptionChange={(lineId, strength, grams) => handleCoffeeOptionChange(lineId, strength, grams)}
                  />
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

