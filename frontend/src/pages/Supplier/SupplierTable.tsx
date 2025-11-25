import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Edit, Trash2, Building, Phone, Mail } from 'lucide-react'
import { Supplier } from '../../types/purchase'
import { Pagination } from '../../components/ui/pagination'

interface SupplierTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  paginationMeta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
  }
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  isSaving?: boolean
  isDeleting?: boolean
}

export const SupplierTable = ({
  suppliers,
  isLoading,
  paginationMeta,
  onEdit,
  onDelete,
  onPageChange,
  onPerPageChange,
  isSaving = false,
  isDeleting = false
}: SupplierTableProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-4"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Tidak ada supplier ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{supplier.nama}</CardTitle>
                  <p className="text-sm text-gray-600">{supplier.kode || 'N/A'}</p>
                </div>
                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                  {supplier.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{supplier.alamat}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{supplier.telepon}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{supplier.email}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(supplier)}
                  disabled={isSaving || isDeleting}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(supplier)}
                  disabled={isSaving || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {paginationMeta.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <Pagination
              currentPage={paginationMeta.current_page}
              totalPages={paginationMeta.last_page || 1}
              perPage={paginationMeta.per_page}
              total={paginationMeta.total}
              from={paginationMeta.from}
              to={paginationMeta.to}
              onPageChange={onPageChange}
              onPerPageChange={onPerPageChange}
              itemLabel="supplier"
            />
          </CardContent>
        </Card>
      )}
    </>
  )
}
