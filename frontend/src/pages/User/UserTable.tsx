import { Edit, Mail, Phone, Trash2, User as UserIcon } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Pagination } from '../../components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { User } from '../../types/user'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  paginationMeta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
  }
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  isSaving?: boolean
  isDeleting?: boolean
}

export const UserTable = ({
  users,
  isLoading,
  paginationMeta,
  onEdit,
  onDelete,
  onPageChange,
  onPerPageChange,
  isSaving = false,
  isDeleting = false
}: UserTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Tidak ada user ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>
    }
    if (role === 'kasir') {
      return <Badge className="bg-blue-100 text-blue-800">Kasir</Badge>
    }
    if (role === 'gudang') {
      return <Badge className="bg-green-100 text-green-800">Gudang</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Submenu</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {user.menu ? (
                        <div className="flex flex-wrap gap-1">
                          {user.menu.split(',').slice(0, 3).map((menu: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {menu}
                            </Badge>
                          ))}
                          {user.menu.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.menu.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.submenu && user.submenu.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.submenu.split(',').slice(0, 3).map((submenu: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {submenu.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(user)}
                          disabled={isSaving || isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(user)}
                          disabled={isSaving || isDeleting}
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

      {/* Pagination */}
      {paginationMeta && paginationMeta.total > 0 && onPageChange && onPerPageChange && (
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
              itemLabel="user"
            />
          </CardContent>
        </Card>
      )}
    </>
  )
}

