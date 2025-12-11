import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { hppService } from '../../services/hpp'
import { HppPenjualanFilters, HppPenjualanItem, HppPenjualanResponse } from '../../types/hpp'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatPrice } from '../../lib/formatPrice'

export const HppPenjualanPage = () => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filters: HppPenjualanFilters = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }
  }, [debouncedSearch, dateFrom, dateTo])

  const { data, isLoading, isFetching, error, refetch } = useQuery<HppPenjualanResponse>({
    queryKey: ['hpp-penjualan', filters],
    queryFn: () => hppService.getHppPenjualan(filters),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    refetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const items: HppPenjualanItem[] = Array.isArray(data?.data) ? data?.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HPP Penjualan</h1>
        <p className="text-gray-600">Laporan HPP per item terjual beserta margin</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pencarian Produk</label>
              <Input
                placeholder="Cari berdasarkan nama produk"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dari Tanggal</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sampai Tanggal</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-gray-900">
            {formatPrice(data?.summary?.total_penjualan ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total HPP</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-gray-900">
            {formatPrice(data?.summary?.total_hpp ?? 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Margin</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-gray-900">
            {formatPrice(data?.summary?.total_margin ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Detail Item Terjual</CardTitle>
            <p className="text-sm text-gray-600">Akumulasi per produk terjual</p>
          </div>
          {(isLoading || isFetching) && (
            <span className="text-sm text-gray-500">Memuat...</span>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-red-600">Gagal memuat data HPP Penjualan</div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                    <TableHead className="text-right">Harga Rata</TableHead>
                    <TableHead className="text-right">HPP Rata</TableHead>
                    <TableHead className="text-right">Total HPP</TableHead>
                    <TableHead className="text-right">Total Jual</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.produk_id}>
                        <TableCell>
                          <div className="font-medium">{item.produk_nama}</div>
                          <div className="text-xs text-gray-500">{item.produk_kode ?? '-'}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.total_qty}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.avg_harga)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.avg_hpp)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.total_hpp)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.total_harga)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.margin)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

