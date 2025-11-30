## Tujuan
- Di menu HPP Material dan HPP Resep, jika suatu material memiliki Mix Preparation sebagai output, maka nilai HPP yang ditampilkan/dirujuk harus diambil dari Mix Preparation (bukan dari pembelian terakhir).

## Perubahan Backend
### Model `Material`
- Tambah method `getUnitHpp()` untuk menghasilkan HPP per unit berdasarkan pembelian (latest HPP atau fallback purchase_price), dengan konversi `nilai_konversi` bila ada.
- Tambah method `getMixPreparationUnitHpp()`:
  - Ambil Mix Preparation terbaru yang menghasilkan material ini (`MixPreparation::where('output_material_id', $this->id)->orderBy('tanggal','desc')->orderBy('id','desc')->first()`).
  - Ambil semua `ItemLokasi` sebagai input untuk Mix Preparation tersebut (`reference_type = MixPreparation::class`, `reference_id` sesuai, `quantity < 0`).
  - Hitung biaya total input = Σ(unit HPP input × quantity_input_abs), di mana unit HPP input berasal dari `materialInput->getUnitHpp()`.
  - Hitung HPP per unit output = total biaya input / `output_quantity`.
  - Kembalikan float atau null bila tidak ada Mix Preparation.
- Tambah method `getEffectiveUnitHpp()` yang:
  - Mengembalikan `getMixPreparationUnitHpp()` jika tersedia.
  - Jika tidak, `getUnitHpp()` (latest purchase/fallback).

### Resource `HppMaterialResource.php`
- Saat menyusun response, gunakan `getMixPreparationUnitHpp()` terlebih dahulu:
  - Jika ada, set:
    - `hpp` = nilai unit mix prep (raw),
    - `hpp_unit_price` = nilai unit mix prep (tanpa pembagian konversi lagi),
    - (opsional) tambahkan field `hpp_source` = `'mix_preparation'`.
  - Jika tidak ada, gunakan logika existing (latest HPP/purchase + konversi) dan `hpp_source = 'purchase'`.

### Resource `HppRecipeResource.php` + `Recipe::calculateHpp()`
- Modifikasi `Recipe::calculateHpp()` agar untuk tiap material:
  - Ambil `unitHpp` via `material->getEffectiveUnitHpp()`.
  - Gunakan `unitHpp` sebagai `hpp_per_unit` pada breakdown; `cost_per_unit` ditetapkan ke `unitHpp` (atau override pivot cost bila ada seperti pola existing), lalu subtotal = `cost_per_unit × quantity`.
  - (opsional) tambahkan `source` pada setiap item breakdown (`'mix_preparation'` atau `'purchase'`).
- Resource `HppRecipeResource` sudah memakai output dari `calculateHpp()`, jadi otomatis mengikuti perubahan.

## Perubahan Frontend
- Tidak perlu perubahan UI karena:
  - HPP Material Table sudah membaca `material.hpp` dan `material.hpp_unit_price` dengan fallback; backend akan memasok nilai mix prep ketika ada.
  - HPP Resep Table membaca `recipe.hpp.cost_per_unit` dari backend; otomatis mengikuti `calculateHpp()`.
- (Opsional) Menampilkan badge sumber HPP jika field `hpp_source` ditambahkan (dapat dilakukan kemudian).

## Validasi & Pengujian
- Buat satu Mix Preparation untuk material output (memiliki beberapa input material dengan stok cukup), kemudian:
  - Pastikan `GET /hpp/materials` menampilkan HPP material output sesuai perhitungan mix (total biaya input / output_quantity).
  - Pastikan `GET /hpp/recipes` dan `GET /hpp/recipes/{id}` menampilkan `total_hpp` dan `cost_per_unit` yang berubah sesuai jika resep menggunakan material yang berasal dari mix preparation.
  - Verifikasi fallback: material tanpa mix preparation tetap memakai HPP dari pembelian terakhir atau `purchase_price`.

## Dampak & Kompatibilitas
- Tidak ada perubahan skema database.
- Perhitungan HPP menjadi lebih akurat untuk material yang diproduksi lewat Mix Preparation.
- Lokasi Mix Preparation diabaikan untuk perhitungan HPP agregat (menggunakan record terbaru secara global), sesuai dengan kebutuhan menu HPP.

## Langkah Eksekusi Setelah Disetujui
1. Implementasi method baru di `Material` (unit HPP, mix prep unit HPP, effective unit HPP).
2. Ubah `HppMaterialResource` untuk memprioritaskan HPP dari Mix Preparation.
3. Ubah `Recipe::calculateHpp()` untuk menggunakan `getEffectiveUnitHpp()`.
4. Jalankan dan uji endpoint HPP Material dan HPP Resep serta FE yang menampilkannya.