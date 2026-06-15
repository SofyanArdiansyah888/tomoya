import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { Label } from '../../components/ui/label'
import { Modal } from '../../components/ui/modal'
import { Textarea } from '../../components/ui/textarea'
import { formatPrice } from '../../lib/formatPrice'
import { shiftService } from '../../services/shift'
import { ShiftDetail, ShiftKasir, TutupKasirRequest } from '../../types/shift'

interface TutupKasirModalProps {
  isOpen: boolean
  onClose: () => void
  shift: ShiftKasir | null
  onSubmit?: (data: TutupKasirRequest) => Promise<void>
  isLoading?: boolean
  mode?: 'close' | 'view'
}

export const TutupKasirModal = ({
  isOpen,
  onClose,
  shift,
  onSubmit,
  isLoading: externalIsLoading = false,
  mode = 'close',
}: TutupKasirModalProps) => {
  const isViewMode = mode === 'view'
  const [saldoAkhir, setSaldoAkhir] = useState(0)
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const [shiftDetail, setShiftDetail] = useState<ShiftDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoading = externalIsLoading || isSubmitting

  useEffect(() => {
    if (isOpen && shift) {
      setIsLoadingDetail(true)
      shiftService.getShiftDetail(shift.id)
        .then((detail) => {
          setShiftDetail(detail)
          setIsLoadingDetail(false)
        })
        .catch(() => {
          setIsLoadingDetail(false)
        })
    }
  }, [isOpen, shift])

  if (!shift) return null

  // Use shiftDetail if available, otherwise use shift
  const displayShift = shiftDetail || shift

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewMode || !onSubmit) return

    if (saldoAkhir < 0) {
      setError('Saldo akhir tidak boleh negatif')
      return
    }
    if (saldoAkhir === 0) {
      setError('Saldo akhir harus diisi')
      return
    }

    setError('')
    setIsSubmitting(true)
    
    try {
      await onSubmit({ saldo_akhir: saldoAkhir, catatan: catatan || undefined })
    } finally {
      setIsSubmitting(false)
    }
  }
 
  // Rincian cash dari backend (tanpa double-count arus_kas mirror)
  const cashFlow = displayShift.cash_flow
  const penjualanCash = cashFlow?.penjualan_cash ?? displayShift.total_penjualan_cash
  const totalPemasukanCash = cashFlow?.pemasukan_cash ?? (displayShift.pemasukan || []).reduce((sum, pemasukan) => {
    if (pemasukan.metode_pembayaran === 'cash') {
      return sum + pemasukan.jumlah
    }
    return sum
  }, 0)
  const totalCashMasuk = cashFlow?.total_cash_masuk ?? (penjualanCash + totalPemasukanCash)

  const totalPengeluaranCash = cashFlow?.pengeluaran_cash ?? (displayShift.pengeluaran || []).reduce((sum, pengeluaran) => {
    if (pengeluaran.metode_pembayaran === 'cash') {
      return sum + pengeluaran.jumlah
    }
    return sum
  }, 0)

  const totalPembelianCash = cashFlow?.pembelian_cash ?? (displayShift.pembelian || []).reduce((sum, pembelian) => {
    if (pembelian.metode_pembayaran === 'cash') {
      return sum + pembelian.total_harga
    }
    return sum
  }, 0)

  const totalCashKeluar = cashFlow?.total_cash_keluar ?? (totalPengeluaranCash + totalPembelianCash)

  const expectedSaldoAkhir = cashFlow?.expected_saldo_akhir ?? (displayShift.saldo_awal + totalCashMasuk - totalCashKeluar)
  const selisih = isViewMode
    ? (displayShift.selisih ?? 0)
    : (saldoAkhir > 0 ? saldoAkhir - expectedSaldoAkhir : 0)
  const displayedSaldoAkhir = isViewMode ? displayShift.saldo_akhir : (saldoAkhir > 0 ? saldoAkhir : null)

  const recapContent = (
    isLoadingDetail ? (
      <div className="text-center py-8">Memuat rekapitulasi...</div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-lg mb-4">Rekapitulasi Shift</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">No. Shift</p>
            <p className="font-semibold">{displayShift.no_shift_kasir}</p>
          </div>
          <div>
            <p className="text-gray-600">Kasir</p>
            <p className="font-semibold">{displayShift.user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold">{displayShift.status === 'open' ? 'Aktif' : 'Ditutup'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Saldo Awal</p>
            <p className="text-lg font-semibold">{formatPrice(displayShift.saldo_awal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saldo Akhir</p>
            <p className="text-lg font-semibold text-blue-600">
              {displayedSaldoAkhir != null ? formatPrice(displayedSaldoAkhir) : '-'}
            </p>
          </div>
        </div>

              {/* Penjualan per Metode */}
              <div className="border-t pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total Penjualan per Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash:</span>
                    <span className="font-medium">{formatPrice(displayShift.total_penjualan_cash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card:</span>
                    <span className="font-medium">{formatPrice(displayShift.total_penjualan_card)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">QRIS:</span>
                    <span className="font-medium">{formatPrice(displayShift.total_penjualan_qris)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other:</span>
                    <span className="font-medium">{formatPrice(displayShift.total_penjualan_other)}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t flex justify-between">
                  <span className="font-semibold">Total Penjualan:</span>
                  <span className="font-semibold text-green-600">{formatPrice(displayShift.total_penjualan)}</span>
                </div>
              </div>

              {/* Rincian Cash Masuk & Keluar */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Rincian Cash</p>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-700 mb-1">Cash Masuk:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Penjualan Cash:</span>
                        <span className="font-medium">{formatPrice(penjualanCash)}</span>
                      </div>
                      {totalPemasukanCash > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pemasukan Cash:</span>
                          <span className="font-medium">{formatPrice(totalPemasukanCash)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-green-200">
                        <span className="font-semibold text-green-700">Total Cash Masuk:</span>
                        <span className="font-semibold text-green-700">{formatPrice(totalCashMasuk)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="font-medium text-red-700 mb-1">Cash Keluar:</p>
                    <div className="space-y-1 text-xs">
                      {totalPengeluaranCash > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pengeluaran Cash:</span>
                          <span className="font-medium">{formatPrice(totalPengeluaranCash)}</span>
                        </div>
                      )}
                      {totalPembelianCash > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pembelian Cash:</span>
                          <span className="font-medium">{formatPrice(totalPembelianCash)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-red-200">
                        <span className="font-semibold text-red-700">Total Cash Keluar:</span>
                        <span className="font-semibold text-red-700">{formatPrice(totalCashKeluar)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected vs Actual */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Saldo Awal:</span>
                  <span className="text-sm font-medium">{formatPrice(displayShift.saldo_awal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-green-700">Total Cash Masuk:</span>
                  <span className="text-sm font-medium text-green-700">{formatPrice(totalCashMasuk)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-red-700">Total Cash Keluar:</span>
                  <span className="text-sm font-medium text-red-700">{formatPrice(totalCashKeluar)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-semibold text-blue-700">Saldo Akhir yang Diharapkan:</span>
                  <span className="text-lg font-bold text-blue-700">{formatPrice(expectedSaldoAkhir)}</span>
                </div>
                {(isViewMode ? displayShift.selisih != null : saldoAkhir > 0) && (
                  <div className="flex justify-between items-center mt-3 pt-2 border-t">
                    <span className="text-sm font-semibold text-gray-700">
                      {isViewMode ? 'Selisih:' : 'Selisih (perkiraan):'}
                    </span>
                    <span className={`text-lg font-semibold ${selisih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selisih >= 0 ? '+' : ''}{formatPrice(selisih)}
                    </span>
                  </div>
                )}
                {!isViewMode && saldoAkhir > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Selisih final akan dihitung setelah tutup kasir
                  </p>
                )}
              </div>
      </div>
    )
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Detail Shift' : 'Tutup Kasir'}
      size="xl"
    >
      {isViewMode ? (
        <div className="space-y-6">
          {recapContent}
          {displayShift.catatan && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Catatan</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{displayShift.catatan}</p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button type="button" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {recapContent}

          <div>
            <Label htmlFor="saldo_akhir">Saldo Akhir *</Label>
            <CurrencyInput
              value={saldoAkhir}
              onChange={setSaldoAkhir}
              placeholder="Masukkan saldo akhir"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            {saldoAkhir > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Saldo yang diharapkan: {formatPrice(expectedSaldoAkhir)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan (opsional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || saldoAkhir <= 0}>
              {isLoading ? 'Menutup...' : 'Tutup Kasir'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

