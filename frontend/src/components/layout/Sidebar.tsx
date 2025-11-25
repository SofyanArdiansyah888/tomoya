import { useMemo, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  LogOut,
  X,
  ShoppingCart,
  Receipt,
  Building,
  CreditCard,
  DollarSign,
  Beaker,
  ChefHat,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Boxes,
  ShoppingBag,
  ArrowRightLeft,
  User,
  Clock,
  Calculator,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth, useLogout } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import tomoyaLogo from '../../assets/tomoya_logo.jpg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  
  // Force re-render when user changes
  const [userKey, setUserKey] = useState(0)
  
  useEffect(() => {
    // Update key when user data changes to force re-render
    if (user) {
      setUserKey(prev => prev + 1)
    }
  }, [user?.id, user?.menu?.length, user?.submenu?.length])

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/login')
      },
    })
  }

  // All navigation items
  const allNavigation = [
    {
      group: 'Utama',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Kasir & Pesanan',
      items: [
        { name: 'Kasir', href: '/kasir', icon: ShoppingCart },
        { name: 'Pesanan', href: '/pesanan', icon: Receipt },
        { name: 'Shift Kasir', href: '/shift-kasir', icon: Clock },
      ]
    },
    {
      group: 'Pembelian & Keuangan',
      items: [
        { name: 'Pembelian', href: '/pembelian', icon: CreditCard },
        { name: 'Arus Kas', href: '/arus-kas', icon: DollarSign },
        { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown },
        { name: 'Pemasukan', href: '/pemasukan', icon: TrendingUpIcon },
      ]
    },
    {
      group: 'Master Data',
      items: [
        { name: 'Supplier', href: '/supplier', icon: Building },
        { name: 'Produk', href: '/produk', icon: Package },
        { name: 'Kategori', href: '/kategori', icon: Tag },
        { name: 'Material', href: '/material', icon: Beaker },
        { name: 'Resep', href: '/resep', icon: ChefHat },
        { name: 'User', href: '/user', icon: User },
      ]
    },
    {
      group: 'Manajemen Stok',
      items: [
        { name: 'Stok Gudang', href: '/stok-gudang', icon: Boxes },
        { name: 'Stok Toko', href: '/stok-toko', icon: ShoppingBag },
        { name: 'Pergerakan Stok', href: '/pergerakan-stok', icon: ArrowRightLeft },
        { name: 'Mix Preparation', href: '/mix-preparation', icon: Settings },
      ]
    },
    {
      group: 'HPP',
      items: [
        { name: 'HPP Material', href: '/hpp/material', icon: Calculator },
        { name: 'HPP Resep', href: '/hpp/resep', icon: FileText },
      ]
    }
  ]

  // Filter navigation based on user's menu and submenu access
  const navigation = useMemo(() => {
    // Helper function to normalize strings for comparison
    const normalize = (str: string): string => {
      return str.trim().toLowerCase()
    }

    // Helper function to parse menu/submenu (handle both array and comma-separated string)
    const parseMenuData = (data: string[] | string | undefined): string[] => {
      if (!data) return []
      if (Array.isArray(data)) return data
      if (typeof data === 'string') {
        // Handle comma-separated string
        return data.split(',').map(item => item.trim()).filter(item => item)
      }
      return []
    }

    // Parse menu and submenu data
    const userMenu = parseMenuData(user?.menu)
    const userSubmenu = parseMenuData(user?.submenu)

    // Helper function to check if user has access to a menu group
    const hasGroupAccess = (groupName: string): boolean => {
      // Check if group name exists in user's menu array
      if (!userMenu || userMenu.length === 0) {
        return false
      }
      const normalizedGroup = normalize(groupName)
      return userMenu.some(menu => normalize(menu) === normalizedGroup)
    }

    // Helper function to check if user has access to a submenu item
    const hasSubmenuAccess = (submenuName: string): boolean => {
      // Check if submenu name exists in user's submenu array
      if (!userSubmenu || userSubmenu.length === 0) {
        return false
      }
      const normalizedSubmenu = normalize(submenuName)
      return userSubmenu.some(submenu => normalize(submenu) === normalizedSubmenu)
    }

    // Debug: log user data
    console.log('User data:', user)
    console.log('User menu (parsed):', userMenu)
    console.log('User submenu (parsed):', userSubmenu)

    // If user doesn't have menu or submenu, show all navigation as fallback
    // This handles cases where menu/submenu data is not set or user is admin
    if (!userMenu || userMenu.length === 0 || !userSubmenu || userSubmenu.length === 0) {
      console.log('No menu or submenu found, showing all navigation as fallback')
      return allNavigation
    }

    const filtered = allNavigation
      .filter(group => hasGroupAccess(group.group)) // Filter groups based on menu
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasSubmenuAccess(item.name)) // Filter items based on submenu
      }))
      .filter(group => group.items.length > 0) // Remove empty groups

    // If filtered result is empty, return all navigation as fallback
    if (filtered.length === 0) {
      console.log('Filtered navigation is empty, showing all navigation as fallback')
      return allNavigation
    }

    console.log('Filtered navigation:', filtered)
    return filtered
  }, [user?.menu, user?.submenu, user?.id, userKey])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-white shadow-lg flex flex-col
        fixed lg:relative z-50 lg:z-auto
        top-0 left-0 lg:top-auto lg:left-auto
        h-screen lg:h-full lg:min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Logo and User */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-br from-amber-50 via-white to-amber-50">
          <div className="space-y-4">
            {/* Logo and Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="h-14 w-14 rounded-xl border-2 border-amber-400 shadow-lg bg-white p-1.5 flex items-center justify-center ring-2 ring-amber-100">
                    <img
                      src={tomoyaLogo}
                      alt="Tomoya Logo"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md border-2 border-white">
                    ★
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-extrabold text-amber-700 leading-tight tracking-tight truncate">
                    Tomoya
                  </h1>
                  <p className="text-xs text-gray-600 font-medium truncate">
                    Dashboard Bisnis
                  </p>
                </div>
              </div>
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden flex-shrink-0 ml-2 hover:bg-amber-100"
              >
                <X className="h-5 w-5 text-amber-700" />
              </Button>
            </div>

            {/* User Info Dropdown - Integrated */}
            <div className="pt-3 border-t border-amber-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 hover:bg-amber-50 rounded-lg p-0 transition-all duration-200 text-left group">
                    <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-md flex-shrink-0 group-hover:shadow-lg group-hover:scale-105 transition-all">
                      <User className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email || 'admin@tomoya.com'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 capitalize">
                          {user?.role || 'admin'}
                        </span>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-56" sideOffset={5}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@tomoya.com'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    disabled={logout.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logout.isPending ? 'Logout...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border-r-2 border-amber-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
      
    </div>
    </>
  )
}
