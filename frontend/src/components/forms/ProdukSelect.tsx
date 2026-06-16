import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select-primitives'
import { SelectSearchField, selectContentSearchProps } from '../ui/SelectSearchField'
import { productService } from '../../services/products'

interface ProdukSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchable?: boolean
}

export const ProdukSelect = ({ 
  value, 
  onChange, 
  placeholder = "Pilih produk", 
  disabled = false,
  className = "",
  searchable = true
}: ProdukSelectProps) => {
  const [searchTerm, _] = useState('')
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search: searchTerm }],
    queryFn: () => productService.getProducts({ search: searchTerm })
  })

  // Filter products based on local search term (for additional client-side filtering)
  const filteredProducts = useMemo(() => {
    if (!searchable || !localSearchTerm) return products?.data || []
    return products?.data?.filter(product =>
      product.nama.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      product.kode.toLowerCase().includes(localSearchTerm.toLowerCase())
    ) || []
  }, [products?.data, localSearchTerm, searchable])

  return (
    <Select
      value={value}
      onValueChange={onChange}
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
          filteredProducts.map((product) => (
            <SelectItem
              key={product.id}
              value={product.id.toString()}
            >
              {product.nama} - {product.kode}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
