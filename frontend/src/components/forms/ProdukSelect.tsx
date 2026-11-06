import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select-primitives'
import { SelectSearchField, selectContentSearchProps } from '../ui/SelectSearchField'
import { productService } from '../../services/products'
import { StockDivision } from '../../lib/stockDivision'

interface ProdukSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchable?: boolean 
  stockable?: boolean
  stockDivision?: StockDivision
  showAllOption?: boolean
  allOptionLabel?: string
}

export const ProdukSelect = ({ 
  value, 
  onChange, 
  placeholder = "Pilih produk", 
  disabled = false,
  className = "",
  searchable = true,
  stockable,
  stockDivision,
  showAllOption = false,
  allOptionLabel = "Semua Produk",
}: ProdukSelectProps) => {
  const [searchTerm, _] = useState('')
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search: searchTerm, stockable, stockDivision }],
    queryFn: () => productService.getProducts({
      search: searchTerm,
      ...(stockable !== undefined ? { stockable } : {}),
      ...(stockDivision ? { stock_division: stockDivision } : {}),
    })
  })
 
  // Filter products based on local search term (client-side search only; division filter handled by API)
  const filteredProducts = useMemo(() => {
    const list = products?.data || []
    if (!searchable || !localSearchTerm) return list
    return list.filter(product =>
      product.nama.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      product.kode.toLowerCase().includes(localSearchTerm.toLowerCase())
    )
  }, [products?.data, localSearchTerm, searchable])

  const ALL_VALUE = "__all__"

  const handleValueChange = (selectedValue: string) => {
    if (showAllOption && selectedValue === ALL_VALUE) {
      onChange('')
    } else {
      onChange(selectedValue)
    }
  }

  return (
    <Select
      value={value !== '' ? value : (showAllOption ? ALL_VALUE : '')}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...(searchable ? selectContentSearchProps : {})}>
        {searchable && (
          <SelectSearchField
            placeholder="Cari produk..."
            value={localSearchTerm}
            onChange={setLocalSearchTerm}
          />
        )}
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Memuat...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchable && localSearchTerm ? "Tidak ada hasil" : "Tidak ada produk"}
          </div>
        ) : (
          <>
            {showAllOption && (
              <SelectItem value={ALL_VALUE}>
                {allOptionLabel}
              </SelectItem>
            )}
            {filteredProducts.map((product) => (
            <SelectItem
              key={product.id}
              value={product.id.toString()}
            >
              {product.nama} - {product.kode}
            </SelectItem>
          ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
