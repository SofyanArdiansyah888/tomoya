import { ChevronDown, LogOut, Menu, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/login')
      },
    })
  }

  return (
    <header className="bg-gradient-to-br from-amber-50 to-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden hover:bg-amber-100"
            >
              <Menu className="h-5 w-5 text-amber-700" />
            </Button>

            {/* Page Title */}
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-700 truncate">
              Dashboard Inventori
            </h2>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">




            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-amber-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-sm">
                    <User className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-600 capitalize font-medium">{user?.role || 'admin'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-amber-600 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-amber-100 shadow-lg">
                <DropdownMenuLabel className="bg-amber-50">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-600">{user?.email || 'admin@tomoya.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium"
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
    </header>
  )
}