# Komponen Frontend Manajemen Inventori - Tomoya Coffee Shop

## Daftar Isi
1. [Ringkasan Komponen](#ringkasan-komponen)
2. [Dashboard Inventori](#dashboard-inventori)
3. [Komponen Transfer Stok](#komponen-transfer-stok)
4. [Komponen Manajemen Inventori](#komponen-manajemen-inventori)
5. [Komponen Alert Stok](#komponen-alert-stok)
6. [Komponen Pelaporan](#komponen-pelaporan)
7. [Manajemen State](#manajemen-state)
8. [Integrasi API](#integrasi-api)
9. [Strategi Testing](#strategi-testing)

## Ringkasan Komponen

### Hierarki Komponen
```
ManajemenInventori/
├── Dashboard/
│   ├── DashboardInventori.tsx
│   ├── RingkasanInventori.tsx
│   ├── AlertStok.tsx
│   └── PergerakanTerbaru.tsx
├── Gudang/
│   ├── DaftarGudang.tsx
│   ├── DetailGudang.tsx
│   ├── InventoriGudang.tsx
│   └── FormGudang.tsx
├── Toko/
│   ├── DaftarToko.tsx
│   ├── DetailToko.tsx
│   ├── InventoriToko.tsx
│   └── FormToko.tsx
├── TransferStok/
│   ├── DaftarTransfer.tsx
│   ├── DetailTransfer.tsx
│   ├── FormTransfer.tsx
│   ├── ItemTransfer.tsx
│   └── StatusTransfer.tsx
├── Inventori/
│   ├── TabelInventori.tsx
│   ├── ItemInventori.tsx
│   ├── PenyesuaianStok.tsx
│   └── PergerakanStok.tsx
└── Laporan/
    ├── LaporanInventori.tsx
    ├── LaporanTransfer.tsx
    ├── LaporanPergerakanStok.tsx
    └── LaporanAlert.tsx
```

## Dashboard Inventori

### Komponen Dashboard Utama
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RingkasanInventori } from './RingkasanInventori';
import { AlertStok } from './AlertStok';
import { PergerakanTerbaru } from './PergerakanTerbaru';
import { DaftarTransfer } from '../TransferStok/DaftarTransfer';

interface DashboardInventoriProps {
  locationType: 'gudang' | 'toko';
  locationId: number;
  userRole: 'admin' | 'manager' | 'staff';
}

export const DashboardInventori: React.FC<DashboardInventoriProps> = ({
  locationType,
  locationId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [locationType, locationId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, alertsRes, movementsRes] = await Promise.all([
        api.get(`/${locationType}/${locationId}/inventory`),
        api.get('/alert-stok/unresolved'),
        api.get('/pergerakan-stok', {
          params: { location_type: locationType, location_id: locationId, limit: 10 }
        })
      ]);

      setInventory(inventoryRes.data);
      setAlerts(alertsRes.data);
      setMovements(movementsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = () => {
    // Navigate to transfer creation
    navigate('/inventori/transfer/create');
  };

  const handleCreateAdjustment = () => {
    // Navigate to stock adjustment
    navigate('/inventori/penyesuaian/create');
  };

  if (loading) {
    return <DashboardInventoriSkeleton />;
  }

  return (
    <div className="dashboard-inventori">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="text-3xl font-bold">Dashboard Inventori</h1>
          <p className="text-gray-600">
            Kelola inventori untuk {locationType === 'gudang' ? 'Gudang' : 'Toko'}
          </p>
        </div>
        <div className="header-actions">
          <Button onClick={handleCreateTransfer} className="mr-2">
            Buat Transfer
          </Button>
          <Button variant="outline" onClick={handleCreateAdjustment}>
            Penyesuaian Stok
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="inventory">Inventori</TabsTrigger>
          <TabsTrigger value="transfers">Transfer</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RingkasanInventori inventory={inventory} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Alert Stok
                  <Badge variant="destructive">{alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertStok alerts={alerts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pergerakan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <PergerakanTerbaru movements={movements} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <TabelInventori 
            inventory={inventory}
            locationType={locationType}
            locationId={locationId}
            onUpdateStock={handleUpdateStock}
          />
        </TabsContent>

        <TabsContent value="transfers">
          <DaftarTransfer 
            locationType={locationType}
            locationId={locationId}
          />
        </TabsContent>

        <TabsContent value="reports">
          <LaporanInventori 
            locationType={locationType}
            locationId={locationId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Komponen Ringkasan Inventori
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';

interface RingkasanInventoriProps {
  inventory: InventoryItem[];
}

export const RingkasanInventori: React.FC<RingkasanInventoriProps> = ({ inventory }) => {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.isLowStock).length;
  const outOfStockItems = inventory.filter(item => item.isOutOfStock).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const summaryCards = [
    {
      title: 'Total Item',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Stok Rendah',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Stok Habis',
      value: outOfStockItems,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Nilai',
      value: `Rp${totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <>
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.title === 'Stok Rendah' && lowStockItems > 0 && (
              <Badge variant="destructive" className="mt-2">
                {lowStockItems} item perlu perhatian
              </Badge>
            )}
            {card.title === 'Stok Habis' && outOfStockItems > 0 && (
              <Badge variant="destructive" className="mt-2">
                {outOfStockItems} item stok habis
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};
```

## Komponen Transfer Stok

### Komponen Daftar Transfer
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, Eye, Edit } from 'lucide-react';

interface TransferListProps {
  locationType: 'warehouse' | 'shop';
  locationId: number;
}

export const TransferList: React.FC<TransferListProps> = ({
  locationType,
  locationId
}) => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchTransfers();
  }, [locationType, locationId]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock-transfers', {
        params: {
          from_location_type: locationType,
          from_location_id: locationId,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          search: searchTerm
        }
      });
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      in_transit: { variant: 'default', label: 'In Transit' },
      delivered: { variant: 'default', label: 'Delivered' },
      cancelled: { variant: 'destructive', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewTransfer = (transferId: number) => {
    navigate(`/inventory/transfers/${transferId}`);
  };

  const handleEditTransfer = (transferId: number) => {
    navigate(`/inventory/transfers/${transferId}/edit`);
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transfer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesType = typeFilter === 'all' || transfer.from_location_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="transfer-list">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stock Transfers</h2>
        <Button onClick={() => navigate('/inventory/transfers/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">
                    {transfer.transfer_number}
                  </TableCell>
                  <TableCell>
                    {transfer.fromLocation?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {transfer.toLocation?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transfer.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(transfer.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transfer.items?.length || 0} items
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTransfer(transfer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {transfer.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransfer(transfer.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Komponen Form Transfer
```typescript
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X } from 'lucide-react';

const transferSchema = z.object({
  from_location_type: z.enum(['warehouse', 'shop']),
  from_location_id: z.number().min(1, 'Please select source location'),
  to_location_type: z.enum(['warehouse', 'shop']),
  to_location_id: z.number().min(1, 'Please select destination location'),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.number().min(1, 'Please select a product'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit_cost: z.number().min(0, 'Unit cost must be positive').optional(),
    notes: z.string().optional()
  })).min(1, 'At least one item is required')
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  initialData?: Partial<TransferFormData>;
  onSubmit: (data: TransferFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_location_type: 'warehouse',
      to_location_type: 'shop',
      items: [{ product_id: 0, quantity: 1, unit_cost: 0, notes: '' }],
      ...initialData
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const fromLocationType = watch('from_location_type');
  const toLocationType = watch('to_location_type');

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      const [productsRes, locationsRes] = await Promise.all([
        api.get('/products'),
        api.get('/locations')
      ]);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddItem = () => {
    append({ product_id: 0, quantity: 1, unit_cost: 0, notes: '' });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFormSubmit = (data: TransferFormData) => {
    onSubmit(data);
  };

  if (loadingData) {
    return <TransferFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_location_type">From Location Type</Label>
              <Select
                value={fromLocationType}
                onValueChange={(value) => setValue('from_location_type', value as 'warehouse' | 'shop')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                </SelectContent>
              </Select>
              {errors.from_location_type && (
                <p className="text-sm text-red-600">{errors.from_location_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_location_id">From Location</Label>
              <Select
                value={watch('from_location_id')?.toString()}
                onValueChange={(value) => setValue('from_location_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter(loc => loc.type === fromLocationType)
                    .map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.from_location_id && (
                <p className="text-sm text-red-600">{errors.from_location_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_location_type">To Location Type</Label>
              <Select
                value={toLocationType}
                onValueChange={(value) => setValue('to_location_type', value as 'warehouse' | 'shop')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                </SelectContent>
              </Select>
              {errors.to_location_type && (
                <p className="text-sm text-red-600">{errors.to_location_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_location_id">To Location</Label>
              <Select
                value={watch('to_location_id')?.toString()}
                onValueChange={(value) => setValue('to_location_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter(loc => loc.type === toLocationType)
                    .map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.to_location_id && (
                <p className="text-sm text-red-600">{errors.to_location_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              {...register('notes')}
              placeholder="Additional notes for this transfer..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transfer Items</CardTitle>
            <Button type="button" onClick={handleAddItem} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={watch(`items.${index}.product_id`)?.toString()}
                    onValueChange={(value) => setValue(`items.${index}.product_id`, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.product_id && (
                    <p className="text-sm text-red-600">{errors.items[index]?.product_id?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    min="1"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Unit Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_cost`, { valueAsNumber: true })}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    {...register(`items.${index}.notes`)}
                    placeholder="Item notes"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {errors.items && (
            <p className="text-sm text-red-600 mt-2">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Transfer'}
        </Button>
      </div>
    </form>
  );
};
```

## Komponen Manajemen Inventori

### Komponen Tabel Inventori
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Edit, Eye, AlertTriangle } from 'lucide-react';

interface InventoryTableProps {
  inventory: InventoryItem[];
  locationType: 'warehouse' | 'shop';
  locationId: number;
  onUpdateStock: (productId: number, newQuantity: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  locationType,
  locationId,
  onUpdateStock
}) => {
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const filterAndSortInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.product.category_id === parseInt(categoryFilter));
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.isLowStock);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.isOutOfStock);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.product.name;
          bValue = b.product.name;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'value':
          aValue = a.quantity * a.unitCost;
          bValue = b.quantity * b.unitCost;
          break;
        default:
          aValue = a.product.name;
          bValue = b.product.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInventory(filtered);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.isOutOfStock) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (item.isLowStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const getStockIcon = (item: InventoryItem) => {
    if (item.isOutOfStock || item.isLowStock) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className="inventory-table">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="1">Coffee</SelectItem>
                  <SelectItem value="2">Pastries</SelectItem>
                  <SelectItem value="3">Merchandise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {getStockIcon(item)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">{item.product.category?.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.product.sku || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.availableQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStockStatus(item)}
                  </TableCell>
                  <TableCell>
                    ${item.unitCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(item.quantity * item.unitCost).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

## Manajemen State

### Store Inventori (Zustand)
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface InventoryState {
  // Warehouse inventory
  warehouseInventory: WarehouseInventoryItem[];
  shopInventory: ShopInventoryItem[];
  
  // Stock transfers
  transfers: StockTransfer[];
  currentTransfer: StockTransfer | null;
  
  // Stock alerts
  alerts: StockAlert[];
  
  // Loading states
  loading: {
    inventory: boolean;
    transfers: boolean;
    alerts: boolean;
  };
  
  // Actions
  fetchWarehouseInventory: (warehouseId: number) => Promise<void>;
  fetchShopInventory: (shopId: number) => Promise<void>;
  fetchTransfers: (filters?: TransferFilters) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  createTransfer: (transferData: CreateTransferData) => Promise<void>;
  updateTransfer: (transferId: number, data: UpdateTransferData) => Promise<void>;
  approveTransfer: (transferId: number) => Promise<void>;
  shipTransfer: (transferId: number) => Promise<void>;
  deliverTransfer: (transferId: number) => Promise<void>;
  updateInventory: (locationType: 'warehouse' | 'shop', locationId: number, productId: number, quantity: number) => Promise<void>;
  resolveAlert: (alertId: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      warehouseInventory: [],
      shopInventory: [],
      transfers: [],
      currentTransfer: null,
      alerts: [],
      loading: {
        inventory: false,
        transfers: false,
        alerts: false
      },

      // Fetch warehouse inventory
      fetchWarehouseInventory: async (warehouseId: number) => {
        set({ loading: { ...get().loading, inventory: true } });
        try {
          const response = await api.get(`/warehouses/${warehouseId}/inventory`);
          set({ warehouseInventory: response.data });
        } catch (error) {
          console.error('Error fetching warehouse inventory:', error);
        } finally {
          set({ loading: { ...get().loading, inventory: false } });
        }
      },

      // Fetch shop inventory
      fetchShopInventory: async (shopId: number) => {
        set({ loading: { ...get().loading, inventory: true } });
        try {
          const response = await api.get(`/shops/${shopId}/inventory`);
          set({ shopInventory: response.data });
        } catch (error) {
          console.error('Error fetching shop inventory:', error);
        } finally {
          set({ loading: { ...get().loading, inventory: false } });
        }
      },

      // Fetch transfers
      fetchTransfers: async (filters?: TransferFilters) => {
        set({ loading: { ...get().loading, transfers: true } });
        try {
          const response = await api.get('/stock-transfers', { params: filters });
          set({ transfers: response.data });
        } catch (error) {
          console.error('Error fetching transfers:', error);
        } finally {
          set({ loading: { ...get().loading, transfers: false } });
        }
      },

      // Fetch alerts
      fetchAlerts: async () => {
        set({ loading: { ...get().loading, alerts: true } });
        try {
          const response = await api.get('/stock-alerts/unresolved');
          set({ alerts: response.data });
        } catch (error) {
          console.error('Error fetching alerts:', error);
        } finally {
          set({ loading: { ...get().loading, alerts: false } });
        }
      },

      // Create transfer
      createTransfer: async (transferData: CreateTransferData) => {
        try {
          const response = await api.post('/stock-transfers', transferData);
          set({ transfers: [...get().transfers, response.data] });
        } catch (error) {
          console.error('Error creating transfer:', error);
          throw error;
        }
      },

      // Update transfer
      updateTransfer: async (transferId: number, data: UpdateTransferData) => {
        try {
          const response = await api.put(`/stock-transfers/${transferId}`, data);
          set({
            transfers: get().transfers.map(transfer =>
              transfer.id === transferId ? response.data : transfer
            )
          });
        } catch (error) {
          console.error('Error updating transfer:', error);
          throw error;
        }
      },

      // Approve transfer
      approveTransfer: async (transferId: number) => {
        try {
          const response = await api.put(`/stock-transfers/${transferId}/approve`);
          set({
            transfers: get().transfers.map(transfer =>
              transfer.id === transferId ? response.data : transfer
            )
          });
        } catch (error) {
          console.error('Error approving transfer:', error);
          throw error;
        }
      },

      // Ship transfer
      shipTransfer: async (transferId: number) => {
        try {
          const response = await api.put(`/stock-transfers/${transferId}/ship`);
          set({
            transfers: get().transfers.map(transfer =>
              transfer.id === transferId ? response.data : transfer
            )
          });
        } catch (error) {
          console.error('Error shipping transfer:', error);
          throw error;
        }
      },

      // Deliver transfer
      deliverTransfer: async (transferId: number) => {
        try {
          const response = await api.put(`/stock-transfers/${transferId}/deliver`);
          set({
            transfers: get().transfers.map(transfer =>
              transfer.id === transferId ? response.data : transfer
            )
          });
        } catch (error) {
          console.error('Error delivering transfer:', error);
          throw error;
        }
      },

      // Update inventory
      updateInventory: async (locationType: 'warehouse' | 'shop', locationId: number, productId: number, quantity: number) => {
        try {
          await api.put(`/${locationType}s/${locationId}/inventory/${productId}`, { quantity });
          
          // Update local state
          if (locationType === 'warehouse') {
            set({
              warehouseInventory: get().warehouseInventory.map(item =>
                item.product_id === productId ? { ...item, quantity } : item
              )
            });
          } else {
            set({
              shopInventory: get().shopInventory.map(item =>
                item.product_id === productId ? { ...item, quantity } : item
              )
            });
          }
        } catch (error) {
          console.error('Error updating inventory:', error);
          throw error;
        }
      },

      // Resolve alert
      resolveAlert: async (alertId: number) => {
        try {
          await api.put(`/stock-alerts/${alertId}/resolve`);
          set({
            alerts: get().alerts.filter(alert => alert.id !== alertId)
          });
        } catch (error) {
          console.error('Error resolving alert:', error);
          throw error;
        }
      }
    }),
    { name: 'inventory-store' }
  )
);
```

## Integrasi API

### Layanan API Inventori
```typescript
import { api } from '@/services/api';

export class InventoryApiService {
  // Gudang endpoints
  static async getGudang(): Promise<Gudang[]> {
    const response = await api.get('/gudang');
    return response.data;
  }

  static async getGudang(gudangId: number): Promise<Gudang> {
    const response = await api.get(`/gudang/${gudangId}`);
    return response.data;
  }

  static async getInventoriGudang(gudangId: number): Promise<InventoriGudangItem[]> {
    const response = await api.get(`/gudang/${gudangId}/inventory`);
    return response.data;
  }

  // Toko endpoints
  static async getToko(): Promise<Toko[]> {
    const response = await api.get('/toko');
    return response.data;
  }

  static async getToko(tokoId: number): Promise<Toko> {
    const response = await api.get(`/toko/${tokoId}`);
    return response.data;
  }

  static async getInventoriToko(tokoId: number): Promise<InventoriTokoItem[]> {
    const response = await api.get(`/toko/${tokoId}/inventory`);
    return response.data;
  }

  // Transfer stok endpoints
  static async getTransfer(filters?: TransferFilters): Promise<TransferStok[]> {
    const response = await api.get('/transfer-stok', { params: filters });
    return response.data;
  }

  static async getTransfer(transferId: number): Promise<TransferStok> {
    const response = await api.get(`/transfer-stok/${transferId}`);
    return response.data;
  }

  static async createTransfer(transferData: CreateTransferData): Promise<TransferStok> {
    const response = await api.post('/transfer-stok', transferData);
    return response.data;
  }

  static async updateTransfer(transferId: number, data: UpdateTransferData): Promise<TransferStok> {
    const response = await api.put(`/transfer-stok/${transferId}`, data);
    return response.data;
  }

  static async approveTransfer(transferId: number): Promise<TransferStok> {
    const response = await api.put(`/transfer-stok/${transferId}/approve`);
    return response.data;
  }

  static async shipTransfer(transferId: number): Promise<TransferStok> {
    const response = await api.put(`/transfer-stok/${transferId}/ship`);
    return response.data;
  }

  static async deliverTransfer(transferId: number): Promise<TransferStok> {
    const response = await api.put(`/transfer-stok/${transferId}/deliver`);
    return response.data;
  }

  // Pergerakan stok endpoints
  static async getPergerakanStok(filters?: PergerakanStokFilters): Promise<PergerakanStok[]> {
    const response = await api.get('/pergerakan-stok', { params: filters });
    return response.data;
  }

  static async createPenyesuaianStok(adjustmentData: PenyesuaianStokData): Promise<PergerakanStok> {
    const response = await api.post('/pergerakan-stok/adjustment', adjustmentData);
    return response.data;
  }

  // Alert stok endpoints
  static async getAlert(filters?: AlertFilters): Promise<AlertStok[]> {
    const response = await api.get('/alert-stok', { params: filters });
    return response.data;
  }

  static async getUnresolvedAlert(): Promise<AlertStok[]> {
    const response = await api.get('/alert-stok/unresolved');
    return response.data;
  }

  static async resolveAlert(alertId: number): Promise<void> {
    await api.put(`/alert-stok/${alertId}/resolve`);
  }
}
```

## Strategi Testing

### Test Komponen
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryDashboard } from './InventoryDashboard';
import { useInventoryStore } from '@/stores/inventoryStore';

// Mock the store
jest.mock('@/stores/inventoryStore');

describe('InventoryDashboard', () => {
  beforeEach(() => {
    useInventoryStore.mockReturnValue({
      warehouseInventory: mockInventory,
      alerts: mockAlerts,
      loading: { inventory: false, transfers: false, alerts: false },
      fetchWarehouseInventory: jest.fn(),
      fetchAlerts: jest.fn()
    });
  });

  it('renders inventory dashboard correctly', () => {
    render(<InventoryDashboard locationType="warehouse" locationId={1} userRole="admin" />);
    
    expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create Transfer')).toBeInTheDocument();
  });

  it('displays inventory summary cards', () => {
    render(<InventoryDashboard locationType="warehouse" locationId={1} userRole="admin" />);
    
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
  });

  it('handles create transfer button click', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));

    render(<InventoryDashboard locationType="warehouse" locationId={1} userRole="admin" />);
    
    fireEvent.click(screen.getByText('Create Transfer'));
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/transfers/create');
  });
});
```

### Test Integrasi
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import { rest } from 'msw';
import { InventoryDashboard } from './InventoryDashboard';

describe('InventoryDashboard Integration', () => {
  it('fetches and displays inventory data', async () => {
    server.use(
      rest.get('/api/warehouses/1/inventory', (req, res, ctx) => {
        return res(ctx.json(mockInventoryData));
      }),
      rest.get('/api/stock-alerts/unresolved', (req, res, ctx) => {
        return res(ctx.json(mockAlertsData));
      })
    );

    render(<InventoryDashboard locationType="warehouse" locationId={1} userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Premium Coffee')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/warehouses/1/inventory', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(<InventoryDashboard locationType="warehouse" locationId={1} userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading inventory')).toBeInTheDocument();
    });
  });
});
```

This comprehensive inventory management frontend documentation provides all the necessary components, state management, and testing strategies for implementing a complete inventory management system in the Tomoya Coffee Shop application.
