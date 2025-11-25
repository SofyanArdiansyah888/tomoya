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
import { materialService } from '../../services/material'

interface MaterialSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  searchable?: boolean
  showAllOption?: boolean
  allOptionLabel?: string
}

export const MaterialSelect = ({ 
  value, 
  onChange, 
  placeholder = "Pilih material", 
  disabled = false,
  className = "",
  searchable = true,
  showAllOption = false,
  allOptionLabel = "Semua Material"
}: MaterialSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialService.getMaterials()
  })

  const ALL_VALUE = "__all__"

  const handleValueChange = (selectedValue: string) => {
    if (showAllOption && selectedValue === ALL_VALUE) {
      onChange('')
    } else {
      onChange(selectedValue)
    }
  }

  // Filter materials based on search term
  const filteredMaterials = useMemo(() => {
    if (!searchable || !searchTerm) return materials?.data || []
    return materials?.data?.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material?.sku?.toLowerCase()?.includes(searchTerm.toLowerCase())
    ) || []
  }, [materials?.data, searchTerm, searchable])

  return (
    <Select
      value={value !== '' ? value : (showAllOption ? ALL_VALUE : '')}
      onValueChange={handleValueChange}
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
                placeholder="Cari material..."
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
        ) : filteredMaterials.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchable && searchTerm ? "Tidak ada hasil" : "Tidak ada material"}
          </div>
        ) : (
          <>
            {showAllOption && (
              <SelectItem value={ALL_VALUE}>
                {allOptionLabel}
              </SelectItem>
            )}
            {filteredMaterials.map((material) => (
              <SelectItem
                key={material.id}
                value={material.id.toString()}
              >
                {material.name} 
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
