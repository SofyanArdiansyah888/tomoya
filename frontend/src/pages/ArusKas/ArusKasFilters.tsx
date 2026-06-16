import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SearchInput } from '../../components/ui/search-input'
import { Button } from '../../components/ui/button'

interface ArusKasFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  masterKasFilter: string
  onMasterKasFilterChange: (value: string) => void
  onReset?: () => void
}

export const ArusKasFilters = ({
  searchTerm,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  masterKasFilter,
  onMasterKasFilterChange,
  onReset
}: ArusKasFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full min-w-0">
            <SearchInput
              placeholder="Cari arus kas..."
              value={searchTerm}
              onChange={onSearchChange}
              label="Cari"
            />
          </div>

          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Master Kas
            </label>
            <select
              value={masterKasFilter}
              onChange={(e) => onMasterKasFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Semua</option>
              <option value="false">Belum masuk</option>
              <option value="true">Sudah masuk</option>
            </select>
          </div>

          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dari Tanggal
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sampai Tanggal
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              min={dateFrom || undefined}
              className="w-full"
            />
          </div>
          </div>
          {onReset && (
            <div className="pt-7">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
