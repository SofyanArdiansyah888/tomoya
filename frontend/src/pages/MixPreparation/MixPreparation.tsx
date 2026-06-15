import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Search } from 'lucide-react'
import { Modal } from '../../components/ui/modal'
import { MixPreparationTable } from './MixPreparationTable'
import { MixPreparationForm } from './MixPreparationForm'
import { api } from '../../services/api'

export const MixPreparation = () => {
  const DEFAULT_SHOP_LOCATION_ID = 2
  const [isOpen, setIsOpen] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mix-preparation', DEFAULT_SHOP_LOCATION_ID, dateFrom, dateTo],
    queryFn: async () => {
      const params: any = { lokasi_id: DEFAULT_SHOP_LOCATION_ID }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res = await api.get('/mix-preparation', { params })
      return res.data?.data || []
    }
  })

  const handleViewDetail = async (id: number) => {
    const res = await api.get(`/mix-preparation/${id}`)
    setDetail(res.data?.data)
  }

  const items = data || []
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items
    return items.filter((item: any) => {
      return (
        item.output_material?.name?.toLowerCase().includes(term) ||
        item.output_material?.sku?.toLowerCase().includes(term) ||
        item.lokasi?.nama?.toLowerCase().includes(term) ||
        (item.keterangan || '').toLowerCase().includes(term)
      )
    })
  }, [items, searchTerm])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mix Preparation</h1>
        <p className="text-sm text-gray-600 mt-1">Riwayat dan pembuatan batch konversi material di lokasi toko</p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari material hasil, lokasi, atau keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full md:w-44"
              placeholder="Dari"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full md:w-44"
              placeholder="Sampai"
            />

            <Button
              variant="outline"
              onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); }}
              className="shrink-0"
            >
              Reset
            </Button>

            <Button onClick={() => setIsOpen(true)} className="shrink-0">Tambah</Button>
          </div>
        </CardContent>
      </Card>

      <MixPreparationTable items={filteredItems} isLoading={isLoading} onViewDetail={handleViewDetail} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Tambah Mix Preparation"
        size='lg'
      >
        <Card>
          <CardHeader>
            <CardTitle>Form Mix Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <MixPreparationForm lokasiId={DEFAULT_SHOP_LOCATION_ID} onSuccess={() => { setIsOpen(false); refetch(); }} />
          </CardContent>
        </Card>
      </Modal>

      <Modal 
      size='xl'
      isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Mix Preparation">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            {detail ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500">Tanggal</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(detail.header.tanggal).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500">Lokasi</div>
                    <div className="text-sm font-semibold text-gray-900">{detail.header.lokasi?.nama || 'Toko'}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500">Keterangan</div>
                    <div className="text-sm font-semibold text-gray-900">{detail.header.keterangan || '-'}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-xs text-gray-500">User</div>
                    <div className="text-sm font-semibold text-gray-900">{detail.header.user?.name || '-'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Hasil</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{detail.header.output_material?.name || '-'}</div>
                        <div className="text-xs text-gray-500">SKU: {detail.header.output_material?.sku || '-'}</div>
                      </div>
                      <div className="text-sm font-semibold text-emerald-600">+{detail.header.output_quantity} {detail.header.output_material?.unit || ''}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-white">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Bahan</div>
                    <div className="space-y-2">
                      {detail.items.filter((it: any) => (it.quantity ?? 0) < 0).map((it: any) => (
                        <div key={it.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{it.material?.name}</div>
                            <div className="text-xs text-gray-500">SKU: {it.material?.sku || '-'}</div>
                          </div>
                          <div className="text-sm font-semibold text-red-600">{it.quantity} {it.material?.unit || ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-white">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Pergerakan Lengkap</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {detail.items.map((it: any) => (
                          <tr key={it.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{it.material?.name}</td>
                            <td className={`px-4 py-2 text-sm font-semibold ${((it.quantity ?? 0) > 0) ? 'text-emerald-600' : 'text-red-600'}`}>{(it.quantity ?? 0) > 0 ? `+${it.quantity}` : it.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{it.material?.unit || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </Modal>
    </div>
  )
}