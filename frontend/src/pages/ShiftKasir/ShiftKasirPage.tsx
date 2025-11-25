import { useQuery } from '@tanstack/react-query'
import {
  Clock,
  Eye,
  Plus,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useToast } from '../../hooks/useToast'
import { formatPrice } from '../../lib/formatPrice'
import { shiftService } from '../../services/shift'
import { BukaKasirRequest, ShiftFilters, ShiftKasir, TutupKasirRequest } from '../../types/shift'
import { BukaKasirModal } from './BukaKasirModal'
import { TutupKasirModal } from './TutupKasirModal'
// Using native JavaScript Date formatting

export const ShiftKasirPage = () => {
  const { toast } = useToast()
  const [showBukaModal, setShowBukaModal] = useState(false)
  const [showTutupModal, setShowTutupModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftKasir | null>(null)
  const [filters, _] = useState<ShiftFilters>({
    status: 'closed',
    page: 1,
    per_page: 15,
    sort_by: 'tanggal_buka',
    sort_order: 'desc'
  })

  // Fetch current shift
  const { data: currentShift,  refetch: refetchCurrent } = useQuery({
    queryKey: ['shift-kasir', 'current'],
    queryFn: () => shiftService.getCurrentShift(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch shifts history
  const { data: shiftsData, isLoading: isLoadingShifts, refetch: refetchShifts } = useQuery({
    queryKey: ['shift-kasir', filters],
    queryFn: () => shiftService.getShifts(filters),
  })

  const handleBukaKasir = async (data: BukaKasirRequest) => {
    try {
      await shiftService.bukaKasir(data)
      toast({
        title: 'Berhasil',
        description: 'Shift kasir berhasil dibuka',
      })
      setShowBukaModal(false)
      refetchCurrent()
      refetchShifts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal membuka shift kasir',
        variant: 'destructive'
      })
    }
  }

  const handleTutupKasir = async (data: TutupKasirRequest) => {
    if (!currentShift) return
    
    try {
      await shiftService.tutupKasir(currentShift.id, data)
      toast({
        title: 'Berhasil',
        description: 'Shift kasir berhasil ditutup',
      })
      setShowTutupModal(false)
      setSelectedShift(null)
      refetchCurrent()
      refetchShifts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menutup shift kasir',
        variant: 'destructive'
      })
    }
  }

  const handleViewShift = async (shift: ShiftKasir) => {
    try {
      const detail = await shiftService.getShiftDetail(shift.id)
      setSelectedShift(detail)
      setShowTutupModal(false)
      // Could open a detail modal here
      toast({
        title: 'Detail Shift',
        description: `Shift #${shift.id} - ${shift.status === 'open' ? 'Aktif' : 'Ditutup'}`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Gagal memuat detail shift',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shift Kasir</h1>
        {!currentShift && (
          <Button onClick={() => setShowBukaModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buka Kasir
          </Button>
        )}
      </div>

      {/* Current Shift Status */}
      {currentShift && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shift Aktif
              </CardTitle>
              <Badge variant={currentShift.status === 'open' ? 'default' : 'secondary'}>
                {currentShift.status === 'open' ? 'Aktif' : 'Ditutup'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Saldo Awal</p>
                <p className="text-lg font-semibold">{formatPrice(currentShift.saldo_awal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Penjualan</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPrice(currentShift.total_penjualan)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lokasi</p>
                <p className="text-lg font-semibold">{currentShift.lokasi?.nama || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dibuka</p>
                <p className="text-sm font-medium">
                  {new Date(currentShift.tanggal_buka).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  setSelectedShift(currentShift)
                  setShowTutupModal(true)
                }}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Tutup Kasir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>History Shift</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingShifts ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : shiftsData?.data && shiftsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tanggal Buka</TableHead>
                    <TableHead>Tanggal Tutup</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Saldo Awal</TableHead>
                    <TableHead>Total Penjualan</TableHead>
                    <TableHead>Saldo Akhir</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftsData.data.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>#{shift.id}</TableCell>
                      <TableCell>
                        {new Date(shift.tanggal_buka).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {shift.tanggal_tutup 
                          ? new Date(shift.tanggal_tutup).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{shift.lokasi?.nama || '-'}</TableCell>
                      <TableCell>{formatPrice(shift.saldo_awal)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatPrice(shift.total_penjualan)}
                      </TableCell>
                      <TableCell>
                        {shift.saldo_akhir ? formatPrice(shift.saldo_akhir) : '-'}
                      </TableCell>
                      <TableCell>
                        {shift.selisih !== null ? (
                          <span className={shift.selisih >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {shift.selisih >= 0 ? '+' : ''}{formatPrice(shift.selisih)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>
                          {shift.status === 'open' ? 'Aktif' : 'Ditutup'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewShift(shift)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Belum ada history shift
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BukaKasirModal
        isOpen={showBukaModal}
        onClose={() => setShowBukaModal(false)}
        onSubmit={handleBukaKasir}
      />

      <TutupKasirModal
        isOpen={showTutupModal}
        onClose={() => {
          setShowTutupModal(false)
          setSelectedShift(null)
        }}
        shift={(selectedShift ?? currentShift) as ShiftKasir | null}
        onSubmit={handleTutupKasir}
      />
    </div>
  )
}

