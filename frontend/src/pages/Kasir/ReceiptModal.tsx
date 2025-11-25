import { useRef } from 'react'
import { Modal } from '../../components/ui/modal'
import { Button } from '../../components/ui/button'
import { Printer } from 'lucide-react'
import { formatPrice } from '../../lib/formatPrice'
import { toast } from 'sonner'
import tomoyaLogo from '../../assets/tomoya_logo.jpg'
import { printReceipt } from '../../utils/printReceipt'

interface CartItemType {
  produk_id: number
  quantity: number
  produk: any
}

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItemType[]
  total: number
  paymentMethod: 'cash' | 'card' | 'qris' | 'other'
  notes?: string
  orderDate?: string | Date
  noPesanan?: string
  uangDibayar?: number
  kembalian?: number
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

export const ReceiptModal = ({
  isOpen,
  onClose,
  cart,
  total,
  paymentMethod,
  notes,
  orderDate,
  noPesanan,
  uangDibayar,
  kembalian
}: ReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (cart.length === 0) {
      toast.error('Tidak ada item untuk dicetak')
      return
    }

    // Use the same print function as Kasir
    printReceipt(
      cart,
      total,
      paymentMethod,
      notes,
      orderDate,
      noPesanan,
      undefined,
      uangDibayar,
      kembalian
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Struk Pembayaran"
      size="md"
    >
      <div className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Keranjang kosong. Tidak ada struk untuk ditampilkan.</p>
          </div>
        ) : (
          <>
            {/* Receipt Preview */}
            <div 
              ref={receiptRef}
              className="receipt-print-container receipt bg-gradient-to-b from-white to-gray-50 border-2 border-gray-400 rounded-lg p-5 font-mono max-w-md mx-auto shadow-lg"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {/* Header */}
              <div className="receipt-header text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
                <div className="mb-2">
                  <img
                    src={tomoyaLogo}
                    alt="Tomoya Logo"
                    className="h-20 mx-auto mb-2"
                    style={{ maxHeight: 80 }}
                  />
                  <div className="w-20 h-0.5 bg-gray-400 mx-auto"></div>
                </div>
                <p className="text-sm text-gray-700 font-medium">Jl. Sudirman No. 456</p>
                <p className="text-sm text-gray-700 font-medium">Jakarta Pusat</p>
                <p className="text-sm text-gray-600 mt-2 font-semibold">
                  {(orderDate ? new Date(orderDate) : new Date()).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {noPesanan && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pesanan {noPesanan}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="receipt-items mb-4">
                <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
                  <div className="text-sm font-bold text-gray-900 uppercase tracking-wider">Daftar Item</div>
                </div>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.produk_id} className="receipt-item border-b border-dashed border-gray-200 pb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-0.5">{item.produk?.nama}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} × {formatPrice(item.produk?.harga || 0)}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900 ml-3 text-right">
                          {formatPrice((item.produk?.harga || 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="receipt-total border-t-2 border-dashed border-gray-400 pt-3 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                  <span className="text-sm font-medium text-gray-800">{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold bg-gray-100 -mx-2 px-2 py-2 rounded border-t-2 border-dashed border-gray-400">
                  <span className="text-gray-900">TOTAL:</span>
                  <span className="text-green-700">{formatPrice(total)}</span>
                </div>
                {paymentMethod === 'cash' && uangDibayar !== undefined && uangDibayar > 0 && (
                  <>
                    <div className="flex justify-between items-center mt-2 mb-1">
                      <span className="text-sm text-gray-600">Uang Dibayar:</span>
                      <span className="text-sm font-medium text-gray-800">{formatPrice(uangDibayar)}</span>
                    </div>
                    {kembalian !== undefined && kembalian !== null && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Kembalian:</span>
                        <span className="text-sm font-medium text-gray-800">{formatPrice(kembalian)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Notes */}
              {notes && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-300">
                  <div className="text-sm text-gray-700">
                    <strong className="font-semibold">Catatan:</strong> {notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="receipt-footer text-center mt-5 pt-3 border-t-2 border-dashed border-gray-400">
                <p className="text-sm text-gray-700 font-medium mb-1">Terima kasih atas kunjungan Anda</p>
                <p className="text-xs text-gray-600">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                <div className="mt-3 text-xs text-gray-500">
                  <p>---</p>
                </div>
              </div>
            </div>

        {/* Action Buttons */}
        <div className="flex gap-2 no-print">
          <Button
            onClick={handlePrint}
            className="flex-1"
            size="lg"
          >
            <Printer className="h-5 w-5 mr-2" />
            Cetak Struk
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
          >
            Tutup
          </Button>
        </div>
          </>
        )}
      </div>
    </Modal>
  )
}

