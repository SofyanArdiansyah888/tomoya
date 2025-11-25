import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Edit, Trash2, Tag } from 'lucide-react'
import { Kategori } from '../../types/product'
import { Modal } from '../../components/ui/modal'

interface KategoriTableProps {
  categories: Kategori[]
  isLoading: boolean
  onEdit: (category: Kategori) => void
  onDelete: (category: Kategori) => void
  isSaving?: boolean
  isDeleting?: boolean
  isDeleteModalOpen: boolean
  categoryToDelete: Kategori | null
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export const KategoriTable = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  isSaving = false,
  isDeleting = false,
  isDeleteModalOpen,
  categoryToDelete,
  onConfirmDelete,
  onCancelDelete
}: KategoriTableProps) => {
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

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">Tidak ada kategori ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{category.nama}</CardTitle>
                </div>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {category.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{category.deskripsi || 'Tidak ada deskripsi'}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(category)}
                  disabled={isSaving || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={onCancelDelete}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Hapus Kategori</h3>
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.nama}"</strong>?
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancelDelete}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
