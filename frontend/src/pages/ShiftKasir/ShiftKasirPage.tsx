import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
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
import { InputPemasukanModal } from './InputPemasukanModal'
import { TutupKasirModal } from './TutupKasirModal'
// Using native JavaScript Date formatting

export const ShiftKasirPage = () => {
  const { toast } = useToast()
  const [showBukaModal, setShowBukaModal] = useState(false)
  const [showTutupModal, setShowTutupModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftKasir | null>(null)
  const [showInputPemasukanModal, setShowInputPemasukanModal] = useState(false)
  const [filters, _] = useState<ShiftFilters>({
    status: 'closed',
    page: 1,
    per_page: 15,
    sort_by: 'tanggal_buka',
    sort_order: 'desc'
  })

  const formatShortDateTime = (value: string) =>
    new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleInputPemasukan = async (shift: ShiftKasir) => {
    setSelectedShift(shift)
    setShowInputPemasukanModal(true)
  }

  const submitInputPemasukan = async (payload: { jumlah: number; metode_pembayaran?: 'cash' | 'card' | 'qris' | 'other' }) => {
    if (!selectedShift) return
    try {
      await shiftService.inputPemasukan(selectedShift.id, payload)
      setShowInputPemasukanModal(false)
      setSelectedShift(null)
      toast({ title: 'Berhasil', description: 'Pemasukan shift berhasil dicatat' })
      refetchShifts()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Gagal mencatat pemasukan shift', variant: 'destructive' })
    }
  }

  const handleViewShift = (shift: ShiftKasir) => {
    setSelectedShift(shift)
    setShowDetailModal(true)
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Kasir</p>
                <p className="text-lg font-semibold">{currentShift.user?.name || '-'}</p>
              </div>
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
              <Table className="text-xs [&_td]:py-2 [&_td]:px-3 [&_th]:px-3 [&_th]:h-10 min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[140px] text-center'>No</TableHead>
                    <TableHead className='w-[220px]'>Tanggal</TableHead>
                    <TableHead className='w-[260px]'>Ringkasan</TableHead>
                    <TableHead className='w-[140px]'>Kasir</TableHead>
                    <TableHead className='w-[120px] text-center'>Status</TableHead>
                    <TableHead className='w-[120px] text-center'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftsData.data.map((shift) => (
                    <TableRow key={shift.id} className='items-center'>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {shift.no_shift_kasir}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0.5">
                            <Clock className="h-3 w-3 mr-1" /> Buka {formatShortDateTime(shift.tanggal_buka)}
                          </Badge>
                          <Badge variant="outline" className="w-fit text-[10px] px-2 py-0.5">
                            <Clock className="h-3 w-3 mr-1" /> Tutup {shift.tanggal_tutup ? formatShortDateTime(shift.tanggal_tutup) : '-'}
                          </Badge>
                        </div>
                      </TableCell>
                     
                      <TableCell className="text-xs">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <span className="text-gray-600">Awal</span>
                          <span className="font-medium text-right">{formatPrice(shift.saldo_awal)}</span>
                          <span className="text-gray-600">Akhir</span>
                          <span className="font-medium text-right">{shift.saldo_akhir ? formatPrice(shift.saldo_akhir) : '-'}</span>
                          <span className="text-gray-600">Penjualan</span>
                          <span className="font-medium text-green-600 text-right">{formatPrice(shift.total_penjualan)}</span>
                          <span className="text-gray-600">Selisih</span>
                          <span className={shift.selisih !== null ? (shift.selisih >= 0 ? 'font-medium text-green-600 flex items-center justify-end' : 'font-medium text-red-600 flex items-center justify-end') : ''}>
                            {shift.selisih !== null ? (
                              <>
                                {shift.selisih >= 0 ? (
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                )}
                                {shift.selisih >= 0 ? '+' : ''}{formatPrice(shift.selisih)}
                              </>
                            ) : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-900">
                        {shift.user?.name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={shift.status === 'open' ? 'default' : 'secondary'}
                          className="text-xs px-2"
                        >
                          {shift.status === 'open' ? 'Aktif' : 'Ditutup'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewShift(shift)}
                            aria-label="Lihat Detail"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {shift.status === 'closed' && !shift.has_input_pemasukan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleInputPemasukan(shift)}
                              aria-label="Input Pemasukan"
                              title="Input Pemasukan"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
        mode="close"
      />

      <TutupKasirModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedShift(null)
        }}
        shift={selectedShift}
        mode="view"
      />

      <InputPemasukanModal
        isOpen={showInputPemasukanModal}
        onClose={() => { setShowInputPemasukanModal(false); setSelectedShift(null) }}
        onSubmit={submitInputPemasukan}
      />
    </div>
  )
}

