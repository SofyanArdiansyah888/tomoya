import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Save } from 'lucide-react'
import { User, CreateUserRequest } from '../../types/user'

interface UserFormProps {
  user?: User | null
  onSave: (data: CreateUserRequest | Omit<CreateUserRequest, 'password'> & { password?: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const UserForm = ({ user, onSave, onCancel, isLoading = false }: UserFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir' as 'admin' | 'kasir' | 'gudang',
    phone: '',
    address: '',
    menu:"",
    submenu: ""
  })

  useEffect(() => {
    if (user) {
      // Convert menu and submenu from array to comma-separated string
      const menuStr = Array.isArray(user.menu) 
        ? user.menu.join(', ') 
        : (typeof user.menu === 'string' ? user.menu : '')
      const submenuStr = Array.isArray(user.submenu) 
        ? user.submenu.join(', ') 
        : (typeof user.submenu === 'string' ? user.submenu : '')
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't pre-fill password
        role: user.role || 'kasir',
        phone: user.phone || '',
        address: user.address || '',
        menu: menuStr,
        submenu: submenuStr
      })
    } else {
      // Reset form when user is null (add mode)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        phone: '',
        address: '',
        menu: "",
        submenu: ""
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMenuChange = (value: string) => {
    handleInputChange('menu', value)
  }

  const handleSubmenuChange = (value: string) => {
    handleInputChange('submenu', value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user && !formData.password) {
      alert('Password wajib diisi untuk user baru')
      return
    }

    if (user) {
      // Update: only send password if it's provided
      // Send menu and submenu as strings directly (backend expects strings)
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || '',
        address: formData.address || '',
        menu: formData.menu || '',
        submenu: formData.submenu || ''
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      onSave(updateData)
    } else {
      // Create: password is required
      // Send menu and submenu as strings directly (backend expects strings)
      onSave({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || '',
        address: formData.address || '',
        menu: formData.menu || '',
        submenu: formData.submenu || ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama * 
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Masukkan nama user"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email/Username *
          </label>
          <Input
            type="text"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Masukkan email"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password {!user && '*'}
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={user ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password (min 8 karakter)"}
            required={!user}
            minLength={user ? undefined : 8}
          />
          {user && (
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan jika tidak ingin mengubah password
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          >
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
            <option value="gudang">Gudang</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telepon
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Masukkan nomor telepon"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat
          </label>
          <Input
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Masukkan alamat"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Menu
          </label>
          <Textarea
            value={formData.menu}
            onChange={(e) => handleMenuChange(e.target.value)}
            placeholder="Masukkan menu (pisahkan dengan koma)"
            className="w-full"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Pisahkan menu dengan koma, contoh: Dashboard, Kasir, Pembelian
          </p>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submenu
          </label>
          <Textarea
            value={formData.submenu}
            onChange={(e) => handleSubmenuChange(e.target.value)}
            placeholder="Masukkan submenu (pisahkan dengan koma)"
            className="w-full"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Pisahkan submenu dengan koma, contoh: Tambah Produk, Edit Produk
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Menyimpan...' : (user ? 'Update User' : 'Simpan User')}
        </Button>
      </div>
    </form>
  )
}

