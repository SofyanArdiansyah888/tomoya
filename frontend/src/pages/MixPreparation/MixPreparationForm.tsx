import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { MaterialSelect } from '../../components/forms'
import { itemLokasiService } from '../../services/inventory'
import { toast } from 'sonner'

type MixInput = { material_id: string; quantity: number }

interface MixPreparationFormProps {
  lokasiId: number
  onSuccess?: () => void
}

export const MixPreparationForm = ({ lokasiId, onSuccess }: MixPreparationFormProps) => {
  const [outputMaterialId, setOutputMaterialId] = useState<string>('')
  const [outputQuantity, setOutputQuantity] = useState<number>(0)
  const [inputs, setInputs] = useState<MixInput[]>([{ material_id: '', quantity: 0 }])
  const [keterangan, setKeterangan] = useState<string>('')

  const createMix = useMutation({
    mutationFn: itemLokasiService.createMixPreparation,
    onSuccess: () => {
      toast.success('Mix Preparation berhasil dibuat')
      onSuccess?.()
      setOutputMaterialId('')
      setOutputQuantity(0)
      setInputs([{ material_id: '', quantity: 0 }])
      setKeterangan('')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Gagal membuat Mix Preparation'
      toast.error(message)
    }
  })

  const { data: outputStocks } = useQuery({
    queryKey: ['item-lokasi-toko-for-output', outputMaterialId],
    queryFn: () => itemLokasiService.getCurrentStock('toko'),
    enabled: !!outputMaterialId
  })

  const currentOutputStock = useMemo(() => {
    if (!outputMaterialId || !outputStocks) return { qty: 0, unit: '' }
    const s = outputStocks.find((x) => x.material_id == Number(outputMaterialId) && x.lokasi_id === lokasiId)
    return {
      qty: Number(s?.quantity ?? s?.current_stock ?? 0),
      unit: s?.material?.unit ?? ''
    }
  }, [outputMaterialId, outputStocks, lokasiId])

  interface MixInputRowProps {
    index: number
    row: MixInput
    lokasiId: number
    onChangeMaterial: (index: number, materialId: string) => void
    onChangeQuantity: (index: number, quantity: number) => void
    onRemove: (index: number) => void
  }

  const MixInputRow = ({ index, row, lokasiId, onChangeMaterial, onChangeQuantity, onRemove }: MixInputRowProps) => {
    const [qtyText, setQtyText] = useState<string>(row.quantity ? String(row.quantity) : '')
    const { data: stocks } = useQuery({
      queryKey: ['item-lokasi-toko-input', row.material_id],
      queryFn: () => itemLokasiService.getCurrentStock('toko'),
      enabled: !!row.material_id
    })

    const current = useMemo(() => {
      if (!row.material_id || !stocks) return { qty: 0, unit: '' }
      const s = stocks.find((x: any) => x.material_id == Number(row.material_id) && x.lokasi_id === lokasiId)
      return {
        qty: Number(s?.quantity ?? s?.current_stock ?? 0),
        unit: s?.material?.unit ?? ''
      }
    }, [stocks, row.material_id, lokasiId])


    return (
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Material</label>
          <MaterialSelect value={row.material_id} onChange={(v) => onChangeMaterial(index, v)} placeholder="Pilih material" />
          <div className="h-4" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Jumlah</label>
            {row.material_id && (
              <span className="text-xs text-gray-600">Stok saat ini: {current.qty} {current.unit}</span>
            )}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            value={qtyText}
            onChange={e => {
              const next = e.target.value
              if (next === '' || /^\d+$/.test(next)) {
                setQtyText(next)
              }
            }}
            onBlur={() => {
              const val = qtyText === '' ? 0 : Number(qtyText)
              onChangeQuantity(index, val)
            }}
            className={row.material_id && ((Number(qtyText) || 0) > current.qty) ? 'border-red-500' : ''}
          />
          <div className="h-4">
            {row.material_id && ((Number(qtyText) || 0) > current.qty) && (
              <span className="text-xs text-red-600">Maksimal {current.qty} {current.unit}</span>
            )}
          </div>
        </div>
        <div className="flex md:justify-end items-center h-full">
          <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>Hapus</Button>
        </div>
      </div>
    )
  }

  const addInputRow = () => setInputs(prev => [...prev, { material_id: '', quantity: 0 }])
  const removeInputRow = (index: number) => setInputs(prev => prev.filter((_, i) => i !== index))
  const updateInputMaterial = (index: number, materialId: string) => setInputs(prev => prev.map((row, i) => i === index ? { ...row, material_id: materialId } : row))
  const updateInputQuantity = (index: number, quantity: number) => setInputs(prev => prev.map((row, i) => i === index ? { ...row, quantity } : row))

  const { data: validationStocks } = useQuery({
    queryKey: ['validation-stock-toko', lokasiId],
    queryFn: () => itemLokasiService.getCurrentStock('toko'),
    enabled: !!lokasiId,
    staleTime: 0
  })

  const handleSubmit = () => {
    if (!outputMaterialId || outputQuantity <= 0) {
      toast.error('Isi material hasil dan jumlahnya')
      return
    }
    const validInputs = inputs.filter(i => i.material_id && i.quantity > 0)
    if (validInputs.length === 0) {
      toast.error('Tambahkan bahan input yang valid')
      return
    }

    const vMap = new Map<number, number>()
    for (const s of (validationStocks ?? [])) {
      if (s.lokasi_id !== lokasiId) continue
      vMap.set(Number(s.material_id), Number(s.quantity ?? s.current_stock ?? 0))
    }
    for (const i of validInputs) {
      const avail = vMap.get(Number(i.material_id)) ?? 0
      if (i.quantity > avail) {
        toast.error('Stok tidak mencukupi untuk salah satu bahan input')
        return
      }
    }
    createMix.mutate({
      lokasi_id: lokasiId,
      output_material_id: Number(outputMaterialId),
      output_quantity: outputQuantity,
      inputs: validInputs.map(i => ({ material_id: Number(i.material_id), quantity: i.quantity })),
      keterangan
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Material Hasil</label>
            {outputMaterialId && (
              <span className="text-xs text-gray-600">Stok saat ini: {currentOutputStock.qty} {currentOutputStock.unit}</span>
            )}
          </div>
          <MaterialSelect value={outputMaterialId} onChange={setOutputMaterialId} placeholder="Pilih material hasil" />
          <div className="h-4" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jumlah Hasil</label>
          <Input type="number" value={outputQuantity} onChange={e => setOutputQuantity(Number(e.target.value))} />
          <div className="h-4" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bahan Input</h2>
          <Button variant="outline" onClick={addInputRow}>Tambah Bahan</Button>
        </div>
        {inputs.map((row, index) => (
          <MixInputRow
            key={index}
            index={index}
            row={row}
            lokasiId={lokasiId}
            onChangeMaterial={updateInputMaterial}
            onChangeQuantity={updateInputQuantity}
            onRemove={removeInputRow}
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Keterangan</label>
        <Input type="text" value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Opsional" />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={createMix.isPending}>Simpan</Button>
        <Button variant="outline" onClick={() => {
          setOutputMaterialId('')
          setOutputQuantity(0)
          setInputs([{ material_id: '', quantity: 0 }])
          setKeterangan('')
        }}>Reset</Button>
      </div>
    </div>
  )
}
