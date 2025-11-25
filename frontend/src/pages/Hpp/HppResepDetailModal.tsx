import { Modal } from '../../components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { HppRecipe } from '../../types/hpp'
import { formatPrice } from '../../lib/formatPrice'
import { ChefHat, DollarSign, Package } from 'lucide-react'

interface HppResepDetailModalProps {
  recipe: HppRecipe
  isOpen: boolean
  onClose: () => void
}

export const HppResepDetailModal = ({
  recipe,
  isOpen,
  onClose,
}: HppResepDetailModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail HPP Resep"
      size="xl"
    >
      <div className="space-y-6">
        {/* Recipe Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5" />
              <span>Informasi Resep</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Resep</label>
                <p className="text-sm font-semibold text-gray-900">{recipe.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={recipe.is_active ? "default" : "secondary"}>
                  {recipe.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Yield Quantity</label>
                <p className="text-sm text-gray-900">{recipe.yield_quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Yield Unit</label>
                <Badge variant="secondary">{recipe.yield_unit}</Badge>
              </div>
            </div>
            {recipe.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                <p className="text-sm text-gray-900">{recipe.description}</p>
              </div>
            )}
            {recipe.instructions && (
              <div>
                <label className="text-sm font-medium text-gray-500">Instruksi</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{recipe.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HPP Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Ringkasan HPP</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total HPP</label>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(recipe.hpp.total_hpp)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total biaya semua material
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">HPP per Unit</label>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(recipe.hpp.cost_per_unit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  per {recipe.hpp.yield_unit}
                </p>
              </div>
              {recipe.cost_per_unit && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost per Unit (Stored)</label>
                  <p className="text-lg font-semibold text-gray-600">
                    {formatPrice(recipe.cost_per_unit)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nilai yang tersimpan di database
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Material Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Breakdown Material</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.hpp.breakdown.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada material dalam resep ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>HPP per Unit</TableHead>
                      <TableHead>Cost per Unit</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.hpp.breakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.material_name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.unit}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.hpp_per_unit !== null ? (
                            <span className="text-green-600 font-medium">
                              {formatPrice(item.hpp_per_unit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {formatPrice(item.cost_per_unit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {recipe.hpp.breakdown.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total HPP:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(recipe.hpp.total_hpp)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}

