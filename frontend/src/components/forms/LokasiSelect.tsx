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
import { lokasiService } from '../../services/lokasi'
import { Lokasi } from '../../services/inventory'

interface LokasiSelectProps {
  value?: number | string
  onValueChange?: (value: string | number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  searchable?: boolean
  showAllOption?: boolean
  allOptionLabel?: string
  filterByTipe?: 'gudang' | 'toko'
}

export const LokasiSelect = ({
  value,
  onValueChange,
  placeholder = "Pilih Lokasi...",
  disabled = false,
  className,
  error,
  searchable = true,
  showAllOption = false,
  allOptionLabel = "Semua Lokasi",
  filterByTipe
}: LokasiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: lokasiResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['lokasi', filterByTipe],
    queryFn: async () => {
      try {
        const response = await lokasiService.getLokasi(filterByTipe ? { tipe: filterByTipe } : undefined)
        // Handle Laravel ApiResource::collection format: { data: [...] }
        // or paginated format: { data: [...], meta: {...} }
        if (response && response.data && Array.isArray(response.data)) {
          return response.data
        }
        // Handle direct array response
        if (Array.isArray(response)) {
          return response
        }
        return []
      } catch (error) {
        console.error('Error fetching lokasi:', error)
        return []
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const lokasiList: Lokasi[] = lokasiResponse || []

  // Filter lokasi based on search term
  const filteredLokasi = useMemo(() => {
    if (!searchable || !searchTerm) return lokasiList
    return lokasiList.filter(lokasi =>
      lokasi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lokasi.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lokasi.tipe.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [lokasiList, searchTerm, searchable])

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
              placeholder="Cari lokasi..."
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
              Gagal memuat data lokasi
            </div>
          ) : filteredLokasi.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchable && searchTerm ? "Tidak ada hasil" : "Tidak ada lokasi"}
            </div>
          ) : (
            <>
              {showAllOption && (
                <SelectItem value={ALL_VALUE}>
                  {allOptionLabel}
                </SelectItem>
              )}
              {filteredLokasi.map((lokasi) => (
                <SelectItem
                  key={lokasi.id}
                  value={String(lokasi.id)}
                  disabled={!lokasi.is_active}
                >
                  {lokasi.nama} ({lokasi.tipe})
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

