import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import { Button } from '../ui/button'
import { SyncOfflineBanner, SyncStatusBadge } from './SyncStatusBadge'

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <SyncOfflineBanner />
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 bg-gradient-to-br from-amber-50 to-white border-b border-gray-200 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-amber-100"
          >
            <Menu className="h-5 w-5 text-amber-700" />
          </Button>
          <SyncStatusBadge />
        </div>
        {/* Status sinkron (desktop) */}
        <div className="hidden lg:flex justify-end px-6 pt-3 -mb-2">
          <SyncStatusBadge />
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
