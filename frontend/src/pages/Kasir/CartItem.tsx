import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { formatPrice } from '../../lib/formatPrice'

interface CartItemProps {
  item: {
    produk_id: number
    quantity: number
    produk: any
  }
  availableStock: number
  onQuantityChange: (produkId: number, newQuantity: number) => void
  onRemove?: (produkId: number) => void
}

export const CartItem = ({
  item,
  availableStock,
  onQuantityChange,
  onRemove
}: CartItemProps) => {
  return (
    <>
     <h4
          className="font-medium text-xs uppercase leading-tight text-gray-900 break-words whitespace-pre-line mb-0.5"
          style={{ wordBreak: 'break-word' }}
        >
          {item.produk?.nama}
        </h4>
    <div className="flex gap-2 px-2 !mt-0  bg-gray-50 rounded-md min-h-[56px] items-stretch">
      {/* Thumbnail, jika ingin diaktifkan bisa ganti w-10 h-10 */}
      {/* ... */}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
       
        {/* Harga, stock, hapus button */}
        <div className="flex items-center gap-1 flex-wrap w-full min-w-0">
          <span className="text-xs text-gray-500 break-words">
            {formatPrice(item.produk?.harga || 0)}
          </span>
          {item.produk?.stockable && (
            <span className="text-[10px] text-gray-400 ml-2">
              Stok: {availableStock}
            </span>
          )}
          <div className="flex-1"></div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.produk_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 flex-shrink-0"
              title="Hapus item"
              tabIndex={0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Kontrol kuantitas */}
      <div className="flex flex-col justify-center flex-shrink-0 ml-2 min-w-[32px]">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 px-0"
            onClick={() => onQuantityChange(item.produk_id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Kurangi"
            tabIndex={0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs font-semibold w-6 text-center select-none">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 px-0"
            onClick={() => onQuantityChange(item.produk_id, item.quantity + 1)}
            disabled={
              item.produk?.stockable &&
              item.quantity >= availableStock
            }
            aria-label="Tambah"
            tabIndex={0}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
    </>
  )
}
