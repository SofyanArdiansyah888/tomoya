# Test
# API Documentation - Sistem Manajemen Inventori
 
## Base URL
```
http://localhost:8081/api
```

## Authentication
Semua endpoint kecuali register dan login memerlukan token authentication.

### Register
```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

### Login
```http
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

## Endpoints

### 1. Kategori

#### Get All Categories
```http
GET /api/kategori
Authorization: Bearer {token}
```

#### Create Category
```http
POST /api/kategori
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Elektronik",
    "slug": "elektronik",
    "deskripsi": "Produk elektronik dan gadget",
    "gambar": "https://example.com/image.jpg",
    "is_active": true
}
```

#### Get Category by ID
```http
GET /api/kategori/{id}
Authorization: Bearer {token}
```

#### Update Category
```http
PUT /api/kategori/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Elektronik Updated",
    "deskripsi": "Updated description"
}
```

#### Delete Category
```http
DELETE /api/kategori/{id}
Authorization: Bearer {token}
```

### 2. Produk

#### Get All Products
```http
GET /api/produk
Authorization: Bearer {token}
```

#### Create Product
```http
POST /api/produk
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Smartphone Samsung Galaxy A54",
    "slug": "smartphone-samsung-galaxy-a54",
    "deskripsi": "Smartphone Android dengan kamera 50MP",
    "harga": 4500000,
    "kategori_id": 1,
    "stok_quantity": 50,
    "is_active": true
}
```

#### Get Product by ID
```http
GET /api/produk/{id}
Authorization: Bearer {token}
```

#### Update Product
```http
PUT /api/produk/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Smartphone Samsung Galaxy A54 Updated",
    "harga": 4200000
}
```

#### Delete Product
```http
DELETE /api/produk/{id}
Authorization: Bearer {token}
```

### 3. Keranjang

#### Get Cart
```http
GET /api/keranjang
Authorization: Bearer {token}
```

#### Add Item to Cart
```http
POST /api/keranjang
Authorization: Bearer {token}
Content-Type: application/json

{
    "produk_id": 1,
    "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/keranjang/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "quantity": 3
}
```

#### Remove Cart Item
```http
DELETE /api/keranjang/{id}
Authorization: Bearer {token}
```

### 4. Pesanan

#### Get All Orders
```http
GET /api/pesanan
Authorization: Bearer {token}
```

#### Create Order
```http
POST /api/pesanan
Authorization: Bearer {token}
Content-Type: application/json

{
    "alamat_pengiriman": "Jl. Sudirman No. 123, Jakarta",
    "catatan": "Tolong dikirim dengan hati-hati"
}
```

#### Get Order by ID
```http
GET /api/pesanan/{id}
Authorization: Bearer {token}
```

#### Update Order Status
```http
PUT /api/pesanan/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": "confirmed"
}
```

#### Delete Order
```http
DELETE /api/pesanan/{id}
Authorization: Bearer {token}
```

### 5. Gudang

#### Get All Warehouses
```http
GET /api/gudang
Authorization: Bearer {token}
```

#### Create Warehouse
```http
POST /api/gudang
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Gudang Utama Jakarta",
    "kode": "GUD001",
    "alamat": "Jl. Raya Jakarta No. 123, Jakarta Selatan",
    "is_active": true
}
```

#### Get Warehouse by ID
```http
GET /api/gudang/{id}
Authorization: Bearer {token}
```

#### Update Warehouse
```http
PUT /api/gudang/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Gudang Utama Jakarta Updated",
    "alamat": "Jl. Raya Jakarta No. 456, Jakarta Selatan"
}
```

#### Delete Warehouse
```http
DELETE /api/gudang/{id}
Authorization: Bearer {token}
```

### 6. Toko

#### Get All Shops
```http
GET /api/toko
Authorization: Bearer {token}
```

#### Create Shop
```http
POST /api/toko
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Toko Utama Jakarta",
    "kode": "TOK001",
    "alamat": "Jl. Sudirman No. 456, Jakarta Pusat",
    "gudang_id": 1,
    "is_active": true
}
```

#### Get Shop by ID
```http
GET /api/toko/{id}
Authorization: Bearer {token}
```

#### Update Shop
```http
PUT /api/toko/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "nama": "Toko Utama Jakarta Updated",
    "alamat": "Jl. Sudirman No. 789, Jakarta Pusat"
}
```

#### Delete Shop
```http
DELETE /api/toko/{id}
Authorization: Bearer {token}
```

### 7. Inventori Gudang

#### Get All Warehouse Inventory
```http
GET /api/inventori-gudang
Authorization: Bearer {token}
```

#### Create Warehouse Inventory
```http
POST /api/inventori-gudang
Authorization: Bearer {token}
Content-Type: application/json

{
    "gudang_id": 1,
    "produk_id": 1,
    "quantity": 50,
    "min_stock_level": 10,
    "max_stock_level": 100,
    "reorder_point": 15
}
```

#### Get Low Stock Products
```http
GET /api/inventori-gudang/low-stock
Authorization: Bearer {token}
```

### 8. Inventori Toko

#### Get All Shop Inventory
```http
GET /api/inventori-toko
Authorization: Bearer {token}
```

#### Create Shop Inventory
```http
POST /api/inventori-toko
Authorization: Bearer {token}
Content-Type: application/json

{
    "toko_id": 1,
    "produk_id": 1,
    "quantity": 10,
    "min_stock_level": 5,
    "max_stock_level": 20,
    "reorder_point": 8
}
```

#### Get Low Stock Products
```http
GET /api/inventori-toko/low-stock
Authorization: Bearer {token}
```

### 9. Transfer Stok

#### Get All Stock Transfers
```http
GET /api/transfer-stok
Authorization: Bearer {token}
```

#### Create Stock Transfer
```http
POST /api/transfer-stok
Authorization: Bearer {token}
Content-Type: application/json

{
    "gudang_asal_id": 1,
    "toko_tujuan_id": 1,
    "catatan": "Transfer stok untuk restock toko",
    "items": [
        {
            "produk_id": 1,
            "quantity": 10
        },
        {
            "produk_id": 2,
            "quantity": 5
        }
    ]
}
```

#### Approve Transfer
```http
POST /api/transfer-stok/{id}/approve
Authorization: Bearer {token}
```

#### Ship Transfer
```http
POST /api/transfer-stok/{id}/ship
Authorization: Bearer {token}
```

#### Deliver Transfer
```http
POST /api/transfer-stok/{id}/deliver
Authorization: Bearer {token}
```

### 10. Pergerakan Stok

#### Get All Stock Movements
```http
GET /api/pergerakan-stok
Authorization: Bearer {token}
```

#### Get Movement History
```http
GET /api/pergerakan-stok/history?produk_id=1&tanggal_dari=2024-01-01&tanggal_sampai=2024-12-31
Authorization: Bearer {token}
```

### 11. Alert Stok

#### Get All Stock Alerts
```http
GET /api/alert-stok
Authorization: Bearer {token}
```

#### Get Unread Alerts
```http
GET /api/alert-stok/unread
Authorization: Bearer {token}
```

#### Mark Alert as Read
```http
POST /api/alert-stok/{id}/mark-as-read
Authorization: Bearer {token}
```

### 12. Dashboard

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

## Response Format

Semua response menggunakan format JSON dengan struktur:

```json
{
    "id": 1,
    "data": {
        // Data object
    },
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Error Handling

Error response format:

```json
{
    "message": "Error message",
    "errors": {
        "field_name": ["Validation error message"]
    }
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
