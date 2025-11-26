import { Label } from '@/components/ui'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/modal'

interface InputPemasukanModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { jumlah: number }) => Promise<void>
}

export const InputPemasukanModal = ({ isOpen, onClose, onSubmit }: InputPemasukanModalProps) => {
  const [jumlah, setJumlah] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || Number(jumlah) <= 0) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        jumlah: Number(jumlah),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Input Pemasukan Shift" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="jumlah">Jumlah *</Label>
          <CurrencyInput
            value={jumlah}
            onChange={(value) => setJumlah(value)}
            placeholder="0"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button type="submit" disabled={isSubmitting || !jumlah}>Simpan</Button>
        </div>
      </form>
    </Modal>
  )
}

