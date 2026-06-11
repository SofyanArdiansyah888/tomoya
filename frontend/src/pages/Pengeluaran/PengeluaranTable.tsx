import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card } from '../../components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Pengeluaran } from '../../types/expense'
import { formatPrice } from '../../lib/formatPrice'

interface PengeluaranTableProps {
  pengeluarans: Pengeluaran[]
  onEdit: (pengeluaran: Pengeluaran) => void
  onDelete: (id: number) => void
  onView: (pengeluaran: Pengeluaran) => void
  isLoading?: boolean
}

export const PengeluaranTable = ({ 
  pengeluarans, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}: PengeluaranTableProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
  }


  const getKategoriBadgeVariant = (kategori: string) => {
    switch (kategori) {
      case 'pengeluaran_operasional':
        return 'default'
      case 'pengeluaran_lainnya':
        return 'secondary'
      case 'pembelian_bahan_baku':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (pengeluarans.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-gray-500">Tidak ada data pengeluaran</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No Pengeluaran</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Sub Kategori</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="w-[50px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pengeluarans.map((pengeluaran) => (
              <TableRow key={pengeluaran.id}>
                 <TableCell>
                  {pengeluaran?.no_pengeluaran}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{pengeluaran.nama}</div>
                    {pengeluaran.deskripsi && (
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {pengeluaran.deskripsi}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getKategoriBadgeVariant(pengeluaran.kategori)}>
                    {pengeluaran.kategori_label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pengeluaran.sub_kategori_label && (
                    <span className="text-sm text-gray-600">
                      {pengeluaran.sub_kategori_label}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-red-600">
                    {formatPrice(pengeluaran.jumlah)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(pengeluaran.tanggal).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{pengeluaran.user?.name || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {pengeluaran.metode_pembayaran_label}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(pengeluaran)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(pengeluaran)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(pengeluaran.id)}
                        className="text-red-600"
                        disabled={deletingId === pengeluaran.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === pengeluaran.id ? 'Menghapus...' : 'Hapus'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
