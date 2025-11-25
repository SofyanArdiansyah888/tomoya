# Backend Structure - Tomoya Coffee Shop

## Technology Stack
- **Framework**: Laravel 10+
- **Authentication**: Laravel Sanctum
- **Database**: MySQL/PostgreSQL
- **API**: RESTful API with JSON responses
- **File Storage**: Local/S3 for product images
- **Validation**: Laravel Form Requests
- **Testing**: PHPUnit

## Project Structure

```
backend/
├── app/
│   ├── Modules/
│   │   ├── Autentikasi/
│   │   │   ├── AutentikasiController.php
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   ├── Produk/
│   │   │   ├── ProdukController.php
│   │   │   └── ProdukRequest.php
│   │   ├── Kategori/
│   │   │   ├── KategoriController.php
│   │   │   └── KategoriRequest.php
│   │   ├── Keranjang/
│   │   │   ├── KeranjangController.php
│   │   │   └── KeranjangRequest.php
│   │   ├── Pesanan/
│   │   │   ├── PesananController.php
│   │   │   └── PesananRequest.php
│   │   ├── Pengguna/
│   │   │   ├── PenggunaController.php
│   │   │   └── PenggunaRequest.php
│   │   ├── Gudang/
│   │   │   ├── GudangController.php
│   │   │   └── GudangRequest.php
│   │   ├── Toko/
│   │   │   ├── TokoController.php
│   │   │   └── TokoRequest.php
│   │   ├── Inventori/
│   │   │   ├── InventoriGudangController.php
│   │   │   ├── InventoriTokoController.php
│   │   │   ├── TransferStokController.php
│   │   │   ├── PergerakanStokController.php
│   │   │   ├── AlertStokController.php
│   │   │   ├── InventoriRequest.php
│   │   │   └── TransferStokRequest.php
│   │   └── ArusKas/
│   │       ├── ArusKasController.php
│   │       └── ArusKasRequest.php
│   ├── Http/
│   │   ├── Middleware/
│   │   │   ├── ApiAuth.php
│   │   │   └── Cors.php
│   │   └── Resources/
│   │       └── ApiResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Produk.php
│   │   ├── Kategori.php
│   │   ├── Keranjang.php
│   │   ├── ItemKeranjang.php
│   │   ├── Pesanan.php
│   │   ├── ItemPesanan.php
│   │   ├── GambarProduk.php
│   │   ├── Gudang.php
│   │   ├── Toko.php
│   │   ├── InventoriGudang.php
│   │   ├── InventoriToko.php
│   │   ├── TransferStok.php
│   │   ├── ItemTransferStok.php
│   │   ├── PergerakanStok.php
│   │   └── AlertStok.php
│   ├── Traits/
│   │   ├── HasApiTokens.php
│   │   └── HasImages.php
│   ├── Exceptions/
│   │   ├── ApiException.php
│   │   ├── ProductNotFoundException.php
│   │   ├── InsufficientStockException.php
│   │   ├── WarehouseNotFoundException.php
│   │   ├── ShopNotFoundException.php
│   │   ├── StockTransferException.php
│   │   └── InventoryException.php
│   └── Console/
│       └── Commands/
│           ├── SeedProduk.php
│           └── BersihkanKeranjangKadaluarsa.php
├── config/
│   ├── sanctum.php
│   ├── cors.php
│   └── filesystems.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_buat_tabel_kategori.php
│   │   ├── 2024_01_01_000003_buat_tabel_produk.php
│   │   ├── 2024_01_01_000004_buat_tabel_gambar_produk.php
│   │   ├── 2024_01_01_000005_buat_tabel_keranjang.php
│   │   ├── 2024_01_01_000006_buat_tabel_item_keranjang.php
│   │   ├── 2024_01_01_000007_buat_tabel_pesanan.php
│   │   └── 2024_01_01_000008_buat_tabel_item_pesanan.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── UserSeeder.php
│   │   ├── KategoriSeeder.php
│   │   ├── ProdukSeeder.php
│   │   └── AdminSeeder.php
│   └── factories/
│       ├── UserFactory.php
│       ├── ProdukFactory.php
│       ├── KategoriFactory.php
│       └── PesananFactory.php
├── routes/
│   ├── api.php
│   └── web.php
├── storage/
│   ├── app/
│   │   └── public/
│   │       └── products/
│   └── logs/
├── .env
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── composer.lock
├── package.json
├── phpunit.xml
├── server.php
└── README.md
```

