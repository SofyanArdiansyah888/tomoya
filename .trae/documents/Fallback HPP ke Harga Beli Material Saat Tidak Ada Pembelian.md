## Latar Belakang
- Saat ini HPP Material (`HppMaterialResource`) dan HPP Resep (`Recipe::calculateHpp`) menggunakan harga dari pembelian terakhir (`ItemPembelian`).
- Jika belum ada riwayat pembelian, HPP menjadi `null` atau memakai `pivot.cost` resep.
- Kebutuhan: bila tidak ada pembelian, pakai `material.purchase_price` sebagai fallback untuk HPP.

## Perubahan Teknis
### 1) HPP Material
- File: `backend/app/Http/Resources/HppMaterialResource.php`
- Logika saat ini:
  - `latestHpp = material->getLatestHpp()` (harga satuan dari pembelian terakhir)
  - `hpp_unit_price = latestHpp / nilai_konversi` bila ada, jika tidak maka `null`.
- Perubahan:
  - Jika `latestHpp === null`, gunakan `purchase_price` dari `Material`.
  - Perhitungan `hpp_unit_price`:
    - Jika `nilai_konversi > 0`: `(fallbackPrice) / nilai_konversi`
    - Jika `nilai_konversi == 0`: gunakan langsung `fallbackPrice`.
  - Isi field `hpp` juga gunakan `fallbackPrice` agar terisi (bukan `null`).

### 2) HPP Resep
- File: `backend/app/Models/Recipe.php` (metode `calculateHpp`)
- Logika saat ini:
  - Per-material: `materialHppRaw = material->getLatestHpp()` → `materialHpp = materialHppRaw / nilai_konversi` bila ada.
  - `costPerUnit = materialHpp ?? (recipeMaterial->cost ?? 0)`.
- Perubahan:
  - Jika `materialHppRaw === null`, set `materialHppRaw = material->purchase_price`.
  - Jika `nilai_konversi > 0`: `materialHpp = materialHppRaw / nilai_konversi`, jika 0: `materialHpp = materialHppRaw`.
  - `costPerUnit = materialHpp` (utamakan fallback ke harga beli material) dan gunakan `pivot.cost` hanya jika kita ingin override manual (opsional: tetap mempertahankan `?? recipeMaterial->cost` di belakang jika Anda butuh override manual).

## Konsistensi Unit
- `nilai_konversi` dipakai untuk mengonversi harga beli (umumnya satuan gudang) ke satuan konsumsi/pemakaian resep. Jika 0/tidak ada, gunakan harga beli apa adanya.

## Dampak API
- Endpoint:
  - `GET /hpp/material` dan `GET /hpp/material/{id}`: field `hpp`/`hpp_unit_price` akan selalu terisi (fallback ke `purchase_price`).
  - `GET /hpp/recipes` dan `GET /hpp/recipe/{id}`: breakdown per material akan memuat `cost_per_unit` dari harga beli saat tidak ada histori pembelian.

## Uji & Verifikasi
1. Buat material tanpa riwayat pembelian, cek `GET /hpp/material` dan pastikan `hpp`/`hpp_unit_price` terisi dari `purchase_price`.
2. Buat resep yang menggunakan material tanpa pembelian, cek `GET /hpp/recipe/{id}` dan pastikan `breakdown[].cost_per_unit` memakai harga beli (terkonversi jika `nilai_konversi` > 0).
3. Bandingkan hasil dengan material yang memiliki pembelian—pastikan tetap mengambil harga dari pembelian terakhir.

## File yang Diubah
- `backend/app/Http/Resources/HppMaterialResource.php`
- `backend/app/Models/Recipe.php`

Konfirmasi untuk lanjut implementasi sesuai rencana di atas.