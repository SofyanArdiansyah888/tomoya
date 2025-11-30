## Ringkasan
- Mengaktifkan tombol Edit di halaman daftar Pesanan hanya untuk pesanan dengan `status = 'belum_bayar'`.
- Menghubungkan tombol Edit dengan `EditOrderModal` yang sudah ada.
- Memastikan backend sudah menolak update untuk pesanan berstatus `bayar` (sudah dibayar).

## Perubahan Frontend
1. Halaman daftar pesanan
- File: `frontend/src/pages/ManajemenPesanan/ManajemenPesanan.tsx`
- Un-comment blok tombol Edit di aksi baris sekitar 435–446, dengan kondisi render: `order.status === 'belum_bayar'`.
- Tambahkan handler `handleEdit(order)` yang:
  - Mengisi state `editOrderId` dan `selectedOrder` (jika sudah ada state serupa) untuk diteruskan ke `EditOrderModal`.
  - Membuka modal edit (`setShowEditModal(true)` atau state sejenis yang sudah dipakai).
- Pastikan tombol Edit tidak muncul untuk `order.status === 'bayar'`. Jika pola aksi menggunakan disabled, sertakan tooltip “Tidak dapat mengedit pesanan yang sudah dibayar”.
- Referensi yang ada saat ini:
  - Aksi Edit yang dikomentari: `frontend/src/pages/ManajemenPesanan/ManajemenPesanan.tsx:435`.
  - Render `EditOrderModal`: `frontend/src/pages/ManajemenPesanan/ManajemenPesanan.tsx:516`.

2. Modal edit pesanan
- File: `frontend/src/pages/ManajemenPesanan/EditOrderModal.tsx`
- Modal sudah memetakan `status` → `paymentStatus` dan mengirim `status: paymentStatus` saat submit.
- Pastikan ketika modal dibuka dari list, data `order` terkirim dengan benar sehingga `setPaymentStatus(order.status || 'belum_bayar')` bekerja (sekitar baris 78–84).
- Tidak ada perubahan perilaku: pengguna tetap dapat mengubah item dan field hanya ketika status belum bayar.

3. Konsistensi tampilan status
- File: `frontend/src/pages/ManajemenPesanan/ManajemenPesanan.tsx`
- Badge status di list sudah menggunakan `order.status` untuk menampilkan “Belum Bayar” vs “Bayar” (sekitar baris 383–393). Biarkan konsisten dengan tombol Edit.

## Validasi Backend
- File: `backend/app/Modules/Pesanan/PesananController.php`
- Method `update` sudah menolak update jika `payment_status !== 'belum_bayar'` dengan HTTP 400 dan pesan “Pesanan yang sudah dibayar tidak dapat diubah...” (`PesananController.php:328`).
- Rute update: `PUT/PATCH /api/pesanan/{id}` melalui `Route::apiResource('pesanan', PesananController::class)` (`backend/routes/api.php:57`).
- Model/Resource:
  - `status` adalah alias dari kolom `payment_status` (`backend/app/Models/Pesanan.php:15`).
  - `PesananResource` memaparkan `status` dan `payment_status` ke frontend (`backend/app/Http/Resources/PesananResource.php:25`).
- Tidak diperlukan perubahan backend; aturan sudah sesuai kebutuhan.

## Pengujian
1. Daftar pesanan
- Muat halaman Manajemen Pesanan. Verifikasi:
  - Pesanan `status = 'belum_bayar'`: tombol Edit tampil/aktif.
  - Pesanan `status = 'bayar'`: tombol Edit tidak tampil atau disabled.

2. Edit pesanan belum bayar
- Klik Edit pada pesanan `belum_bayar`. Modal terbuka, ubah item/field, submit.
- Pastikan request berhasil (HTTP 200) dan data diperbarui di list/detail.

3. Coba edit pesanan yang sudah dibayar
- Paksa buka modal atau kirim request update terhadap pesanan `bayar`.
- Pastikan backend merespon 400 dengan pesan penolakan dan UI menampilkan error yang mudah dipahami.

## Catatan Teknis
- Frontend menggunakan `order.status` sebagai sumber kebenaran untuk kondisi tombol.
- Backend menyimpan di `payment_status` dan mengekspor sebagai `status`, sehingga kedua sisi sudah konsisten.
- Tidak ada perubahan skema atau kontrak API yang diperlukan. Hanya aktivasi tombol dan wiring handler di frontend.