import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select-primitives'
import { SelectSearchField, selectContentSearchProps } from '../ui/SelectSearchField'
import { categoryService } from '../../services/category'

interface CategorySelectProps {
  value?: number | string
  onValueChange?: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  searchable?: boolean
  filterPredicate?: (category: any) => boolean
  includeAllOption?: boolean
}

export const CategorySelect = ({
  value,
  onValueChange,
  placeholder = "Pilih Kategori...",
  disabled = false,
  className,
  error,
  searchable = true,
  filterPredicate,
  includeAllOption = false
}: CategorySelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: categories, isLoading, error: queryError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories()
  })

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    const source = categories?.data || []
    const byPredicate = filterPredicate ? source.filter(filterPredicate) : source
    if (!searchable || !searchTerm) return byPredicate
    return byPredicate.filter((category: any) =>
      category.nama.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories?.data, searchTerm, searchable, filterPredicate])

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
        <SelectContent {...(searchable ? selectContentSearchProps : {})}>
          {searchable && (
            <SelectSearchField
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
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
            <>
              {includeAllOption && (
                <SelectItem key={0} value=" ">
                  Semua Kategori
                </SelectItem>
              )}
              {filteredCategories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={String(category.id)}
                    disabled={!category.is_active}
                  >
                    {category.nama}
                  </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
