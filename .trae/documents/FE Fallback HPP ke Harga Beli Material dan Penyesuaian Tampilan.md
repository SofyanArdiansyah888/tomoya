## Sasaran
- Tampilkan HPP di FE dengan fallback ke `purchase_price` bila tidak ada pembelian.
- Tampilkan harga per unit resep menggunakan nilai dari `recipe.hpp.cost_per_unit` (bukan field top-level).

## Perubahan File
- HppMaterialTable: jika `hpp` atau `hpp_unit_price` tidak tersedia, hitung di FE: `base = material.hpp ?? material.purchase_price`; `unit = (material.hpp_unit_price ?? (material.nilai_konversi > 0 ? base / material.nilai_konversi : base))`.
- HppMaterialDetailModal: logika tampilan sama seperti di tabel, hilangkan badge “Belum ada pembelian” karena fallback tersedia.
- HppResepTable: ubah kolom Harga Per Unit agar membaca `recipe.hpp.cost_per_unit`.

## Validasi
- Material tanpa pembelian menampilkan HPP dan harga per unit yang masuk akal (dari harga beli, dikonversi bila ada).
- Resep menampilkan Total HPP dan Harga Per Unit berdasarkan breakdown terbaru.

Konfirmasi untuk lanjut implementasi perubahan FE sesuai rencana ini.