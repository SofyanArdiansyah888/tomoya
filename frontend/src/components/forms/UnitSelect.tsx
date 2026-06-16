import { useState, useMemo } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select-primitives'
import { SelectSearchField, selectContentSearchProps } from '../ui/SelectSearchField'

interface UnitSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchable?: boolean
}

export const UnitSelect = ({ 
  value, 
  onChange, 
  placeholder = "Pilih unit", 
  disabled = false,
  className = "",
  searchable = true
}: UnitSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Mililiter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'ikat', label: 'Ikat' },
    { value: 'botol', label: 'Botol' },
    { value: 'sachet', label: 'Sachet' },
    { value: 'lembar', label: 'Lembar' },
  ]

  // Filter units based on search term
  const filteredUnits = useMemo(() => {
    if (!searchable || !searchTerm) return units
    return units.filter(unit =>
      unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [units, searchTerm, searchable])

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...(searchable ? selectContentSearchProps : {})}>
        {searchable && (
          <SelectSearchField
            placeholder="Cari unit..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        )}
        
        {filteredUnits.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchable && searchTerm ? "Tidak ada hasil" : "Tidak ada unit"}
          </div>
        ) : (
          filteredUnits.map((unit) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
