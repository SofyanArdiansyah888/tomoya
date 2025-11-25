# Backend - Sistem Manajemen Inventori

Backend API untuk sistem manajemen inventori yang dibangun dengan Laravel 12+ menggunakan arsitektur modular.

## Fitur Utama

- **Manajemen Produk**: CRUD produk dengan kategori, gambar, dan stok
- **Manajemen Kategori**: Kategori produk dengan slug dan gambar
- **Manajemen Keranjang**: Keranjang belanja untuk pengguna
- **Manajemen Pesanan**: Sistem pesanan dengan status tracking
- **Manajemen Gudang**: Gudang pusat untuk penyimpanan stok
- **Manajemen Toko**: Toko retail yang terhubung dengan gudang
- **Inventori Gudang**: Stok produk di gudang dengan level minimum/maksimum
- **Inventori Toko**: Stok produk di toko dengan level minimum/maksimum
- **Transfer Stok**: Transfer stok dari gudang ke toko
- **Pergerakan Stok**: Tracking pergerakan stok masuk/keluar
- **Alert Stok**: Notifikasi stok rendah atau habis
- **Dashboard**: Statistik dan laporan sistem

## Teknologi yang Digunakan

- **Laravel 12+**: Framework PHP
- **MySQL/SQLite**: Database
- **Laravel Sanctum**: API Authentication
- **Eloquent ORM**: Database ORM
- **PHP 8.1+**: Bahasa pemrograman

## Struktur Project

```
backend/
├── app/
│   ├── Modules/                    # Modul-modul aplikasi
│   │   ├── Autentikasi/           # Modul autentikasi
│   │   ├── Produk/                # Modul produk
│   │   ├── Kategori/              # Modul kategori
│   │   ├── Keranjang/             # Modul keranjang
│   │   ├── Pesanan/               # Modul pesanan
│   │   ├── Pengguna/              # Modul pengguna
│   │   ├── Gudang/                # Modul gudang
│   │   ├── Toko/                  # Modul toko
│   │   └── Inventori/             # Modul inventori
│   ├── Models/                    # Model Eloquent
│   ├── Http/
│   │   ├── Middleware/            # Middleware custom
│   │   └── Resources/             # API Resources
│   ├── Traits/                    # Traits untuk model
│   ├── Exceptions/                # Custom exceptions
│   └── Console/Commands/          # Artisan commands
├── database/
│   ├── migrations/                # Database migrations
│   └── seeders/                   # Database seeders
├── routes/
│   └── api.php                    # API routes
└── config/                        # Konfigurasi aplikasi
```

## Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Setup environment**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Konfigurasi database**
Edit file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventori_db
DB_USERNAME=root
DB_PASSWORD=
```

5. **Jalankan migration**
```bash
php artisan migrate
```

6. **Seed data sample**
```bash
php artisan seed:produk
```

7. **Jalankan server**
```bash
php artisan serve
```

## API Endpoints

### Authentication
- `POST /api/register` - Register pengguna baru
- `POST /api/login` - Login pengguna
- `POST /api/logout` - Logout pengguna
- `GET /api/user` - Get data pengguna

### Kategori
- `GET /api/kategori` - Get semua kategori
- `POST /api/kategori` - Buat kategori baru
- `GET /api/kategori/{id}` - Get kategori by ID
- `PUT /api/kategori/{id}` - Update kategori
- `DELETE /api/kategori/{id}` - Hapus kategori

### Produk
- `GET /api/produk` - Get semua produk
- `POST /api/produk` - Buat produk baru
- `GET /api/produk/{id}` - Get produk by ID
- `PUT /api/produk/{id}` - Update produk
- `DELETE /api/produk/{id}` - Hapus produk

### Keranjang
- `GET /api/keranjang` - Get keranjang pengguna
- `POST /api/keranjang` - Tambah item ke keranjang
- `PUT /api/keranjang/{id}` - Update item keranjang
- `DELETE /api/keranjang/{id}` - Hapus item keranjang

### Pesanan
- `GET /api/pesanan` - Get semua pesanan
- `POST /api/pesanan` - Buat pesanan baru
- `GET /api/pesanan/{id}` - Get pesanan by ID
- `PUT /api/pesanan/{id}` - Update status pesanan
- `DELETE /api/pesanan/{id}` - Hapus pesanan

### Gudang
- `GET /api/gudang` - Get semua gudang
- `POST /api/gudang` - Buat gudang baru
- `GET /api/gudang/{id}` - Get gudang by ID
- `PUT /api/gudang/{id}` - Update gudang
- `DELETE /api/gudang/{id}` - Hapus gudang

### Toko
- `GET /api/toko` - Get semua toko
- `POST /api/toko` - Buat toko baru
- `GET /api/toko/{id}` - Get toko by ID
- `PUT /api/toko/{id}` - Update toko
- `DELETE /api/toko/{id}` - Hapus toko

### Inventori Gudang
- `GET /api/inventori-gudang` - Get inventori gudang
- `POST /api/inventori-gudang` - Buat inventori gudang
- `GET /api/inventori-gudang/{id}` - Get inventori gudang by ID
- `PUT /api/inventori-gudang/{id}` - Update inventori gudang
- `DELETE /api/inventori-gudang/{id}` - Hapus inventori gudang
- `GET /api/inventori-gudang/low-stock` - Get produk stok rendah

### Inventori Toko
- `GET /api/inventori-toko` - Get inventori toko
- `POST /api/inventori-toko` - Buat inventori toko
- `GET /api/inventori-toko/{id}` - Get inventori toko by ID
- `PUT /api/inventori-toko/{id}` - Update inventori toko
- `DELETE /api/inventori-toko/{id}` - Hapus inventori toko
- `GET /api/inventori-toko/low-stock` - Get produk stok rendah

### Transfer Stok
- `GET /api/transfer-stok` - Get semua transfer stok
- `POST /api/transfer-stok` - Buat transfer stok
- `GET /api/transfer-stok/{id}` - Get transfer stok by ID
- `PUT /api/transfer-stok/{id}` - Update transfer stok
- `DELETE /api/transfer-stok/{id}` - Hapus transfer stok
- `POST /api/transfer-stok/{id}/approve` - Approve transfer
- `POST /api/transfer-stok/{id}/ship` - Ship transfer
- `POST /api/transfer-stok/{id}/deliver` - Deliver transfer

### Pergerakan Stok
- `GET /api/pergerakan-stok` - Get semua pergerakan stok
- `POST /api/pergerakan-stok` - Buat pergerakan stok
- `GET /api/pergerakan-stok/{id}` - Get pergerakan stok by ID
- `PUT /api/pergerakan-stok/{id}` - Update pergerakan stok
- `DELETE /api/pergerakan-stok/{id}` - Hapus pergerakan stok
- `GET /api/pergerakan-stok/history` - Get history pergerakan stok

### Alert Stok
- `GET /api/alert-stok` - Get semua alert stok
- `POST /api/alert-stok` - Buat alert stok
- `GET /api/alert-stok/{id}` - Get alert stok by ID
- `PUT /api/alert-stok/{id}` - Update alert stok
- `DELETE /api/alert-stok/{id}` - Hapus alert stok
- `GET /api/alert-stok/unread` - Get alert belum dibaca
- `POST /api/alert-stok/{id}/mark-as-read` - Tandai alert sebagai dibaca

### Dashboard
- `GET /api/dashboard/stats` - Get statistik dashboard

## Artisan Commands

### Seed Data
```bash
php artisan seed:produk
```
Menambahkan data sample produk, kategori, gudang, dan toko.

### Bersihkan Keranjang Kadaluarsa
```bash
php artisan keranjang:bersihkan
```
Membersihkan keranjang yang sudah kadaluarsa (lebih dari 7 hari).

## Testing

Jalankan test dengan:
```bash
php artisan test
```

## Dokumentasi API

Lihat file `API_DOCUMENTATION.md` untuk dokumentasi API yang lengkap.

## Menjalankan dengan Docker

Prasyarat: Docker Desktop sudah terpasang.

1. Build dan jalankan container (dari folder `backend/`):
```bash
docker compose up -d --build
```

2. Pastikan file database SQLite ada di `database/database.sqlite`. Jika belum ada (Windows CMD):
```bat
type nul > database\database.sqlite
```

3. Jalankan migrasi dan seeder:
```bash
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --class=DatabaseSeeder
```

4. Akses API:
- Base URL: http://localhost:8080

5. Log container:
```bash
docker compose logs -f
```

6. Hentikan container:
```bash
docker compose down
```

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.
