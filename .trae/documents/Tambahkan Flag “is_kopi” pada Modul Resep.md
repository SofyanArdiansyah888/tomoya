## Tujuan
- Tambah flag `is_kopi` (default false) di Resep.
- Di menu Kasir, jika item produk terkait resep kopi (`is_kopi === true`), tampilkan popover pilihan kekuatan kopi (strong/medium/soft/other) dan input gram dengan nilai default sesuai pilihan.

## Perubahan Database
- Migration baru: tambah kolom `is_kopi` (boolean, default false) ke tabel `recipes`.
- Data lama otomatis `is_kopi = false` setelah migrasi.

## Backend (Laravel)
- Model `Recipe` (`backend/app/Models/Recipe.php:12–26`): tambah `is_kopi` di `$fillable` dan cast `'is_kopi' => 'boolean'`.
- Validator `ResepRequest.php` (`backend/app/Modules/Resep/ResepRequest.php:20–45`): tambah rule `'is_kopi' => 'boolean'` + versi `sometimes` untuk update.
- Controller `ResepController.php`:
  - `index()` (`backend/app/Modules/Resep/ResepController.php:20–38`): dukung filter query `is_kopi`.
  - `store()`/`update()`: `validated()` menyertakan `is_kopi`; jika tidak dikirim, default DB false.
- Produk API (`backend/app/Modules/Produk/ProdukController.php:17–52`): sudah memuat relasi `resep` sehingga front-end bisa membaca `produk.resep.is_kopi`.

## Frontend (React + TS)
- Tipe `Recipe` (`frontend/src/types/recipe.ts`): tambah `is_kopi: boolean`.
- Form Resep (`frontend/src/pages/Resep/RecipeForm.tsx`): tambah switch “Resep Kopi” (`is_kopi`), default false, ikut payload.
- Tabel Resep (`frontend/src/pages/Resep/ResepTable.tsx`): tambah kolom “Jenis” menampilkan `Kopi/Non-Kopi`.
- Kasir:
  - State keranjang `localCart` (`frontend/src/pages/Kasir/Kasir.tsx:72–76`): perluasan item dengan field opsional `coffee_strength?: 'strong'|'medium'|'soft'|'other'` dan `coffee_grams?: number`.
  - Komponen `CartItem` (`frontend/src/pages/Kasir/CartItem.tsx`):
    - Deteksi kopi via `item.produk?.resep?.is_kopi`.
    - Tampilkan `Popover` (pakai `components/ui/popover.tsx`) berisi:
      - Pilihan kekuatan: strong, medium, soft, other (pakai tombol/segmented control).
      - Input gram (number). Default otomatis saat kekuatan berubah:
        - strong → 10
        - medium → 8
        - soft → 6
        - other → 0 (user isi manual)
    - Update nilai ke parent dengan callback baru `onCoffeeOptionChange(produkId, strength, grams)` agar tersimpan di `localCart`.
  - Penerimaan callback di `CartSidebar` (`frontend/src/pages/Kasir/CartSidebar.tsx`) hanya meneruskan ke `CartItem`; tidak ada perubahan perhitungan total.
- Tidak ada perubahan pada proses checkout saat ini (informasi kopi tidak dikirim ke backend). Jika perlu dikirim/tercetak di struk, bisa ditambahkan di request `items` dan util `printReceipt` pada tahap berikutnya.

## Validasi & Uji
- Backend: uji CRUD resep dengan/ tanpa `is_kopi`, serta filter `GET /recipes?is_kopi=true`.
- Frontend: uji alur Kasir—tambah item kopi, buka popover, pilih kekuatan, cek set default gram, edit manual, ubah quantity tetap menjaga opsi kopi per item.

## Dampak
- Aman bagi data eksisting: default `false`.
- UX kasir bertambah fitur khusus kopi tanpa mengubah harga/stock.

## Eksekusi Setelah Disetujui
1. Tambah migration kolom `is_kopi` + jalankan migrasi.
2. Implementasi perubahan backend (model, validator, controller).
3. Implementasi perubahan frontend (tipe, form, tabel, Kasir popover + state).
4. Uji end-to-end di halaman Resep & Kasir.