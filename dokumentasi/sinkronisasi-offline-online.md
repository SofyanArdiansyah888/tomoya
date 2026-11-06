# Sinkronisasi Offline (PC Kasir) ↔ Online (Cloud)

Tomoya berjalan di dua tempat dengan aplikasi yang sama:

| Instance | Alamat | Node | Role |
|---|---|---|---|
| PC kasir (offline) | `tomoya.local` (Laragon + MySQL) | `L` | `client` |
| Cloud (online) | `tomoya4management.net` | `C` | `server` |

PC kasir mengirim (push) dan mengambil (pull) perubahan ke/dari cloud **setiap menit**. Koneksi selalu dimulai dari PC kasir, jadi cloud tidak perlu bisa menjangkau PC kasir.

## Cara kerja singkat

- **UUID**: setiap baris punya `uuid` global. `id` auto-increment tetap dipakai lokal; foreign key dikirim sebagai uuid lalu dipetakan ulang.
- **Nomor dokumen per node**: lokal `PSN-20261106-0001`, cloud `PSN-C-20261106-0001` (berlaku juga untuk SHF, AK, MK, PMS, PGL, PBL, MIX, dan kode supplier `SUPC0001`). Tidak pernah bentrok.
- **Stok disinkron sebagai pergerakan**, bukan saldo. Pergerakan dari node lain disisipkan dan saldo lokal disesuaikan dengan delta-nya, jadi penjualan di dua tempat tetap menghasilkan stok yang benar.
- **Kepemilikan data**:
  - Transaksi (pesanan, item, shift, pembelian, pemasukan, pengeluaran, mix preparation) hanya bisa **diubah/dihapus di node tempat dibuat**. Di node lain akan ditolak dengan pesan "Data ini dibuat di …".
  - Master data (produk, harga, kategori, resep, material, supplier, lokasi, user) dan arus kas / master kas bisa diubah di kedua tempat. Jika bentrok, **perubahan terakhir yang menang**; versi yang kalah dicatat di tabel `sync_logs` (level `conflict`).
  - Pergerakan stok hanya ditambah, tidak pernah diubah.
- **Penghapusan** dicatat di `sync_tombstones` dan ikut tersinkron.
- **Shift** dibuka per node: shift cloud tidak memblokir shift di PC kasir dan sebaliknya.
- Baris yang gagal diterapkan **menahan sinkron** tabel tersebut (tidak dilewati) sampai masalahnya diperbaiki, supaya tidak ada data yang hilang. Errornya tampil di badge status dan `sync_logs`.

## Setup awal (sekali saja)

> Data cloud yang sekarang **akan diganti** dengan data PC kasir. Pastikan data PC kasir adalah yang benar, dan backup database cloud dulu.

1. **Deploy kode terbaru** ke PC kasir dan cloud.
2. **Buat token**, misalnya `php -r "echo bin2hex(random_bytes(32));"`, lalu isi `SYNC_TOKEN` yang sama di kedua `.env`.
3. **Cloud `.env`**: tambahkan blok dari `deploy/cloud-backend.env.example` (`SYNC_NODE_CODE=C`, `SYNC_ROLE=server`).
4. **PC kasir `.env`**: tambahkan blok dari `deploy/kasir-backend.env.example` (`SYNC_NODE_CODE=L`, `SYNC_ROLE=client`, `SYNC_REMOTE_URL=https://tomoya4management.net`).
5. **Migrasi PC kasir**: `php artisan migrate` (menambah kolom `uuid`/`origin`/`synced_at` + tabel sync).
6. **Kosongkan & migrasi cloud**: `php artisan migrate:fresh --force` (tanpa `--seed`).
7. **Cek koneksi dari PC kasir**: `php artisan sync:run --ping` → harus "Terhubung ke node C … Selisih jam: 0–2 detik".
8. **Salin semua data PC kasir ke cloud**: `php artisan sync:bootstrap --push`
9. **Aktifkan sinkron otomatis**: edit `deploy/sync-scheduler.bat` (path backend & php), lalu jalankan `deploy/install-sync-task.bat` sebagai Administrator.
10. Pastikan **jam Windows otomatis** (Settings → Time & language → Set time automatically). Sinkron ditolak jika selisih jam > 2 menit.

Setelah itu, pengguna perlu **login ulang di cloud** (token login tidak disinkronkan; akun & password ikut tersinkron).

## Skenario sehari-hari

| Kondisi | Yang dilakukan |
|---|---|
| Internet toko mati | Tetap pakai `tomoya.local`. Badge: "Offline · N data menunggu". Data terkirim otomatis saat online. |
| PC kasir mati sementara | Buka `tomoya4management.net` dari HP/laptop, login, **buka shift baru**, jualan seperti biasa (nomor `PSN-C-…`). Setelah PC menyala, data cloud otomatis masuk ke PC kasir dan stok disesuaikan. |
| PC kasir rusak / ganti PC | Install Laragon + aplikasi, isi `.env` (node L), `php artisan migrate`, lalu `php artisan sync:bootstrap` (menarik semua data dari cloud), lalu pasang scheduler (langkah 9). |
| Ingin cek stok konsisten | `php artisan stock:recalculate` (laporan) atau `--fix` (perbaiki). |

## Perintah

| Perintah | Fungsi |
|---|---|
| `php artisan sync:run` | Push lalu pull sekali (otomatis tiap menit lewat scheduler) |
| `php artisan sync:run --ping` | Cek koneksi & selisih jam |
| `php artisan sync:run --push-only` / `--pull-only` | Hanya satu arah |
| `php artisan sync:bootstrap` | Isi database lokal kosong dari cloud |
| `php artisan sync:bootstrap --push` | Setup awal: isi cloud kosong dari PC kasir |
| `php artisan stock:recalculate [--fix]` | Hitung ulang saldo stok dari riwayat pergerakan |
| `php artisan backup:database` | Backup MySQL (otomatis tiap hari 23:30 di PC kasir) |

## Indikator di aplikasi

- Badge di kanan atas: **Tersinkron · x menit lalu** / **Menyinkronkan** / **Offline · N data menunggu**. Arahkan kursor untuk detail error.
- Di cloud: banner kuning jika PC kasir tidak terhubung lebih dari `SYNC_OFFLINE_ALERT_MINUTES` (default 5 menit).
- Endpoint: `GET /api/sync/status` (butuh login).

## Batasan yang perlu diketahui

- Jika PC kasir rusak mendadak, transaksi sejak sinkron terakhir (maks. ±1 menit) bisa belum terkirim. Backup harian ada di `storage/app/backups`.
- Pengaturan per lokasi di `produk_lokasi` (min/max stok) tidak disinkronkan; saldo stok produknya tetap disinkronkan lewat pergerakan.
- Dua user/produk baru dengan email/kode sama yang dibuat bersamaan di dua tempat sebelum sinkron akan gagal diterapkan (unik) dan menahan sinkron sampai salah satu diubah. Cek `sync_logs`.
- Migration `2025_12_09_000001_add_hpp_to_item_pesanan` di repo dikomentari, padahal kode memakai kolom `item_pesanan.hpp`. Pastikan kolom itu ada di **kedua** database.
