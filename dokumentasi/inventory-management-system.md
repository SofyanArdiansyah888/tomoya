# Sistem Manajemen Inventori - Tomoya Coffee Shop

## Daftar Isi
1. [Ringkasan Sistem](#ringkasan-sistem)
2. [Skema Database](#skema-database)
3. [Arsitektur Backend](#arsitektur-backend)
4. [Endpoint API](#endpoint-api)
5. [Sistem Migrasi Stok](#sistem-migrasi-stok)
6. [Komponen Frontend](#komponen-frontend)
7. [Logika Bisnis](#logika-bisnis)
8. [Pelaporan dan Analitik](#pelaporan-dan-analitik)
9. [Titik Integrasi](#titik-integrasi)
10. [Strategi Testing](#strategi-testing)

## Ringkasan Sistem

### Fitur Manajemen Inventori
- **Manajemen Gudang**: Pelacakan inventori gudang pusat
- **Inventori Toko**: Stok lokasi toko kopi individual
- **Migrasi Stok**: Transfer inventori dari gudang ke toko
- **Alert Stok Rendah**: Notifikasi otomatis untuk inventori rendah
- **Pelacakan Pergerakan Stok**: Audit trail lengkap pergerakan stok
- **Dukungan Multi-Lokasi**: Kelola multiple lokasi toko kopi

### Komponen Utama
- **Inventori Gudang**: Manajemen stok pusat
- **Inventori Toko**: Level stok spesifik lokasi
- **Pesanan Transfer**: Migrasi stok antara gudang dan toko
- **Penyesuaian Stok**: Koreksi inventori manual
- **Laporan Stok**: Analitik inventori komprehensif

## Skema Database

### Tabel Inventori Utama

#### Tabel Gudang
```sql
CREATE TABLE gudang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    kode VARCHAR(50) UNIQUE NOT NULL,
    alamat TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

#### Tabel Toko
```sql
CREATE TABLE toko (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    kode VARCHAR(50) UNIQUE NOT NULL,
    alamat TEXT,
    gudang_id BIGINT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (gudang_id) REFERENCES gudang(id)
);
```

#### Tabel Inventori Gudang
```sql
CREATE TABLE inventori_gudang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    gudang_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    max_stock_level INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (gudang_id) REFERENCES gudang(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id),
    UNIQUE KEY unique_gudang_produk (gudang_id, produk_id)
);
```

#### Tabel Inventori Toko
```sql
CREATE TABLE inventori_toko (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    toko_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    max_stock_level INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (toko_id) REFERENCES toko(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id),
    UNIQUE KEY unique_toko_produk (toko_id, produk_id)
);
```

#### Tabel Transfer Stok
```sql
CREATE TABLE transfer_stok (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nomor_transfer VARCHAR(50) UNIQUE NOT NULL,
    from_location_type ENUM('gudang', 'toko') NOT NULL,
    from_location_id BIGINT UNSIGNED NOT NULL,
    to_location_type ENUM('gudang', 'toko') NOT NULL,
    to_location_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    requested_by BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NULL,
    requested_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### Tabel Item Transfer Stok
```sql
CREATE TABLE item_transfer_stok (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    requested_quantity INTEGER NOT NULL,
    approved_quantity INTEGER NULL,
    shipped_quantity INTEGER NULL,
    received_quantity INTEGER NULL,
    unit_cost DECIMAL(10,2) NULL,
    total_cost DECIMAL(10,2) NULL,
    notes TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (transfer_id) REFERENCES transfer_stok(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
```

#### Tabel Pergerakan Stok
```sql
CREATE TABLE pergerakan_stok (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movement_type ENUM('in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'sale', 'return') NOT NULL,
    location_type ENUM('gudang', 'toko') NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_type VARCHAR(50) NULL, -- 'transfer', 'order', 'adjustment'
    reference_id BIGINT UNSIGNED NULL,
    reason VARCHAR(255) NULL,
    notes TEXT,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (produk_id) REFERENCES produk(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabel Alert Stok
```sql
CREATE TABLE alert_stok (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('low_stock', 'out_of_stock', 'overstock', 'expiry_warning') NOT NULL,
    location_type ENUM('gudang', 'toko') NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    current_quantity INTEGER NOT NULL,
    threshold_quantity INTEGER NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (produk_id) REFERENCES produk(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);
```

## Arsitektur Backend

### Model

#### Model Gudang
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Gudang extends Model
{
    protected $fillable = [
        'nama', 'kode', 'alamat', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function inventory(): HasMany
    {
        return $this->hasMany(InventoriGudang::class);
    }

    public function toko(): HasMany
    {
        return $this->hasMany(Toko::class);
    }

    public function transferStok(): HasMany
    {
        return $this->hasMany(TransferStok::class, 'from_location_id')
            ->where('from_location_type', 'gudang');
    }

    public function pergerakanStok(): HasMany
    {
        return $this->hasMany(PergerakanStok::class, 'location_id')
            ->where('location_type', 'gudang');
    }
}
```

#### Model Toko
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Toko extends Model
{
    protected $fillable = [
        'nama', 'kode', 'alamat', 'gudang_id', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(InventoriToko::class);
    }

    public function transferStok(): HasMany
    {
        return $this->hasMany(TransferStok::class, 'from_location_id')
            ->where('from_location_type', 'toko');
    }

    public function pergerakanStok(): HasMany
    {
        return $this->hasMany(PergerakanStok::class, 'location_id')
            ->where('location_type', 'toko');
    }
}
```

#### Model Inventori Gudang
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoriGudang extends Model
{
    protected $fillable = [
        'gudang_id', 'produk_id', 'quantity', 'reserved_quantity',
        'available_quantity', 'min_stock_level', 'max_stock_level',
        'reorder_point', 'last_updated_at'
    ];

    protected $casts = [
        'last_updated_at' => 'datetime',
    ];

    public function gudang(): BelongsTo
    {
        return $this->belongsTo(Gudang::class);
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class);
    }

    public function pergerakanStok(): HasMany
    {
        return $this->hasMany(PergerakanStok::class, 'produk_id', 'produk_id')
            ->where('location_type', 'gudang')
            ->where('location_id', $this->gudang_id);
    }

    public function updateAvailableQuantity(): void
    {
        $this->available_quantity = $this->quantity - $this->reserved_quantity;
        $this->save();
    }

    public function isLowStock(): bool
    {
        return $this->available_quantity <= $this->reorder_point;
    }

    public function isOutOfStock(): bool
    {
        return $this->available_quantity <= 0;
    }
}
```

#### Model Transfer Stok
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransferStok extends Model
{
    protected $fillable = [
        'nomor_transfer', 'from_location_type', 'from_location_id',
        'to_location_type', 'to_location_id', 'status', 'requested_by',
        'approved_by', 'requested_at', 'approved_at', 'shipped_at',
        'delivered_at', 'notes'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function fromLocation(): MorphTo
    {
        return $this->morphTo('from_location');
    }

    public function toLocation(): MorphTo
    {
        return $this->morphTo('to_location');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemTransferStok::class, 'transfer_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function generateTransferNumber(): string
    {
        $prefix = 'TRF';
        $date = now()->format('Ymd');
        $sequence = str_pad(
            self::whereDate('created_at', now()->toDateString())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
        
        return "{$prefix}-{$date}-{$sequence}";
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeShipped(): bool
    {
        return $this->status === 'approved';
    }

    public function canBeDelivered(): bool
    {
        return $this->status === 'in_transit';
    }
}
```

### Layanan

#### Layanan Inventori
```php
<?php

namespace App\Services;

use App\Models\WarehouseInventory;
use App\Models\ShopInventory;
use App\Models\StockMovement;
use App\Models\StockAlert;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function updateWarehouseStock(
        int $warehouseId,
        int $productId,
        int $quantity,
        string $reason = null,
        int $userId = null
    ): WarehouseInventory {
        return DB::transaction(function () use ($warehouseId, $productId, $quantity, $reason, $userId) {
            $inventory = WarehouseInventory::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->firstOrFail();

            $previousQuantity = $inventory->quantity;
            $newQuantity = $previousQuantity + $quantity;

            $inventory->update([
                'quantity' => $newQuantity,
                'available_quantity' => $newQuantity - $inventory->reserved_quantity,
                'last_updated_at' => now(),
            ]);

            $this->createStockMovement(
                'in',
                'warehouse',
                $warehouseId,
                $productId,
                $quantity,
                $previousQuantity,
                $newQuantity,
                $reason,
                $userId
            );

            $this->checkStockAlerts($inventory);

            return $inventory;
        });
    }

    public function updateShopStock(
        int $shopId,
        int $productId,
        int $quantity,
        string $reason = null,
        int $userId = null
    ): ShopInventory {
        return DB::transaction(function () use ($shopId, $productId, $quantity, $reason, $userId) {
            $inventory = ShopInventory::where('shop_id', $shopId)
                ->where('product_id', $productId)
                ->firstOrFail();

            $previousQuantity = $inventory->quantity;
            $newQuantity = $previousQuantity + $quantity;

            $inventory->update([
                'quantity' => $newQuantity,
                'available_quantity' => $newQuantity - $inventory->reserved_quantity,
                'last_updated_at' => now(),
            ]);

            $this->createStockMovement(
                'in',
                'shop',
                $shopId,
                $productId,
                $quantity,
                $previousQuantity,
                $newQuantity,
                $reason,
                $userId
            );

            $this->checkStockAlerts($inventory);

            return $inventory;
        });
    }

    private function createStockMovement(
        string $type,
        string $locationType,
        int $locationId,
        int $productId,
        int $quantity,
        int $previousQuantity,
        int $newQuantity,
        string $reason = null,
        int $userId = null
    ): StockMovement {
        return StockMovement::create([
            'movement_type' => $type,
            'location_type' => $locationType,
            'location_id' => $locationId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'previous_quantity' => $previousQuantity,
            'new_quantity' => $newQuantity,
            'reason' => $reason,
            'created_by' => $userId ?? auth()->id(),
        ]);
    }

    private function checkStockAlerts($inventory): void
    {
        if ($inventory->isOutOfStock()) {
            $this->createStockAlert('out_of_stock', $inventory);
        } elseif ($inventory->isLowStock()) {
            $this->createStockAlert('low_stock', $inventory);
        }
    }

    private function createStockAlert(string $type, $inventory): void
    {
        StockAlert::create([
            'alert_type' => $type,
            'location_type' => $inventory instanceof WarehouseInventory ? 'warehouse' : 'shop',
            'location_id' => $inventory->warehouse_id ?? $inventory->shop_id,
            'product_id' => $inventory->product_id,
            'current_quantity' => $inventory->available_quantity,
            'threshold_quantity' => $inventory->reorder_point,
            'severity' => $type === 'out_of_stock' ? 'critical' : 'high',
        ]);
    }
}
```

#### Layanan Transfer Stok
```php
<?php

namespace App\Services;

use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\WarehouseInventory;
use App\Models\ShopInventory;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;

class StockTransferService
{
    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function createTransfer(array $data): StockTransfer
    {
        return DB::transaction(function () use ($data) {
            $transfer = StockTransfer::create([
                'transfer_number' => $this->generateTransferNumber(),
                'from_location_type' => $data['from_location_type'],
                'from_location_id' => $data['from_location_id'],
                'to_location_type' => $data['to_location_type'],
                'to_location_id' => $data['to_location_id'],
                'requested_by' => auth()->id(),
                'requested_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                StockTransferItem::create([
                    'transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'requested_quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'] ?? null,
                    'total_cost' => ($item['unit_cost'] ?? 0) * $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $transfer;
        });
    }

    public function approveTransfer(int $transferId, int $approvedBy): StockTransfer
    {
        return DB::transaction(function () use ($transferId, $approvedBy) {
            $transfer = StockTransfer::findOrFail($transferId);
            
            if (!$transfer->canBeApproved()) {
                throw new \Exception('Transfer cannot be approved');
            }

            // Check if sufficient stock is available
            foreach ($transfer->items as $item) {
                $this->validateStockAvailability($transfer, $item);
            }

            // Update approved quantities
            foreach ($transfer->items as $item) {
                $item->update(['approved_quantity' => $item->requested_quantity]);
            }

            $transfer->update([
                'status' => 'approved',
                'approved_by' => $approvedBy,
                'approved_at' => now(),
            ]);

            return $transfer;
        });
    }

    public function shipTransfer(int $transferId): StockTransfer
    {
        return DB::transaction(function () use ($transferId) {
            $transfer = StockTransfer::findOrFail($transferId);
            
            if (!$transfer->canBeShipped()) {
                throw new \Exception('Transfer cannot be shipped');
            }

            // Reduce stock from source location
            foreach ($transfer->items as $item) {
                $this->reduceSourceStock($transfer, $item);
                $item->update(['shipped_quantity' => $item->approved_quantity]);
            }

            $transfer->update([
                'status' => 'in_transit',
                'shipped_at' => now(),
            ]);

            return $transfer;
        });
    }

    public function deliverTransfer(int $transferId): StockTransfer
    {
        return DB::transaction(function () use ($transferId) {
            $transfer = StockTransfer::findOrFail($transferId);
            
            if (!$transfer->canBeDelivered()) {
                throw new \Exception('Transfer cannot be delivered');
            }

            // Add stock to destination location
            foreach ($transfer->items as $item) {
                $this->addDestinationStock($transfer, $item);
                $item->update(['received_quantity' => $item->shipped_quantity]);
            }

            $transfer->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            return $transfer;
        });
    }

    private function generateTransferNumber(): string
    {
        $prefix = 'TRF';
        $date = now()->format('Ymd');
        $sequence = str_pad(
            StockTransfer::whereDate('created_at', now()->toDateString())->count() + 1,
            4,
            '0',
            STR_PAD_LEFT
        );
        
        return "{$prefix}-{$date}-{$sequence}";
    }

    private function validateStockAvailability(StockTransfer $transfer, StockTransferItem $item): void
    {
        if ($transfer->from_location_type === 'warehouse') {
            $inventory = WarehouseInventory::where('warehouse_id', $transfer->from_location_id)
                ->where('product_id', $item->product_id)
                ->first();
        } else {
            $inventory = ShopInventory::where('shop_id', $transfer->from_location_id)
                ->where('product_id', $item->product_id)
                ->first();
        }

        if (!$inventory || $inventory->available_quantity < $item->requested_quantity) {
            throw new \Exception("Insufficient stock for product ID: {$item->product_id}");
        }
    }

    private function reduceSourceStock(StockTransfer $transfer, StockTransferItem $item): void
    {
        if ($transfer->from_location_type === 'warehouse') {
            $this->inventoryService->updateWarehouseStock(
                $transfer->from_location_id,
                $item->product_id,
                -$item->approved_quantity,
                "Stock transfer to {$transfer->toLocation->name}",
                auth()->id()
            );
        } else {
            $this->inventoryService->updateShopStock(
                $transfer->from_location_id,
                $item->product_id,
                -$item->approved_quantity,
                "Stock transfer to {$transfer->toLocation->name}",
                auth()->id()
            );
        }
    }

    private function addDestinationStock(StockTransfer $transfer, StockTransferItem $item): void
    {
        if ($transfer->to_location_type === 'warehouse') {
            $this->inventoryService->updateWarehouseStock(
                $transfer->to_location_id,
                $item->product_id,
                $item->shipped_quantity,
                "Stock received from {$transfer->fromLocation->name}",
                auth()->id()
            );
        } else {
            $this->inventoryService->updateShopStock(
                $transfer->to_location_id,
                $item->product_id,
                $item->shipped_quantity,
                "Stock received from {$transfer->fromLocation->name}",
                auth()->id()
            );
        }
    }
}
```

## Endpoint API

### Manajemen Gudang
```php
// Gudang Routes
Route::prefix('gudang')->group(function () {
    Route::get('/', [GudangController::class, 'index']);
    Route::post('/', [GudangController::class, 'store']);
    Route::get('/{id}', [GudangController::class, 'show']);
    Route::put('/{id}', [GudangController::class, 'update']);
    Route::delete('/{id}', [GudangController::class, 'destroy']);
    
    // Inventori Gudang
    Route::get('/{id}/inventory', [InventoriGudangController::class, 'index']);
    Route::post('/{id}/inventory', [InventoriGudangController::class, 'store']);
    Route::put('/{id}/inventory/{produkId}', [InventoriGudangController::class, 'update']);
    Route::delete('/{id}/inventory/{produkId}', [InventoriGudangController::class, 'destroy']);
});
```

### Manajemen Toko
```php
// Toko Routes
Route::prefix('toko')->group(function () {
    Route::get('/', [TokoController::class, 'index']);
    Route::post('/', [TokoController::class, 'store']);
    Route::get('/{id}', [TokoController::class, 'show']);
    Route::put('/{id}', [TokoController::class, 'update']);
    Route::delete('/{id}', [TokoController::class, 'destroy']);
    
    // Inventori Toko
    Route::get('/{id}/inventory', [InventoriTokoController::class, 'index']);
    Route::post('/{id}/inventory', [InventoriTokoController::class, 'store']);
    Route::put('/{id}/inventory/{produkId}', [InventoriTokoController::class, 'update']);
    Route::delete('/{id}/inventory/{produkId}', [InventoriTokoController::class, 'destroy']);
});
```

### Rute Transfer Stok
```php
// Transfer Stok Routes
Route::prefix('transfer-stok')->group(function () {
    Route::get('/', [TransferStokController::class, 'index']);
    Route::post('/', [TransferStokController::class, 'store']);
    Route::get('/{id}', [TransferStokController::class, 'show']);
    Route::put('/{id}/approve', [TransferStokController::class, 'approve']);
    Route::put('/{id}/ship', [TransferStokController::class, 'ship']);
    Route::put('/{id}/deliver', [TransferStokController::class, 'deliver']);
    Route::put('/{id}/cancel', [TransferStokController::class, 'cancel']);
});
```

### Rute Pergerakan Stok
```php
// Pergerakan Stok Routes
Route::prefix('pergerakan-stok')->group(function () {
    Route::get('/', [PergerakanStokController::class, 'index']);
    Route::get('/{id}', [PergerakanStokController::class, 'show']);
    Route::post('/adjustment', [PergerakanStokController::class, 'createAdjustment']);
});
```

### Rute Alert Stok
```php
// Alert Stok Routes
Route::prefix('alert-stok')->group(function () {
    Route::get('/', [AlertStokController::class, 'index']);
    Route::get('/{id}', [AlertStokController::class, 'show']);
    Route::put('/{id}/resolve', [AlertStokController::class, 'resolve']);
    Route::get('/unresolved', [AlertStokController::class, 'unresolved']);
});
```

## Sistem Migrasi Stok

### Alur Kerja Migrasi
1. **Pembuatan Permintaan**: Buat permintaan transfer dari gudang ke toko
2. **Proses Persetujuan**: Manager menyetujui permintaan transfer
3. **Pengiriman**: Item transfer dikirim dari gudang
4. **Penerimaan**: Item diterima di toko
5. **Update Stok**: Level inventori diperbarui otomatis

### Jenis Migrasi
- **Gudang ke Toko**: Pengisian stok reguler
- **Toko ke Toko**: Transfer antar toko
- **Toko ke Gudang**: Pengembalian dan stok berlebih
- **Transfer Darurat**: Kebutuhan stok mendesak

### Fitur Otomatis
- **Alert Stok Rendah**: Notifikasi otomatis saat stok rendah
- **Saran Pemesanan Ulang**: Rekomendasi pemesanan berbasis AI
- **Optimasi Transfer**: Kuantitas dan waktu transfer optimal
- **Pelacakan Biaya**: Lacak biaya transfer dan logistik

## Komponen Frontend

### Dashboard Inventori
```typescript
// Inventory Dashboard Component
interface InventoryDashboardProps {
  locationType: 'warehouse' | 'shop';
  locationId: number;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  locationType,
  locationId
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, [locationType, locationId]);

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/${locationType}s/${locationId}/inventory`);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/stock-alerts/unresolved');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={createTransfer}>Create Transfer</button>
          <button onClick={createAdjustment}>Stock Adjustment</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="inventory-summary">
          <InventorySummaryCard inventory={inventory} />
        </div>

        <div className="alerts-section">
          <StockAlertsList alerts={alerts} />
        </div>

        <div className="inventory-table">
          <InventoryTable 
            inventory={inventory}
            onUpdateStock={handleUpdateStock}
          />
        </div>
      </div>
    </div>
  );
};
```

### Form Transfer Stok
```typescript
// Stock Transfer Form Component
interface StockTransferFormProps {
  onSubmit: (data: StockTransferData) => void;
  onCancel: () => void;
}

const StockTransferForm: React.FC<StockTransferFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<StockTransferData>({
    from_location_type: 'warehouse',
    from_location_id: 0,
    to_location_type: 'shop',
    to_location_id: 0,
    items: [],
    notes: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: 0,
        quantity: 0,
        unit_cost: 0,
        notes: ''
      }]
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="stock-transfer-form">
      <div className="form-section">
        <h3>Transfer Details</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>From Location</label>
            <select
              value={formData.from_location_id}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                from_location_id: parseInt(e.target.value)
              }))}
            >
              <option value={0}>Select Location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>To Location</label>
            <select
              value={formData.to_location_id}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                to_location_id: parseInt(e.target.value)
              }))}
            >
              <option value={0}>Select Location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            rows={3}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Transfer Items</h3>
          <button type="button" onClick={handleAddItem}>
            Add Item
          </button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="transfer-item">
            <div className="form-group">
              <label>Product</label>
              <select
                value={item.product_id}
                onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value))}
              >
                <option value={0}>Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Unit Cost</label>
              <input
                type="number"
                value={item.unit_cost}
                onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value))}
                step="0.01"
              />
            </div>

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="remove-item-btn"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">
          Create Transfer
        </button>
      </div>
    </form>
  );
};
```

## Logika Bisnis

### Manajemen Level Stok
- **Level Stok Minimum**: Setel titik pemesanan ulang untuk setiap produk
- **Level Stok Maksimum**: Cegah overstocking
- **Stok Pengaman**: Stok buffer untuk permintaan tak terduga
- **Waktu Tunggu**: Pertimbangkan waktu pengiriman supplier

### Proses Persetujuan Transfer
- **Level Otorisasi**: Level persetujuan berbeda untuk jumlah transfer berbeda
- **Kendala Budget**: Periksa budget tersedia untuk transfer
- **Ketersediaan Stok**: Verifikasi stok cukup di lokasi sumber
- **Kapasitas Tujuan**: Pastikan tujuan dapat menerima stok

### Manajemen Biaya
- **Biaya Transfer**: Lacak biaya logistik dan penanganan
- **Penilaian Inventori**: FIFO, LIFO, atau biaya rata-rata tertimbang
- **Biaya Penyimpanan**: Biaya penyimpanan dan asuransi
- **Biaya Peluang**: Biaya modal yang terikat dalam inventori

## Pelaporan dan Analitik

### Laporan Inventori
- **Laporan Level Stok**: Level inventori saat ini berdasarkan lokasi
- **Laporan Pergerakan Stok**: Riwayat pergerakan stok
- **Laporan Transfer**: Riwayat dan status transfer
- **Laporan Alert**: Alert stok dan resolusi

### Dashboard Analitik
- **Perputaran Inventori**: Seberapa cepat inventori terjual
- **Akurasi Stok**: Inventori fisik vs sistem
- **Efisiensi Transfer**: Waktu dan biaya transfer
- **Peramalan Permintaan**: Prediksi kebutuhan stok masa depan

### Indikator Kinerja Utama (KPI)
- **Rasio Perputaran Stok**: Penjualan / Rata-rata Inventori
- **Akurasi Stok**: (Hitung Fisik / Hitung Sistem) × 100
- **Waktu Tunggu Transfer**: Rata-rata waktu dari permintaan ke pengiriman
- **Tingkat Kehabisan Stok**: Persentase waktu kehabisan stok

## Titik Integrasi

### Integrasi ERP
- **Data Master Produk**: Sinkronisasi informasi produk
- **Data Supplier**: Integrasi informasi supplier
- **Data Biaya**: Sinkronisasi biaya dan harga produk
- **Data Keuangan**: Integrasi dengan sistem akuntansi

### Sistem Eksternal
- **Scanner Barcode**: Penghitungan inventori fisik
- **Sistem RFID**: Pelacakan inventori otomatis
- **Penyedia Logistik**: Pelacakan pengiriman dan pengantaran
- **Portal Supplier**: Pemesanan dan penerimaan langsung

### Integrasi API
- **API Inventori**: Update stok real-time
- **API Transfer**: Pemrosesan transfer otomatis
- **API Alert**: Sistem notifikasi
- **API Pelaporan**: Export dan analisis data

## Strategi Testing

### Unit Test
```php
// Inventory Service Tests
class InventoryServiceTest extends TestCase
{
    public function test_update_warehouse_stock()
    {
        $warehouse = Warehouse::factory()->create();
        $product = Product::factory()->create();
        
        $inventory = WarehouseInventory::factory()->create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => 100
        ]);

        $service = new InventoryService();
        $result = $service->updateWarehouseStock(
            $warehouse->id,
            $product->id,
            50,
            'Test update'
        );

        $this->assertEquals(150, $result->quantity);
        $this->assertDatabaseHas('stock_movements', [
            'movement_type' => 'in',
            'quantity' => 50
        ]);
    }
}
```

### Test Integrasi
```php
// Stock Transfer Tests
class StockTransferTest extends TestCase
{
    public function test_complete_transfer_workflow()
    {
        $warehouse = Warehouse::factory()->create();
        $shop = Shop::factory()->create();
        $product = Product::factory()->create();

        // Create initial inventory
        WarehouseInventory::factory()->create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => 100
        ]);

        // Create transfer
        $transfer = StockTransfer::factory()->create([
            'from_location_type' => 'warehouse',
            'from_location_id' => $warehouse->id,
            'to_location_type' => 'shop',
            'to_location_id' => $shop->id,
        ]);

        // Add transfer item
        StockTransferItem::factory()->create([
            'transfer_id' => $transfer->id,
            'product_id' => $product->id,
            'requested_quantity' => 50
        ]);

        // Test approval
        $service = new StockTransferService(new InventoryService());
        $service->approveTransfer($transfer->id, 1);

        $this->assertEquals('approved', $transfer->fresh()->status);
    }
}
```

### Test Performa
- **Test Dataset Besar**: Test dengan ribuan produk dan lokasi
- **Test Transfer Bersamaan**: Multiple transfer simultan
- **Performa Database**: Optimasi query dan indexing
- **Waktu Respons API**: Pastikan waktu respons cepat

This comprehensive inventory management system provides complete stock tracking, transfer management, and reporting capabilities for the Tomoya Coffee Shop application, ensuring efficient inventory management across warehouse and shop locations.
