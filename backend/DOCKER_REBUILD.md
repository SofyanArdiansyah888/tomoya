# Cara Rebuild Docker Container Setelah Perbaikan

Error "could not find driver" terjadi karena extension MySQL tidak terinstall dengan benar. Dockerfile sudah diperbaiki untuk menginstall extension MySQL dengan benar.

## Langkah-langkah Rebuild

### 1. Stop dan Hapus Container yang Lama

```bash
cd backend
docker-compose down
```

### 2. Rebuild Image dengan No Cache

```bash
docker-compose build --no-cache app
```

Atau rebuild semua:

```bash
docker-compose build --no-cache
```

### 3. Start Container

```bash
docker-compose up -d
```

### 4. Verifikasi Extension MySQL Terinstall

```bash
docker-compose exec app php -m | grep -i mysql
```

Harus menampilkan:
- `mysqli`
- `pdo_mysql`

### 5. Jalankan Migration dan Seeder

```bash
docker-compose exec app php artisan migrate:fresh --seed
```

## Troubleshooting

### Jika masih error "could not find driver"

1. Cek apakah extension terinstall:
   ```bash
   docker-compose exec app php -m
   ```

2. Cek PHP info:
   ```bash
   docker-compose exec app php -i | grep -i mysql
   ```

3. Rebuild ulang dengan force:
   ```bash
   docker-compose down
   docker-compose build --no-cache --pull
   docker-compose up -d
   ```

### Verifikasi Koneksi Database

```bash
docker-compose exec app php artisan tinker
```

Kemudian di tinker:
```php
DB::connection()->getPdo();
```

Harus return PDO object tanpa error.

