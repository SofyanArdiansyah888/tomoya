import { Minus, Plus, Trash2, Coffee } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { formatPrice } from '../../lib/formatPrice'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useState, useEffect } from 'react'

interface CartItemProps {
  item: {
    produk_id: number
    quantity: number
    produk: any
    coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
    coffee_grams?: number
  }
  availableStock: number
  onQuantityChange: (produkId: number, newQuantity: number) => void
  onRemove?: (produkId: number) => void
  onCoffeeOptionChange: (produkId: number, strength: 'strong' | 'medium' | 'soft' | 'other', grams: number) => void
}

export const CartItem = ({
  item,
  availableStock,
  onQuantityChange,
  onRemove,
  onCoffeeOptionChange
}: CartItemProps) => {
  const [strength, setStrength] = useState<'strong' | 'medium' | 'soft' | 'other'>(item.coffee_strength || 'medium')
  const [grams, setGrams] = useState<number>(typeof item.coffee_grams === 'number' ? item.coffee_grams : 8)

  useEffect(() => {
    setStrength(item.coffee_strength || 'medium')
    setGrams(typeof item.coffee_grams === 'number' ? item.coffee_grams : 8)
  }, [item.coffee_strength, item.coffee_grams])

  const strengthDefaults: Record<'strong'|'medium'|'soft'|'other', number> = {
    strong: 10,
    medium: 8,
    soft: 6,
    other: 0,
  }

  const handleSelectStrength = (s: 'strong' | 'medium' | 'soft' | 'other') => {
    setStrength(s)
    const defaultGrams = strengthDefaults[s]
    setGrams(defaultGrams)
    onCoffeeOptionChange(item.produk_id, s, defaultGrams)
  }

  const handleChangeGrams = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setGrams(num)
      onCoffeeOptionChange(item.produk_id, strength, num)
    }
  }
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
          {item.produk?.resep?.is_kopi && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Coffee className="h-3 w-3" />
                  Kopi
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <Label className="text-xs">Kekuatan</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['strong','medium','soft','other'] as const).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={strength === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectStrength(s)}
                        className="text-xs"
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`grams-${item.produk_id}`} className="text-xs">Gram Kopi</Label>
                    <Input
                      id={`grams-${item.produk_id}`}
                      type="number"
                      min={0}
                      step={1}
                      value={grams}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeGrams(e.target.value)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
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
