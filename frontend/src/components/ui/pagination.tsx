import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { cn } from '../../lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  perPage: number
  total: number
  from?: number | null
  to?: number | null
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  itemLabel?: string // Label untuk item (default: 'item')
  className?: string
}

export const Pagination = ({
  currentPage,
  totalPages,
  perPage,
  total,
  from,
  to,
  onPageChange,
  onPerPageChange,
  itemLabel = 'item',
  className
}: PaginationProps) => {
  const [jumpPage, setJumpPage] = useState('')
  const [jumpError, setJumpError] = useState(false)

  // Reset jump page input when currentPage changes
  useEffect(() => {
    setJumpPage('')
    setJumpError(false)
  }, [currentPage])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Increased to show more pages

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Show pages 1-6, then ellipsis and last
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show first, ellipsis, then last 5 pages
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first, ellipsis, current-2 to current+2, ellipsis, last
        pages.push('...')
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage)
    if (isNaN(page) || page < 1 || page > totalPages) {
      setJumpError(true)
      setTimeout(() => setJumpError(false), 2000)
      return
    }
    
    if (page !== currentPage) {
      onPageChange(page)
    }
    setJumpPage('')
    setJumpError(false)
  }

  const handleJumpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJumpToPage()
    }
  }

  const handleJumpChange = (value: string) => {
    setJumpPage(value)
    if (jumpError) setJumpError(false)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Info Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Menampilkan <span className="font-medium">{from || 0}</span> - <span className="font-medium">{to || 0}</span> dari{' '}
          <span className="font-medium">{total}</span> {itemLabel}
        </div>
        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
          </div>
        )}
      </div>

      {/* Pagination Controls - wrapped in responsive container */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 w-full">
        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
              title="Halaman pertama"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400 font-medium">
                      ...
                    </span>
                  )
                }

                const pageNum = page as number
                const isActive = currentPage === pageNum
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "h-9 min-w-[36px] px-2 font-medium transition-all",
                      isActive 
                        ? "bg-amber-600 text-white hover:bg-amber-700" 
                        : "hover:bg-gray-100 hover:border-gray-400"
                    )}
                    title={`Ke halaman ${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
              title="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
              title="Halaman terakhir"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          {/* Jump to Page */}
          {totalPages > 5 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Lompat ke:</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    onChange={(e) => handleJumpChange(e.target.value)}
                    onKeyPress={handleJumpKeyPress}
                    placeholder={`1-${totalPages}`}
                    className={cn(
                      "h-9 w-20 px-2 text-center text-sm border-gray-300 focus:ring-2 focus:ring-amber-500",
                      jumpError && "border-red-300 focus:ring-red-500"
                    )}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleJumpToPage}
                    disabled={!jumpPage}
                    className="h-9 px-3 text-sm"
                  >
                    Go
                  </Button>
                </div>
                {jumpError && (
                  <span className="text-xs text-red-500">
                    Masukkan angka antara 1 dan {totalPages}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Per Page Selector */}
          {onPerPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Per halaman:</span>
              <select
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="h-9 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-w-[80px]"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
