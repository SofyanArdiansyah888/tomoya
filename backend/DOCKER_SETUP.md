# Docker Setup untuk Backend Tomoya

## Konfigurasi

Docker setup sudah dikonfigurasi untuk membaca dari file `.env` yang ada di folder `backend/`.

### Cara Kerja

1. **docker-compose.yml** akan membaca variabel dari file `.env`:
   - `DB_DATABASE` - Nama database MySQL
   - `DB_USERNAME` - Username MySQL
   - `DB_PASSWORD` - Password MySQL
   - `DB_PORT` - Port MySQL (default: 3306)
   - `MYSQL_ROOT_PASSWORD` - Root password MySQL (opsional)

2. **entrypoint.sh** akan:
   - Membaca file `.env` yang ada
   - Mengupdate `DB_HOST` menjadi `mysql` (nama service Docker)
   - Memastikan `DB_CONNECTION=mysql` dan `DB_PORT=3306`
   - Menjalankan migration otomatis setelah MySQL ready

### File .env yang Diperlukan

Pastikan file `.env` di folder `backend/` memiliki konfigurasi berikut:

```env
APP_NAME=Tomoya
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=mysql          # Akan diupdate otomatis ke 'mysql' di Docker
DB_PORT=3306
DB_DATABASE=tomoya     # Akan digunakan untuk membuat database MySQL
DB_USERNAME=tomoya     # Akan digunakan untuk membuat user MySQL
DB_PASSWORD=your_password  # Akan digunakan sebagai password MySQL

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

**Catatan:** 
- `DB_HOST` akan otomatis diubah menjadi `mysql` saat container start (ini adalah nama service MySQL di Docker)
- Nilai `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD akan digunakan untuk membuat database dan user MySQL di container

## Cara Menggunakan

### 1. Pastikan file .env sudah ada

File `.env` harus ada di folder `backend/` dengan konfigurasi database yang benar.

### 2. Build dan Start Containers

```bash
cd backend
docker-compose up -d --build
```

### 3. Cek Logs

```bash
# Logs aplikasi
docker-compose logs -f app

# Logs MySQL
docker-compose logs -f mysql
```

### 4. Akses MySQL dari Host

```bash
mysql -h 127.0.0.1 -P 3306 -u tomoya -p tomoya
# Password: sesuai dengan DB_PASSWORD di .env
```

### 5. Stop Containers

```bash
docker-compose down
```

### 6. Stop dan Hapus Data (Fresh Start)

```bash
docker-compose down -v
```

## Environment Variables yang Digunakan

Docker Compose akan membaca dari `.env` file:

| Variable | Default | Keterangan |
|----------|---------|------------|
| `DB_DATABASE` | `tomoya` | Nama database MySQL |
| `DB_USERNAME` | `tomoya` | Username MySQL |
| `DB_PASSWORD` | `tomoya` | Password MySQL |
| `DB_PORT` | `3306` | Port MySQL (exposed ke host) |
| `MYSQL_ROOT_PASSWORD` | `root` | Root password MySQL |
| `APP_URL` | `http://localhost:8080` | URL aplikasi |

## Override Konfigurasi

Jika ingin override konfigurasi tanpa mengubah `.env`, buat file `docker-compose.override.yml`:

```yaml
version: "3.9"

services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: custom_root_password
      MYSQL_PASSWORD: custom_password
    ports:
      - "3307:3306"  # Ubah port jika 3306 sudah digunakan

  app:
    environment:
      APP_DEBUG: "false"
```

## Troubleshooting

### Error: Port 3306 already in use

Ubah port di `docker-compose.yml` atau `.env`:
```yaml
ports:
  - "3307:3306"  # Gunakan port 3307 di host
```

Dan update `DB_PORT` di `.env` jika perlu.

### Error: Cannot connect to MySQL

1. Pastikan MySQL container sudah running:
   ```bash
   docker-compose ps
   ```

2. Cek logs MySQL:
   ```bash
   docker-compose logs mysql
   ```

3. Pastikan healthcheck berhasil:
   ```bash
   docker-compose exec mysql mysqladmin ping -h localhost -u root -proot
   ```

### Migration tidak jalan otomatis

Jalankan manual:
```bash
docker-compose exec app php artisan migrate
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app php artisan migrate:fresh --seed
```

## Catatan Penting

- **Data Persistence**: Data MySQL disimpan di Docker volume `mysql_data`
- **Auto Migration**: Migration akan otomatis dijalankan saat container pertama kali start
- **DB_HOST**: Akan otomatis diubah menjadi `mysql` (service name) saat di Docker
- **File .env**: Tidak akan diubah secara permanen, hanya untuk kebutuhan Docker

