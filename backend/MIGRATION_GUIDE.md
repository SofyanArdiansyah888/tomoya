# Panduan Migrasi ke MySQL

## Persiapan

### 1. Konfigurasi Database

File `config/database.php` sudah diupdate untuk menggunakan MySQL sebagai default connection.

### 2. Setup Environment File

Buat file `.env` di folder `backend/` dengan konfigurasi berikut:

```env
APP_NAME=Tomoya
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tomoya
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database
QUEUE_CONNECTION=database
```

**Catatan:** Ganti nilai `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` sesuai dengan konfigurasi MySQL Anda.

### 3. Generate Application Key

Jalankan perintah berikut untuk generate application key:

```bash
cd backend
php artisan key:generate
```

## Migrasi Fresh ke MySQL

### Langkah 1: Buat Database MySQL

Buat database baru di MySQL:

```sql
CREATE DATABASE tomoya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atau melalui command line:

```bash
mysql -u root -p -e "CREATE DATABASE tomoya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Langkah 2: Hapus Database SQLite (Opsional)

Jika Anda ingin menghapus database SQLite lama:

```bash
# Windows
del backend\database\database.sqlite

# Linux/Mac
rm backend/database/database.sqlite
```

### Langkah 3: Jalankan Fresh Migration

Jalankan perintah berikut untuk melakukan fresh migration:

```bash
cd backend
php artisan migrate:fresh
```

Perintah ini akan:
- Menghapus semua tabel yang ada (jika ada)
- Menjalankan semua migration dari awal
- Membuat semua tabel dengan struktur yang benar

### Langkah 4: Jalankan Seeder (Opsional)

Jika Anda ingin mengisi database dengan data awal:

```bash
php artisan db:seed
```

Atau seed spesifik:

```bash
php artisan db:seed --class=DatabaseSeeder
```

## Verifikasi Migrasi

Setelah migrasi selesai, verifikasi dengan:

```bash
# Cek status migrasi
php artisan migrate:status

# Cek koneksi database
php artisan tinker
# Kemudian jalankan: DB::connection()->getPdo();
```

## Troubleshooting

### Error: SQLSTATE[HY000] [2002] Connection refused

- Pastikan MySQL server sedang berjalan
- Periksa `DB_HOST` dan `DB_PORT` di file `.env`
- Pastikan kredensial database benar

### Error: SQLSTATE[42000] [1049] Unknown database

- Pastikan database sudah dibuat di MySQL
- Periksa nama database di file `.env` sesuai dengan yang dibuat

### Error: PDOException - could not find driver

Install extension MySQL untuk PHP:

```bash
# Ubuntu/Debian
sudo apt-get install php-mysql

# Windows (XAMPP/WAMP)
# Pastikan extension php_pdo_mysql.dll dan php_mysqli.dll diaktifkan di php.ini
```

## Urutan Migrasi

Migrasi sudah dirapikan dan diurutkan dengan benar:

1. **Tabel Dasar:**
   - `users` (dengan password_reset_tokens dan sessions)
   - `cache`, `jobs`, `personal_access_tokens`

2. **Tabel Master:**
   - `kategori`
   - `supplier`
   - `material`
   - `lokasi`

3. **Tabel Produk:**
   - `produk` (dengan foreign key ke kategori)
   - Modifikasi produk (supplier_id, kode, gambar, dll)

4. **Tabel Resep:**
   - `recipes`
   - `recipe_materials`

5. **Tabel Transaksi:**
   - `pesanan`
   - `item_pesanan`
   - `arus_kas`
   - `pembelian`
   - `item_pembelian`
   - `pemasukan`
   - `pengeluaran`

6. **Tabel Shift:**
   - `shift_kasir`
   - Modifikasi tabel untuk menambahkan shift_id

7. **Modifikasi dan Update:**
   - Update enum values
   - Tambah kolom nomor transaksi
   - Update status dan metode pembayaran

## Catatan Penting

- **Backup Data:** Jika Anda memiliki data penting di database lama, pastikan untuk backup terlebih dahulu
- **Foreign Keys:** Semua foreign key constraints sudah diatur dengan benar
- **Enum Values:** Beberapa enum sudah diupdate untuk MySQL compatibility
- **Indexes:** Index sudah ditambahkan pada kolom yang sering digunakan untuk query

## Rollback (Jika Diperlukan)

Jika terjadi masalah dan ingin rollback:

```bash
# Rollback semua migrasi
php artisan migrate:rollback

# Rollback dengan step tertentu
php artisan migrate:rollback --step=5

# Reset dan migrate ulang
php artisan migrate:fresh
```

