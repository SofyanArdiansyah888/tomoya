## Target
- FE menu Arus Kas dan Dashboard hanya menampilkan Arus Kas dengan `status = true`.
- Khusus Kasir: Arus Kas dari pembayaran pesanan diset `status=false` bila metode pembayaran `cash`, dan `status=true` untuk metode lain.

## Backend (Disarankan)
- `ArusKasController@index`: tambahkan filter `status` (boolean). Default: `true` bila parameter tidak dikirim. backend/app/Modules/ArusKas/ArusKasController.php:26-27
- `ArusKasController@stats`: gunakan filter `status = true` secara default agar agregasi hanya pada transaksi aktif. backend/app/Modules/ArusKas/ArusKasController.php:106-109
- `ArusKasResource`: pastikan field `status` dikembalikan. backend/app/Http/Resources/ArusKasResource.php:33
- `PesananController` (create & update, saat pembayaran jadi `bayar`): set `status=false` hanya jika `metode_pembayaran === 'cash'`, selain itu `true`. backend/app/Modules/Pesanan/PesananController.php:265-271, backend/app/Modules/Pesanan/PesananController.php:399-405

## Frontend
- Service: `cashFlowService` frontend/src/services/cashflow.ts:15-16, frontend/src/services/cashflow.ts:33-34
  - Tambahkan dukungan parameter `status` pada `getCashFlowStats()` dan list, default mengirim `status=true`.
- Halaman: `frontend/src/pages/ArusKas/DaftarArusKas.tsx:16-26, 27-30`
  - Query list Arus Kas dan stats menyertakan `status=true`.
  - (Opsional) tambahkan filter toggle “Tampilkan non-aktif” bila diperlukan, default tetap aktif-only.

## Verifikasi
- Daftar Arus Kas di FE hanya memuat item dengan `status=true`.
- Dashboard menampilkan angka berdasarkan transaksi aktif.
- Transaksi Kasir (status=false) hanya terjadi untuk metode `cash`; metode lain tetap aktif.

## File Terdampak
- Backend: `app/Modules/ArusKas/ArusKasController.php`, `app/Http/Resources/ArusKasResource.php`.
- Frontend: `src/services/cashflow.ts`, `src/pages/ArusKas/DaftarArusKas.tsx`, `src/pages/Dashboard/Dashboard.tsx`.

Konfirmasi untuk lanjut implementasi sesuai rencana ini.

## Implementasi
- Migration: tambahkan kolom `status` (boolean, default `true`) pada tabel `arus_kas` dan index opsional.
- Model: tambahkan casts `status: boolean` di `app/Models/ArusKas.php`.
- Resource: expose field `status` di `backend/app/Http/Resources/ArusKasResource.php:33`.
- Controller:
  - `backend/app/Modules/ArusKas/ArusKasController.php:26-27, 106-109` menyaring berdasarkan `status` (default `true`) untuk `index` dan `stats`.
  - `backend/app/Modules/Pesanan/PesananController.php:265-271, 399-405` set `status=false` hanya untuk `metode_pembayaran === 'cash'`, jika bukan cash maka `true`.

## Contoh Endpoint
- List aktif: `GET /arus-kas?status=true`
- Statistik aktif: `GET /arus-kas/stats?status=true`
- List non-aktif (opsional admin): `GET /arus-kas?status=false`

## Integrasi Frontend
- Service: `frontend/src/services/cashflow.ts:15-16, 33-34` mendukung parameter `status`.
- Daftar Arus Kas: `frontend/src/pages/ArusKas/DaftarArusKas.tsx:16-26, 27-30` mengirim `status=true` untuk list dan stats.
- Dashboard: pemanggilan stats melalui service; backend menyaring `status=true` secara default sehingga angka yang tampil adalah transaksi aktif.

## Verifikasi & Uji
- Buat pesanan Kasir (status pembayaran `bayar`) dengan `metode_pembayaran = cash` → cek Arus Kas: `status=false`.
- Buat pesanan Kasir (status pembayaran `bayar`) dengan `metode_pembayaran = qris/card/other` → cek Arus Kas: `status=true`.
- Buka halaman Arus Kas: hanya item `status=true` yang tampil.
- Buka Dashboard: ringkasan hanya menghitung transaksi aktif.

## Catatan
- Jika diperlukan fitur menampilkan transaksi non-aktif di FE, tambahkan toggle filter `status=false` khusus role admin.
