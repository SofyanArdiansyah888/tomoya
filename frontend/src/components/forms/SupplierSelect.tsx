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
import { supplierService } from '../../services/supplier'

interface SupplierSelectProps {
  value?: number
  onValueChange?: (value: string | number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  searchable?: boolean
  showAllOption?: boolean
  allOptionLabel?: string
}

export const SupplierSelect = ({
  value,
  onValueChange,
  placeholder = "Pilih Supplier...",
  disabled = false,
  className,
  error,
  searchable = true,
  showAllOption = false,
  allOptionLabel = "Semua Supplier"
}: SupplierSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: suppliers, isLoading, error: queryError } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers(),
  })

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchable || !searchTerm) return suppliers?.data || []
    return suppliers?.data?.filter(supplier =>
      supplier.nama.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [suppliers?.data, searchTerm, searchable])

  const ALL_VALUE = "__all__"
  
  return (
    <div className="w-full">
      <Select
        value={value ? String(value) : showAllOption ? ALL_VALUE : undefined}
        onValueChange={(newValue) => {
          if (showAllOption && newValue === ALL_VALUE) {
            onValueChange?.(undefined)
          } else {
            onValueChange?.(Number(newValue))
          }
        }}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent {...(searchable ? selectContentSearchProps : {})}>
          {searchable && (
            <SelectSearchField
              placeholder="Cari supplier..."
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
              Gagal memuat data supplier
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchable && searchTerm ? "Tidak ada hasil" : "Tidak ada supplier"}
            </div>
          ) : (
            <>
              {showAllOption && (
                <SelectItem value={ALL_VALUE}>
                  {allOptionLabel}
                </SelectItem>
              )}
              {filteredSuppliers.map((supplier) => (
                <SelectItem
                  key={supplier.id}
                  value={String(supplier.id)}
                  disabled={!supplier.is_active}
                >
                  {supplier.nama}
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
