import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { Label } from '../../components/ui/label'
import { Modal } from '../../components/ui/modal'
import { Textarea } from '../../components/ui/textarea'
import { BukaKasirRequest } from '../../types/shift'

// Default shop location ID is 2
const DEFAULT_SHOP_LOCATION_ID = 2

interface BukaKasirModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BukaKasirRequest) => Promise<void>
  isLoading?: boolean
}

export const BukaKasirModal = ({ isOpen, onClose, onSubmit, isLoading: externalIsLoading = false }: BukaKasirModalProps) => {
  const [formData, setFormData] = useState<BukaKasirRequest>({
    lokasi_id: DEFAULT_SHOP_LOCATION_ID,
    saldo_awal: 0,
    catatan: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BukaKasirRequest, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoading = externalIsLoading || isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Partial<Record<keyof BukaKasirRequest, string>> = {}
    if (formData.saldo_awal < 0) {
      newErrors.saldo_awal = 'Saldo awal tidak boleh negatif'
    }
    if (formData.saldo_awal === 0) {
      newErrors.saldo_awal = 'Saldo awal harus diisi'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      // Reset form after successful submit
      setFormData({
        lokasi_id: DEFAULT_SHOP_LOCATION_ID,
        saldo_awal: 0,
        catatan: '',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buka Kasir" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="saldo_awal">Saldo Awal *</Label>
          <CurrencyInput
            value={formData.saldo_awal}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, saldo_awal: value }))
              if (errors.saldo_awal) {
                setErrors(prev => ({ ...prev, saldo_awal: undefined }))
              }
            }}
            placeholder="Masukkan saldo awal"
          />
          {errors.saldo_awal && (
            <p className="mt-1 text-sm text-red-600">{errors.saldo_awal}</p>
          )}
        </div>

        <div>
          <Label htmlFor="catatan">Catatan</Label>
          <Textarea
            id="catatan"
            value={formData.catatan}
            onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
            placeholder="Catatan (opsional)"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Membuka...' : 'Buka Kasir'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

