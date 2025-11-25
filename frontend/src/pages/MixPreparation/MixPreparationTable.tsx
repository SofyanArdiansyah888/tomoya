import { Eye } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'

interface MixPreparationHeader {
  id: number
  lokasi_id: number
  output_material_id: number
  output_quantity: number
  keterangan?: string
  tanggal: string
  output_material?: { id: number; name: string; sku: string; unit: string }
  lokasi?: { id: number; nama: string; tipe: 'gudang' | 'toko' }
}

interface MixPreparationTableProps {
  items: MixPreparationHeader[]
  isLoading: boolean
  onViewDetail?: (id: number) => void
}

export const MixPreparationTable = ({ items, isLoading, onViewDetail }: MixPreparationTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Hasil</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Hasil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.tanggal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lokasi?.nama || 'Toko'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.output_material?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">{item.output_quantity} {item.output_material?.unit || ''}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">{item.keterangan || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-amber-50 text-amber-700 border-amber-200"
                      onClick={() => onViewDetail?.(item.id)}
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}