import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select-primitives'
import { Search } from 'lucide-react'
import { recipeService } from '../../services/recipe'

interface ResepSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchable?: boolean
}

export const ResepSelect = ({ 
  value, 
  onChange, 
  placeholder = "Pilih resep", 
  required = false,
  disabled = false,
  className = "",
  searchable = true
}: ResepSelectProps) => {
  const [searchTerm, _] = useState('')
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', { search: searchTerm }],
    queryFn: () => recipeService.getRecipes({ search: searchTerm })
  })

  // Filter recipes based on local search term (for additional client-side filtering)
  const filteredRecipes = useMemo(() => {
    if (!searchable || !localSearchTerm) return recipes?.data || []
    return recipes?.data?.filter(recipe =>
      recipe.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(localSearchTerm.toLowerCase())
    ) || []
  }, [recipes?.data, localSearchTerm, searchable])

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || isLoading}
      required={required}
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
                placeholder="Cari resep..."
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
        ) : filteredRecipes.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchable && localSearchTerm ? "Tidak ada hasil" : "Tidak ada resep"}
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <SelectItem
              key={recipe.id}
              value={recipe.id.toString()}
            >
              {recipe.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

