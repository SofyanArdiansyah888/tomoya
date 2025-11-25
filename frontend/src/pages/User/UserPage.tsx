import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Modal } from '../../components/ui/modal'
import { SearchInput } from '../../components/ui/search-input'
import { userService } from '../../services/user'
import { PaginatedResponse } from '../../types/api'
import { CreateUserRequest, User } from '../../types/user'
import { UserForm } from './UserForm'
import { UserTable } from './UserTable'

export const UserPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryClient = useQueryClient()

  // User hooks
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', debouncedSearchTerm, currentPage, perPage],
    queryFn: () => userService.getUsers({ 
      search: debouncedSearchTerm,
      page: currentPage,
      per_page: perPage
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Handle both paginated and non-paginated responses
  // Backend returns ApiResource::collection which is an array
  const users = Array.isArray(usersResponse) 
    ? usersResponse 
    : (usersResponse?.data || [])
  
  const totalUsers = Array.isArray(usersResponse) 
    ? usersResponse.length 
    : (usersResponse?.data?.length || 0)
  
  // Check if response is PaginatedResponse (has current_page property)
  const isPaginated = (response: typeof usersResponse): response is PaginatedResponse<User> => {
    return response !== undefined && 
           !Array.isArray(response) && 
           'current_page' in response &&
           typeof (response as PaginatedResponse<User>).current_page === 'number'
  }
  
  const paginationMeta = isPaginated(usersResponse)
    ? {
        current_page: usersResponse.current_page,
        per_page: usersResponse.per_page,
        total: usersResponse.total,
        last_page: usersResponse.last_page,
        from: usersResponse.from,
        to: usersResponse.to
      }
    : {
        current_page: currentPage,
        per_page: perPage,
        total: totalUsers,
        last_page: Math.ceil(totalUsers / perPage) || 1,
        from: totalUsers > 0 ? 1 : null,
        to: totalUsers > 0 ? Math.min(perPage, totalUsers) : null
      }

  const createUser = useMutation({
    mutationFn: (userData: CreateUserRequest) => 
      userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User berhasil ditambahkan!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan user')
    },
  })

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserRequest> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success('User berhasil diperbarui!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui user')
    },
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus user')
    },
  })

  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = async (data: CreateUserRequest | (Omit<CreateUserRequest, 'password'> & { password?: string })) => {
    if (!data.name || !data.email) {
      toast.error('Harap isi nama dan email user')
      return
    }

    setIsSaving(true)
    try {
      if (editingUser) {
        updateUser.mutate({ id: editingUser.id, data }, {
          onSuccess: () => {
            toast.success('User berhasil diperbarui')
            setIsModalOpen(false)
            setEditingUser(null)
          },
          onError: (error) => {
            toast.error('Gagal memperbarui user')
            console.error('Error:', error)
          }
        })
      } else {
        if (!('password' in data) || !data.password) {
          toast.error('Password wajib diisi untuk user baru')
          setIsSaving(false)
          return
        }
        createUser.mutate(data as CreateUserRequest, {
          onSuccess: () => {
            toast.success('User berhasil ditambahkan')
            setIsModalOpen(false)
            setEditingUser(null)
          },
          onError: (error) => {
            toast.error('Gagal menambahkan user')
            console.error('Error:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menyimpan user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
      deleteUser.mutate(user.id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar User</h1>
          <p className="text-gray-600">Kelola data user</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <SearchInput
            label="Cari User"
            placeholder="Cari user..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      {/* User Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        paginationMeta={paginationMeta}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        isSaving={isSaving}
        isDeleting={deleteUser.isPending}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Edit User" : "Tambah User"}
        size="lg"
      >
        <UserForm
          key={editingUser?.id || 'new'}
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  )
}

