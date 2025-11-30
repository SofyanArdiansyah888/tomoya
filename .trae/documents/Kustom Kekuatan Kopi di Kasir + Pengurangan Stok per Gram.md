## Ringkasan

* Tambah flag `is_bahan_kopi` pada Material untuk menandai bahan kopi.

* Di Kasir, kirim `coffee_grams` per item kopi; backend akan mengurangi stok pada material yang ber-flag tersebut. Jika tidak ada flag, pakai quantity resep biasa.

## Perubahan Database

* Migration baru: tambah kolom `is_bahan_kopi` (boolean, default false) ke tabel `material`.

## Perubahan Backend (Laravel)

* `Material` model (`backend/app/Models/Material.php`): tambah `is_bahan_kopi` ke `$casts` dan `$fillable` (atau pastikan dapat diisi via request), default false.

* Validasi `MaterialRequest` (jika ada): tambah rule boolean untuk `is_bahan_kopi` agar bisa diatur dari UI.

* `PesananController@store` dan `@update`:

  * Validasi opsional item: `items.*.coffee_strength` in \[strong,medium,soft,other], `items.*.coffee_grams` numeric ≥ 0.

  * Saat pengurangan stok untuk produk dengan resep `is_kopi === true` dan item punya `coffee_grams`:

    * Cari `recipeMaterials` yang `material.is_bahan_kopi === true`.

    * Jika ditemukan, override `requiredQuantityPerProduct` untuk material tersebut menjadi `coffee_grams` (total = `coffee_grams * item.quantity`).

    * Material lain tetap mengikuti quantity resep.

    * Jika tidak ada material ber-flag, fallback: semua material pakai quantity resep (tidak error).

  * Tetap lakukan validasi stok, dan catat pergerakan stok (keluar/masuk) seperti saat ini.

## Perubahan Frontend

* Kasir (`frontend/src/pages/Kasir/...`):

  * Sudah ada UI popover kekuatan/gram di `CartItem.tsx`.

  * Ubah `handleAddToCart`: untuk item kopi, jangan digabung per `produk_id` (buat baris terpisah) agar bisa 1 strong + 1 soft.

  * Sertakan `coffee_strength` dan `coffee_grams` di payload `items` saat checkout.

* Material UI:

  * `MaterialForm.tsx`: tambah switch “Bahan Kopi” (`is_bahan_kopi`).

  * `MaterialTable.tsx`: tambah kolom/indikator “Bahan Kopi”.

## Alur & Verifikasi

* Contoh: "Kopi Susu" ditambahkan 2 baris: 1 strong (40g), 1 soft (30g).

* Checkout: payload menyertakan `coffee_grams` masing-masing.

* Backend: cari material resep yang `is_bahan_kopi === true`; kurangi stok total 70g pada material itu. Bahan lain (susu/gula) tetap sesuai resep.

* Jika tidak ada flag pada material: sistem tetap jalan, pengurangan stok mengikuti resep standar.

## File Terkait

* Backend: `backend/app/Models/Material.php`, `backend/app/Modules/Material/MaterialController.php`/`MaterialRequest.php` (untuk CRUD flag), `backend/app/Modules/Pesanan/PesananController.php:207–249` dan `:484–522` (logika pengurangan stok).

* Frontend: `frontend/src/pages/Kasir/Kasir.tsx`, `frontend/src/pages/Kasir/CartItem.tsx`, `frontend/src/pages/Material/MaterialForm.tsx`, `frontend/src/pages/Material/MaterialTable.tsx`, `frontend/src/types/order.ts`.

