import { Search } from 'lucide-react'
import { Input } from './input'
import { cn } from '../../lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Cari...",
  label,
  className,
  disabled = false
}: SearchInputProps) => {
  return (
    <div className={cn("w-full min-w-0", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10 w-full"
        />
      </div>
    </div>
  )
}

