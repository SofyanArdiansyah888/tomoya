import { useEffect, useState } from 'react'
import { MaterialSelect } from '../../components/forms/MaterialSelect'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'

import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Recipe } from '../../types/recipe'

interface RecipeFormProps {
  recipe?: Recipe | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isSaving?: boolean
}

interface RecipeMaterial {
  material_id: number
  quantity: number
  unit: string
  cost?: number
}

export const RecipeForm = ({ recipe, onSubmit, onCancel, isSaving = false }: RecipeFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    yield_quantity: '',
    yield_unit: 'pcs',
    cost_per_unit: '',
    instructions: '',
    is_active: true,
    is_kopi: false,
  })

  const [materials, setMaterials] = useState<RecipeMaterial[]>([])


  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        yield_quantity: recipe.yield_quantity.toString(),
        yield_unit: recipe.yield_unit,
        cost_per_unit: recipe.cost_per_unit?.toString() || '',
        instructions: recipe.instructions || '',
        is_active: recipe.is_active,
        is_kopi: recipe.is_kopi,
      })

      if (recipe.materials) {
        setMaterials(recipe.materials.map(material => ({
          material_id: material.id,
          quantity: material.pivot?.quantity || 0,
          unit: material.pivot?.unit || '',
          cost: material.pivot?.cost || undefined,
        })))
      }
    } else {
      setFormData({
        name: '',
        description: '',
        yield_quantity: '',
        yield_unit: 'pcs',
        cost_per_unit: '',
        instructions: '',
        is_active: true,
        is_kopi: false,
      })
      setMaterials([])
    }
  }, [recipe])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      yield_quantity: parseFloat(formData.yield_quantity),
      cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : null,
      materials: materials,
      is_kopi: false
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addMaterial = () => {
    setMaterials(prev => [...prev, {
      material_id: 0,
      quantity: 0,
      unit: 'kg',
      cost: undefined,
    }])
  }

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, field: keyof RecipeMaterial, value: string | number | undefined) => {
    setMaterials(prev => prev.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ))
  }

  const calculateTotalCost = () => {
    return materials.reduce((total, material) => {
      const cost = material.cost || 0
      return total + cost
    }, 0)
  }

  const calculateCostPerUnit = () => {
    const totalCost = calculateTotalCost()
    const yieldQty = parseFloat(formData.yield_quantity) || 1
    return totalCost / yieldQty
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Resep *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
          placeholder="Masukkan nama resep"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
          placeholder="Masukkan deskripsi resep"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yield_quantity">Jumlah Hasil *</Label>
          <Input
            id="yield_quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.yield_quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('yield_quantity', e.target.value)}
            placeholder="1.00"
            required
          />
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="yield_unit">Unit Hasil *</Label>
          <UnitSelect
            value={formData.yield_unit}
            onChange={(value) => handleChange('yield_unit', value)}
            placeholder="Pilih unit"
            required
          />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="cost_per_unit">Biaya per Unit</Label>
          <CurrencyInput
            value={formData.cost_per_unit}
            onChange={(value) => handleChange('cost_per_unit', value.toString())}
            placeholder="Masukkan biaya per unit"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instruksi</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('instructions', e.target.value)}
          placeholder="Masukkan instruksi pembuatan"
          rows={4}
        />
      </div>

      {/* Materials Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-lg font-medium">Material</Label>
          <Button type="button" onClick={addMaterial} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Material
          </Button>
        </div>

        {materials.map((material, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Material *</Label>
                  <MaterialSelect
                    value={material.material_id.toString()}
                    onChange={(value) => updateMaterial(index, 'material_id', parseInt(value))}
                    placeholder="Pilih material"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jumlah *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={material.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label>Unit *</Label>
                  <UnitSelect
                    value={material.unit}
                    onChange={(value) => updateMaterial(index, 'unit', value)}
                    placeholder="Pilih unit"
                    required
                  />
                </div> */}

                <div className="space-y-2">
                  <Label>Biaya</Label>
                  <div className="flex gap-2">
                    <CurrencyInput
                      value={material.cost || 0}
                      onChange={(value) => updateMaterial(index, 'cost', value)}
                      placeholder="Masukkan biaya"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Cost Calculation */}
        {materials.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Biaya Material:</span>
                <span className="text-lg font-bold text-green-600">
                  Rp {calculateTotalCost().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Biaya per Unit:</span>
                <span className="text-lg font-bold text-blue-600">
                  Rp {calculateCostPerUnit().toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked: boolean) => handleChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Resep Aktif</Label>
      </div>

  
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Menyimpan...' : (recipe ? 'Perbarui' : 'Simpan')}
        </Button>
      </div>
    </form>
  )
}
