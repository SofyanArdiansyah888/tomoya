import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { productService } from '../../services/products'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select-primitives'

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
      <SelectContent>
        {searchable && (
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
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
