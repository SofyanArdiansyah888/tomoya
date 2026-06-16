import { Search } from 'lucide-react'
import React from 'react'
import { cn } from '../../lib/utils'

interface SelectSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const stopSelectInterference = (e: React.SyntheticEvent) => {
  e.stopPropagation()
}

export const SelectSearchField = ({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}: SelectSearchFieldProps) => (
  <div
    className={cn('p-2 border-b', className)}
    onPointerDown={stopSelectInterference}
  >
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        onKeyDown={stopSelectInterference}
        onKeyUp={stopSelectInterference}
        onPointerDown={stopSelectInterference}
        className="w-full rounded border border-gray-300 py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  </div>
)

/** Props for SelectContent when it contains a search field. */
export const selectContentSearchProps = {
  onOpenAutoFocus: (e: Event) => e.preventDefault(),
  onCloseAutoFocus: (e: Event) => e.preventDefault(),
} as const