## Key Directories Explanation

### `/app/Modules`
Modular structure similar to NestJS, where each module contains:
- **Controllers**: Handle HTTP requests and business logic
- **Requests**: Form validation for that specific module
- **Self-contained**: Each module is independent and focused

#### Struktur Modul:
- **Autentikasi/**: Autentikasi dan registrasi pengguna
- **Produk/**: Manajemen produk (modul independen)
- **Kategori/**: Manajemen kategori (modul independen)
- **Keranjang/**: Fungsionalitas keranjang belanja
- **Pesanan/**: Pemrosesan dan manajemen pesanan
- **Pengguna/**: Manajemen profil pengguna
- **Gudang/**: Manajemen gudang
- **Toko/**: Manajemen toko
- **Inventori/**: Manajemen stok, transfer, dan alert

### `/app/Http/Middleware`
- **ApiAuth**: Sanctum authentication middleware
- **Cors**: Cross-origin resource sharing

### `/app/Http/Resources`
- **ApiResource.php**: Generic API resource transformer
- Handles all model data formatting
- Consistent JSON responses across all endpoints
- Configurable field filtering and transformation

### `/app/Models`
- Eloquent models with relationships
- Business logic methods
- Model events and observers
- Scopes and accessors
- Database query methods
- Data validation rules

## Database Schema

### Core Tables

#### Tabel Users
```sql
- id (primary key)
- name
- email (unique)
- email_verified_at
- password
- role (customer, admin)
- phone
- address
- created_at
- updated_at
```

#### Tabel Kategori
```sql
- id (primary key)
- nama
- slug (unique)
- deskripsi
- gambar
- is_active
- created_at
- updated_at
```

#### Tabel Produk
```sql
- id (primary key)
- nama
- slug (unique)
- deskripsi
- harga
- kategori_id (foreign key)
- stok_quantity
- is_active
- created_at
- updated_at
```

#### Tabel Gambar Produk
```sql
- id (primary key)
- produk_id (foreign key)
- path_gambar
- is_primary
- created_at
- updated_at
```

#### Tabel Keranjang
```sql
- id (primary key)
- user_id (foreign key)
- created_at
- updated_at
```

#### Tabel Item Keranjang
```sql
- id (primary key)
- keranjang_id (foreign key)
- produk_id (foreign key)
- quantity
- created_at
- updated_at
```

#### Tabel Pesanan
```sql
- id (primary key)
- user_id (foreign key)
- total_jumlah
- status (pending, confirmed, shipped, delivered, cancelled)
- alamat_pengiriman
- catatan
- created_at
- updated_at
```

#### Tabel Item Pesanan
```sql
- id (primary key)
- pesanan_id (foreign key)
- produk_id (foreign key)
- quantity
- harga
- created_at
- updated_at
```

## API Routes Structure

### Authentication Routes
```
POST /api/register - User registration
POST /api/login - User login
POST /api/logout - User logout
GET /api/user - Get current user
```

### Product Routes
```
GET /api/products - List products
GET /api/products/{id} - Get product details
GET /api/categories - List categories
```

### Cart Routes
```
GET /api/cart - Get user cart
POST /api/cart/add - Add item to cart
PUT /api/cart/update - Update cart item
DELETE /api/cart/remove - Remove cart item
```

### Order Routes
```
POST /api/orders - Create order
GET /api/orders - Get user orders
GET /api/orders/{id} - Get order details
```

### Management Routes
```
GET /api/products - Product list
POST /api/products - Create product
PUT /api/products/{id} - Update product
DELETE /api/products/{id} - Delete product
GET /api/orders - Order list
PUT /api/orders/{id} - Update order status
GET /api/warehouses - Warehouse list
POST /api/warehouses - Create warehouse
PUT /api/warehouses/{id} - Update warehouse
GET /api/shops - Shop list
POST /api/shops - Create shop
PUT /api/shops/{id} - Update shop
```

## Modular Architecture (NestJS-style)

### Contoh Struktur Modul
```
app/Modules/Produk/
├── ProdukController.php       # Operasi CRUD produk
└── ProdukRequest.php          # Validasi produk (buat/update)

app/Modules/Kategori/
├── KategoriController.php     # Operasi CRUD kategori
└── KategoriRequest.php        # Validasi kategori (buat/update)
```

### Benefits of Modular Structure
- **Self-contained**: Each module contains all related functionality
- **Easy Navigation**: Related files are grouped together
- **Scalable**: Easy to add new modules or features
- **Maintainable**: Changes are isolated to specific modules
- **Team-friendly**: Different developers can work on different modules
- **Clear Separation**: Each module has a single responsibility
- **Simplified Requests**: Single request class handles both create and update validation
- **Independent Modules**: Each module stands alone without dependencies on other modules
- **Focused Responsibility**: Each module handles one specific domain/entity

### Tanggung Jawab Modul
- **Modul Autentikasi**: Login, registrasi, reset password
- **Modul Produk**: Manajemen dan operasi produk
- **Modul Kategori**: Manajemen dan operasi kategori
- **Modul Keranjang**: Operasi keranjang belanja
- **Modul Pesanan**: Pemrosesan pesanan dan update status
- **Modul Pengguna**: Manajemen profil pengguna
- **Modul Gudang**: Operasi CRUD gudang
- **Modul Toko**: Manajemen toko
- **Modul Inventori**: Manajemen stok, transfer, pergerakan, alert
- **Modul ArusKas**: Manajemen arus kas, laporan keuangan, statistik cash flow

### Kelas Request Gabungan
Setiap modul menggunakan satu kelas request yang menangani validasi untuk create dan update:

```php
// ProdukRequest.php contoh
class ProdukRequest extends FormRequest
{
    public function rules()
    {
        $rules = [
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategori,id',
        ];

        // Untuk request update, buat beberapa field opsional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['nama'] = 'sometimes|string|max:255';
            $rules['deskripsi'] = 'sometimes|string';
            $rules['harga'] = 'sometimes|numeric|min:0';
        }

        return $rules;
    }
}
```

### Keuntungan Request Gabungan
- **File Lebih Sedikit**: Lebih sedikit kelas request yang perlu dirawat
- **Validasi Konsisten**: Logika validasi yang sama untuk create dan update
- **Aturan Fleksibel**: Dapat menangani aturan validasi berbeda berdasarkan HTTP method
- **Struktur Lebih Bersih**: Lebih sedikit kekacauan di direktori modul

## Generic ApiResource Implementation

### ApiResource.php Structure
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'data' => $this->resource,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Usage in Controllers
```php
// In any controller
return new ApiResource($model);
return ApiResource::collection($models);
```

### Benefits
- Single resource class for all models
- Consistent API response format
- Easy to maintain and update
- Reduces code duplication
- Flexible field filtering

## Laravel Sanctum Configuration

### Installation
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Configuration
- Token-based authentication
- SPA authentication support
- API rate limiting
- CORS configuration

### Usage
- Generate tokens on login
- Attach tokens to API requests
- Token expiration handling
- Logout token revocation

## Security Features

### Authentication & Authorization
- Laravel Sanctum for API authentication
- Password hashing with bcrypt
- Email verification
- Token-based authentication

### Input Validation
- Form request validation
- SQL injection prevention
- XSS protection
- CSRF protection for web routes

### API Security
- Rate limiting
- CORS configuration
- Input sanitization
- Secure file uploads

## Development Guidelines

### Organisasi Kode
- **Struktur Modular**: Setiap modul berisi controller dan request
- **Controller**: Menangani logika bisnis dan akses data dalam modul
- **Model**: Berisi operasi database dan relasi
- **Request**: Validasi form dalam setiap modul
- **Resource**: ApiResource generik untuk semua respons API
- **Eloquent ORM Langsung**: Penggunaan di controller untuk operasi database


### Performance Optimization
- Database query optimization
- Eager loading relationships
- Caching strategies
- API response optimization

### Deployment Considerations
- Environment configuration
- Database migrations
- File storage configuration
- SSL/HTTPS setup
