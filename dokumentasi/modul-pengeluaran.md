# Modul Pengeluaran

Modul pengeluaran telah berhasil ditambahkan ke sistem untuk mencatat pengeluaran non bahan baku.

## Fitur yang Tersedia

### Backend
- **Model Pengeluaran**: Menyimpan data pengeluaran dengan kategori yang sama seperti ArusKas
- **Controller**: API endpoints untuk CRUD operations
- **Validation**: Request validation untuk memastikan data valid
- **Migration**: Tabel `pengeluaran` telah dibuat

### Frontend
- **Halaman Daftar Pengeluaran**: Menampilkan daftar pengeluaran dengan filter dan pencarian
- **Form Pengeluaran**: Form untuk menambah/edit pengeluaran
- **Filter**: Filter berdasarkan kategori, sub kategori, status, tanggal, dll
- **Statistics**: Menampilkan statistik pengeluaran

## Kategori Pengeluaran

### 1. Pengeluaran Operasional
- Gaji Karyawan
- Listrik & Air
- Sewa Tempat
- Pemeliharaan

### 2. Pengeluaran Lainnya
- Investasi
- Pinjaman
- Hibah
- Refund
- Komisi
- Bunga Bank
- Pajak
- Asuransi
- Donasi

### 3. Pembelian Bahan Baku
- Bahan Mentah
- Bahan Kemasan
- Bahan Tambahan

## Status Pengeluaran

- **Draft**: Pengeluaran yang masih dalam tahap draft
- **Pending**: Menunggu persetujuan
- **Approved**: Disetujui
- **Rejected**: Ditolak
- **Paid**: Sudah dibayar
- **Cancelled**: Dibatalkan

## Metode Pembayaran

- Cash
- Transfer
- Kredit
- Debit
- QRIS

## API Endpoints

- `GET /api/pengeluaran` - Daftar pengeluaran
- `POST /api/pengeluaran` - Tambah pengeluaran
- `GET /api/pengeluaran/{id}` - Detail pengeluaran
- `PUT /api/pengeluaran/{id}` - Update pengeluaran
- `DELETE /api/pengeluaran/{id}` - Hapus pengeluaran
- `GET /api/pengeluaran/statistics` - Statistik pengeluaran

## Akses Menu

Menu "Pengeluaran" telah ditambahkan ke sidebar di grup "Pembelian & Keuangan" dengan icon TrendingDown.

## Database Schema

Tabel `pengeluaran` memiliki struktur:
- `id` (Primary Key)
- `user_id` (Foreign Key ke users)
- `toko_id` (Foreign Key ke toko)
- `kategori` (Enum: pengeluaran_operasional, pengeluaran_lainnya, pembelian_bahan_baku)
- `sub_kategori` (String, nullable)
- `nama` (String)
- `deskripsi` (Text, nullable)
- `jumlah` (Decimal 15,2)
- `tanggal` (Date)
- `metode_pembayaran` (Enum: cash, transfer, kredit, debit, qris)
- `status` (Enum: draft, pending, approved, rejected, paid, cancelled)
- `referensi` (String, nullable)
- `bukti_pembayaran` (String, nullable)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)
