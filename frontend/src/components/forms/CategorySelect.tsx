import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select-primitives'
import { categoryService } from '../../services/category'

interface CategorySelectProps {
  value?: number
  onValueChange?: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  searchable?: boolean
}

export const CategorySelect = ({
  value,
  onValueChange,
  placeholder = "Pilih Kategori...",
  disabled = false,
  className,
  error,
  searchable = true
}: CategorySelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: categories, isLoading, error: queryError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories()
  })

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchable || !searchTerm) return categories?.data || []
    return categories?.data?.filter(category =>
      category.nama.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [categories?.data, searchTerm, searchable])

  return (
    <div className="w-full">
      <Select
        value={value ? String(value) : undefined}
        onValueChange={(newValue) => onValueChange?.(Number(newValue))}
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
                  placeholder="Cari kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Memuat...
            </div>
          ) : queryError ? (
            <div className="p-4 text-center text-sm text-red-500">
              Gagal memuat data kategori
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchable && searchTerm ? "Tidak ada hasil" : "Tidak ada kategori"}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <SelectItem
                key={category.id}
                value={String(category.id)}
                disabled={!category.is_active}
              >
                {category.nama}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
