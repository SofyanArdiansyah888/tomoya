import { Eye, Package } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { formatPrice } from '../../lib/formatPrice'
import { HppMaterial } from '../../types/hpp'

interface HppMaterialTableProps {
  materials: HppMaterial[]
  isLoading: boolean
  onViewDetail: (material: HppMaterial) => void
}

export const HppMaterialTable = ({
  materials,
  isLoading,
  onViewDetail,
}: HppMaterialTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-6">
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
          </div>
        </CardContent>
      </Card>
    )
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data Material</h3>
          <p className="text-gray-500">
            Belum ada material yang tersedia. Silakan tambahkan material terlebih dahulu.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Beli (Default)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HPP (Terbaru)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Satuan HPP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {material.name}
                      </div>
                      {material.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {material.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">
                      {formatPrice(material.purchase_price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {material.hpp !== null ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(material.hpp)}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="secondary">Belum ada pembelian</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {material.hpp_unit_price !== undefined && material.hpp_unit_price !== null ? (
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(material.hpp_unit_price)} / <Badge variant="secondary">{material.unit}</Badge>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={material.is_active ? "default" : "secondary"}>
                      {material.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(material)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

