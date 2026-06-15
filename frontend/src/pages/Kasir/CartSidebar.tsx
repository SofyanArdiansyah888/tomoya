import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { ShoppingCart, CreditCard, Receipt, Tag } from 'lucide-react'
import { formatPrice } from '../../lib/formatPrice'
import { CartItem } from './CartItem'

interface CartItemType {
  line_id: string
  produk_id: number
  quantity: number
  produk: any
  coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
  coffee_grams?: number
  catatan?: string
}

interface CartSidebarProps {
  cart: CartItemType[]
  total: number
  subtotal: number
  amountPaid: number | ''
  kembalian: number
  paymentMethod: 'cash' | 'card' | 'qris' | 'other'
  paymentStatus: 'bayar' | 'belum_bayar'
  clientName: string
  qrisImage: File | null
  onClose: () => void
  onPaymentMethodChange: (method: 'cash' | 'card' | 'qris' | 'other') => void
  onPaymentStatusChange: (status: 'bayar' | 'belum_bayar') => void
  onClientNameChange: (name: string) => void
  onQrisImageChange: (file: File | null) => void
  onAmountPaidChange: (amount: number | '') => void
  onQuantityChange: (lineId: string, newQuantity: number) => void
  onRemoveItem?: (lineId: string) => void
  onCoffeeOptionChange: (lineId: string, strength: 'strong' | 'medium' | 'soft' | 'other', grams: number) => void
  onCatatanChange: (lineId: string, catatan: string) => void
  onCheckout: () => void
  onPrintReceipt: () => void
  onPrintLabel: () => void
  getProductStock: (productId: number) => number
  isCheckoutPending: boolean
}

export const CartSidebar = ({
  cart,
  total,
  amountPaid,
  kembalian,
  paymentMethod,
  paymentStatus,
  clientName,
  qrisImage,
  onClose,
  onPaymentMethodChange,
  onPaymentStatusChange,
  onClientNameChange,
  onQrisImageChange,
  onAmountPaidChange,
  onQuantityChange,
  onRemoveItem,
  onCoffeeOptionChange,
  onCatatanChange,
  onCheckout,
  onPrintReceipt,
  onPrintLabel,
  getProductStock,
  isCheckoutPending
}: CartSidebarProps) => {
  return (
    <div className="lg:col-span-1">
      <Card className="p-6 sticky top-6 border-2 border-blue-200 bg-blue-50/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keranjang</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ×
          </Button>
        </div>

        {cart && cart.length > 0 ? (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {cart.map((item) => (
                <CartItem
                  key={item.line_id}
                  item={item}
                  availableStock={getProductStock(item.produk_id)}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemoveItem}
                  onCoffeeOptionChange={onCoffeeOptionChange}
                  onCatatanChange={onCatatanChange}
                />
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              {/* Client Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Client (Opsional)
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => onClientNameChange(e.target.value)}
                  placeholder="Masukkan nama client..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Payment Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pembayaran
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => onPaymentStatusChange(e.target.value as 'bayar' | 'belum_bayar')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="bayar">Bayar</option>
                  <option value="belum_bayar">Belum Bayar</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => onPaymentMethodChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="cash">Tunai</option>
                  <option value="card">Kartu</option>
                  <option value="qris">QRIS</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* QRIS Image Upload - Only show when payment method is QRIS */}
              {paymentMethod === 'qris' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Bukti QRIS (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onQrisImageChange(file)
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
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Uang Dibayar - Only show for cash payment and bayar status */}
              {paymentMethod === 'cash' && paymentStatus === 'bayar' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uang Dibayar
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="text"
                      value={typeof amountPaid === 'number' && amountPaid > 0 
                        ? new Intl.NumberFormat('id-ID').format(amountPaid)
                        : ''}
                      onChange={(e) => {
                        const value = e.target.value
                        // Remove all non-digit characters
                        const cleaned = value.replace(/[^\d]/g, '')
                        
                        if (cleaned === '') {
                          onAmountPaidChange('')
                        } else {
                          const numValue = parseFloat(cleaned)
                          if (!isNaN(numValue) && numValue >= 0) {
                            onAmountPaidChange(numValue)
                          }
                        }
                      }}
                      placeholder="0"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        typeof amountPaid === 'number' && amountPaid > 0 && amountPaid < total
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-amber-500'
                      }`}
                    />
                  </div>
                  {typeof amountPaid === 'number' && amountPaid > 0 && amountPaid < total && (
                    <p className="mt-1 text-sm text-red-600">
                      Uang dibayar tidak boleh kurang dari total ({formatPrice(total)})
                    </p>
                  )}
                </div>
              )}

              {/* Kembalian - Only show for cash payment and bayar status when amountPaid is provided */}
              {paymentMethod === 'cash' && paymentStatus === 'bayar' && typeof amountPaid === 'number' && amountPaid > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-semibold text-gray-700">Kembalian:</span>
                  <span className={`text-lg font-bold ${kembalian >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(kembalian)}
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  onClick={onCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    isCheckoutPending ||
                    (paymentMethod === 'cash' && paymentStatus === 'bayar' && (
                      typeof amountPaid !== 'number' || amountPaid <= 0 || amountPaid < total
                    ))
                  }
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isCheckoutPending ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={onPrintReceipt}
                  disabled={cart.length === 0}
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  Cetak Struk
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={onPrintLabel}
                  disabled={cart.length === 0}
                >
                  <Tag className="h-5 w-5 mr-2" />
                  Cetak Label
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Keranjang kosong</p>
          </div>
        )}
      </Card>
    </div>
  )
}

