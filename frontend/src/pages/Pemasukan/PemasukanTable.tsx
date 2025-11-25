import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card } from '../../components/ui/card'
import { Table } from '../../components/ui/table'
import { TableBody } from '../../components/ui/table'
import { TableCell } from '../../components/ui/table'
import { TableHead } from '../../components/ui/table'
import { TableHeader } from '../../components/ui/table'
import { TableRow } from '../../components/ui/table'
import { DropdownMenu } from '../../components/ui/dropdown-menu'
import { DropdownMenuContent } from '../../components/ui/dropdown-menu'
import { DropdownMenuItem } from '../../components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import type { Pemasukan } from '../../types/pemasukan'
import { formatPrice } from '../../lib/formatPrice'

interface PemasukanTableProps {
  pemasukans: Pemasukan[]
  onEdit: (pemasukan: Pemasukan) => void
  onDelete: (id: number) => void
  onView: (pemasukan: Pemasukan) => void
  isLoading?: boolean
}

export const PemasukanTable = ({ 
  pemasukans, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}: PemasukanTableProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pemasukan ini?')) {
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
      case 'pemasukan_kasir':
        return 'default'
      case 'pemasukan_non_kasir':
        return 'secondary'
      case 'lainnya':
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

  if (pemasukans.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <p className="text-gray-500">Tidak ada data pemasukan</p>
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
              <TableHead>No Pemasukan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Sub Kategori</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="w-[50px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pemasukans.map((pemasukan) => (
              <TableRow key={pemasukan.id}>
                 <TableCell>
                  {pemasukan?.no_pemasukan}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{pemasukan.nama}</div>
                    {pemasukan.deskripsi && (
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {pemasukan.deskripsi}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getKategoriBadgeVariant(pemasukan.kategori)}>
                    {pemasukan.kategori_label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pemasukan.sub_kategori_label && (
                    <span className="text-sm text-gray-600">
                      {pemasukan.sub_kategori_label}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">
                    {formatPrice(pemasukan.jumlah)}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(pemasukan.tanggal).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {pemasukan.metode_pembayaran_label}
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
                      <DropdownMenuItem onClick={() => onView(pemasukan)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(pemasukan)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(pemasukan.id)}
                        className="text-red-600"
                        disabled={deletingId === pemasukan.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === pemasukan.id ? 'Menghapus...' : 'Hapus'}
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
