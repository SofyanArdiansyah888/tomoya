import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Edit, Trash2, ChefHat } from 'lucide-react'
import { Recipe } from '../../types/recipe'
import { formatPrice } from '../../lib/formatPrice'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

interface ResepTableProps {
  recipes: Recipe[]
  isLoading: boolean
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}

export const ResepTable = ({
  recipes,
  isLoading,
  onEdit,
  onDelete,
}: ResepTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada resep</h3>
          <p className="text-gray-500">
            Belum ada resep yang ditambahkan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Resep</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah Hasil</TableHead>
                <TableHead>Harga per Unit</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {recipe.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.yield_quantity} {recipe.yield_unit}
                  </TableCell>
                  <TableCell>
                    {recipe.cost_per_unit ? formatPrice(recipe.cost_per_unit) : '-'}
                  </TableCell>
                  <TableCell>
                    {recipe.materials && recipe.materials.length > 0 ? (
                      <Badge variant="outline">
                        {recipe.materials.length} material
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={recipe.is_active ? 'default' : 'secondary'}>
                      {recipe.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(recipe)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(recipe)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

