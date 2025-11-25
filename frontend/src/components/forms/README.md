# Form Components

Koleksi komponen form yang dapat digunakan kembali di seluruh aplikasi.

## Select Components

### Generic Select Component

Komponen Select generik yang dapat digunakan untuk berbagai keperluan.

```tsx
import { Select, SelectOption } from '../ui/select'

const options: SelectOption[] = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2', disabled: true },
  { value: 3, label: 'Option 3' }
]

<Select
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Pilih opsi..."
  searchable={true}
  disabled={false}
  error="Error message"
/>
```

**Props:**
- `options: SelectOption[]` - Array opsi yang akan ditampilkan
- `value?: string | number` - Nilai yang dipilih
- `onValueChange?: (value: string | number) => void` - Callback saat nilai berubah
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Apakah select disabled
- `className?: string` - CSS class tambahan
- `loading?: boolean` - Apakah sedang loading
- `error?: string` - Pesan error
- `searchable?: boolean` - Apakah dapat dicari

### SupplierSelect Component

Komponen select khusus untuk memilih supplier dengan data dari API.

```tsx
import { SupplierSelect } from '../forms'

<SupplierSelect
  value={selectedSupplierId}
  onValueChange={setSelectedSupplierId}
  placeholder="Pilih Supplier..."
  searchable={true}
  disabled={false}
  error="Error message"
/>
```

**Features:**
- ✅ Data diambil dari API `/api/supplier`
- ✅ Menampilkan nama dan kode supplier
- ✅ Supplier yang tidak aktif akan disabled
- ✅ Support pencarian
- ✅ Loading state
- ✅ Error handling

### CategorySelect Component

Komponen select khusus untuk memilih kategori dengan data dari API.

```tsx
import { CategorySelect } from '../forms'

<CategorySelect
  value={selectedCategoryId}
  onValueChange={setSelectedCategoryId}
  placeholder="Pilih Kategori..."
  searchable={true}
  disabled={false}
  error="Error message"
/>
```

**Features:**
- ✅ Data diambil dari API `/api/kategori`
- ✅ Menampilkan nama kategori
- ✅ Kategori yang tidak aktif akan disabled
- ✅ Support pencarian
- ✅ Loading state
- ✅ Error handling

## Usage Examples

### Basic Usage

```tsx
import { useState } from 'react'
import { SupplierSelect, CategorySelect } from '../forms'

const MyForm = () => {
  const [supplierId, setSupplierId] = useState<number>()
  const [categoryId, setCategoryId] = useState<number>()

  return (
    <form>
      <div>
        <label>Supplier</label>
        <SupplierSelect
          value={supplierId}
          onValueChange={setSupplierId}
        />
      </div>
      
      <div>
        <label>Kategori</label>
        <CategorySelect
          value={categoryId}
          onValueChange={setCategoryId}
        />
      </div>
    </form>
  )
}
```

### With Form Validation

```tsx
import { useState } from 'react'
import { SupplierSelect } from '../forms'

const MyForm = () => {
  const [supplierId, setSupplierId] = useState<number>()
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!supplierId) {
      setErrors({ supplier: 'Supplier wajib dipilih' })
      return
    }
    
    // Submit form
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Supplier *</label>
        <SupplierSelect
          value={supplierId}
          onValueChange={setSupplierId}
          error={errors.supplier}
        />
      </div>
    </form>
  )
}
```

### With React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form'
import { SupplierSelect, CategorySelect } from '../forms'

const MyForm = () => {
  const { control, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="supplier_id"
        control={control}
        render={({ field, fieldState }) => (
          <SupplierSelect
            value={field.value}
            onValueChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      
      <Controller
        name="category_id"
        control={control}
        render={({ field, fieldState }) => (
          <CategorySelect
            value={field.value}
            onValueChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
    </form>
  )
}
```

## Styling

Komponen menggunakan Tailwind CSS dan dapat dikustomisasi dengan props `className`:

```tsx
<SupplierSelect
  className="w-full max-w-md"
  value={supplierId}
  onValueChange={setSupplierId}
/>
```

## Performance

- Data di-cache selama 5 menit menggunakan React Query
- Pencarian dilakukan di frontend untuk performa optimal
- Loading state ditampilkan saat data sedang dimuat
- Error handling untuk network issues
