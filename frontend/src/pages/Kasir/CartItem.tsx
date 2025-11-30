import { Minus, Plus, Trash2, Coffee } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatPrice } from '../../lib/formatPrice'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useState, useEffect } from 'react'

interface CartItemProps {
  item: {
    line_id: string
    produk_id: number
    quantity: number
    produk: any
    coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
    coffee_grams?: number
  }
  availableStock: number
  onQuantityChange: (lineId: string, newQuantity: number) => void
  onRemove?: (lineId: string) => void
  onCoffeeOptionChange: (lineId: string, strength: 'strong' | 'medium' | 'soft' | 'other', grams: number) => void
}

export const CartItem = ({
  item,
  availableStock,
  onQuantityChange,
  onRemove,
  onCoffeeOptionChange
}: CartItemProps) => {
  const strengthDefaults: Record<'strong'|'medium'|'soft'|'other', number> = {
    strong: 40,
    medium: 35,
    soft: 30,
    other: 0,
  }
  const initialStrength: ('strong' | 'medium' | 'soft' | 'other' | undefined) = item.coffee_strength
  const initialGrams: number | undefined = typeof item.coffee_grams === 'number' ? item.coffee_grams : undefined
  const [strength, setStrength] = useState<'strong' | 'medium' | 'soft' | 'other' | undefined>(initialStrength)
  const [grams, setGrams] = useState<number | undefined>(initialGrams)

  useEffect(() => {
    const s = item.coffee_strength
    const g = typeof item.coffee_grams === 'number' ? item.coffee_grams : undefined
    setStrength(s)
    setGrams(g)
  }, [item.coffee_strength, item.coffee_grams])


  const handleSelectStrength = (s: 'strong' | 'medium' | 'soft' | 'other') => {
    setStrength(s)
    const defaultGrams = strengthDefaults[s]
    setGrams(defaultGrams)
    onCoffeeOptionChange(item.line_id, s, defaultGrams)
  }

  const handleChangeGrams = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setGrams(num)
      onCoffeeOptionChange(item.line_id, strength, num)
    }
  }
  const isCoffee = !!(item?.produk?.kategori?.nama && (
    item.produk.kategori.nama.toLowerCase().includes('coffee') ||
    item.produk.kategori.nama.toLowerCase().includes('kopi')
  ))
  return (
    <>
    <div className="flex gap-2 p-2 bg-gray-50 rounded-md items-stretch">
      {/* Thumbnail, jika ingin diaktifkan bisa ganti w-10 h-10 */}
      {/* ... */}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {item.produk?.nama}
          </div>
          {item.produk?.stockable && (
            <span className="text-[10px] text-gray-400">Stok: {availableStock}</span>
          )}
          {isCoffee && strength && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="capitalize text-[10px] py-0.5 px-1">{strength}</Badge>
              
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-600">
              {formatPrice(item.produk?.harga || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isCoffee && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Kopi" title="Kopi">
                    <Coffee className="h-4 w-4" />
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
                          className="text-xs capitalize px-1"
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
                        value={typeof grams === 'number' ? grams : ''}
                        disabled={strength !== 'other'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeGrams(e.target.value)}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 px-0"
                onClick={() => onQuantityChange(item.line_id, item.quantity - 1)}
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
                onClick={() => onQuantityChange(item.line_id, item.quantity + 1)}
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
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.line_id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 flex-shrink-0"
                title="Hapus item"
                tabIndex={0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
    </>
  )
}
