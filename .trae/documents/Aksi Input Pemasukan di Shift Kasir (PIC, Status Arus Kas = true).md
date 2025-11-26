## Tujuan
- Menambahkan aksi di menu Shift Kasir untuk PIC menginput pemasukan setelah kasir closing.
- Pemasukan masuk ke Arus Kas dengan `status = true` dan keterangan otomatis: `Closing Kasir NOMOR TUTUP KASIR`.
- Input hanya boleh sekali per shift.

## Backend
- Route baru: `POST /shift-kasir/{id}/input-pemasukan`.
- Controller: `ShiftKasirController`
  - Validasi:
    - Shift harus berstatus `closed`.
    - Body: `jumlah:number|required|min:0.01`, `metode_pembayaran:enum('cash','card','qris','other')|optional`, `deskripsi` diabaikan (backend generate otomatis).
  - Cek one-time:
    - Query `ArusKas` dengan `referensi_type = 'ShiftKasir'`, `referensi_id = {shiftId}`, `kategori = 'pemasukan_kasir'`, `sub_kategori = 'penjualan_kasir'`.
    - Jika ada, kembalikan 409/400: "Input pemasukan untuk shift ini sudah dilakukan".
  - Generate deskripsi:
    - Ambil nomor tutup shift (misal `shift.no_tutup` atau fallback `shift.id`) dan bentuk string: `Closing Kasir {NOMOR_TUTUP_KASIR}`.
  - Buat `ArusKas`:
    - `user_id` = PIC (current user), `lokasi_id` = shift.lokasi_id, `shift_id` = shift.id
    - `jenis` = 'pemasukan', `kategori` = 'pemasukan_kasir', `sub_kategori` = 'penjualan_kasir'
    - `jumlah` = input, `deskripsi` = string auto di atas, `tanggal` = `now()`
    - `referensi_type` = 'ShiftKasir', `referensi_id` = shift.id
    - `metode_pembayaran` = dari input (default 'cash')
    - `status` = true
  - Response: JSON dengan resource ArusKas.

## Frontend
- List Shift Kasir:
  - Tambah tombol "Input Pemasukan" pada item shift berstatus `closed` dan belum memiliki pemasukan terkait.
  - Klik tombol membuka `InputPemasukanModal` (baru) dengan fields: jumlah (number), metode pembayaran (select), info deskripsi ditampilkan readonly: `Closing Kasir NOMOR TUTUP KASIR` (dari backend respons atau preview).
  - Submit panggil endpoint; pada sukses, snackbar dan refresh list.
- Service: `shiftKasirService.inputPemasukan(shiftId, payload)`.

## Pembatasan Satu Kali
- Backend enforce (hard) melalui pengecekan ArusKas referensi shift.
- FE hide tombol bila backend melaporkan sudah ada pemasukan.

## Dampak
- Menu Arus Kas dan Dashboard sudah menampilkan `status=true` saja, sehingga nominal PIC langsung tercermin.

## Uji
- Tutup shift → tombol Input Pemasukan muncul.
- Input jumlah untuk shift → Arus Kas bertambah `status=true` dengan deskripsi otomatis.
- Coba input kedua kali → ditolak (error), tombol hilang setelah refresh.

## File Terdampak
- Backend: `routes/api.php` (route baru), `app/Modules/ShiftKasir/ShiftKasirController.php` (aksi baru), `app/Models/ArusKas.php` (tidak berubah lagi).
- Frontend: `src/pages/ShiftKasir/*` (list + modal baru), `src/services/shiftKasir.ts` (method baru).