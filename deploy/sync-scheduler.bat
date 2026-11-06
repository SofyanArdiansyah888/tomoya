@echo off
REM ==========================================================================
REM  Tomoya - Scheduler sinkronisasi PC kasir <-> cloud
REM  Menjalankan "php artisan schedule:work" terus-menerus:
REM   - sync:run setiap menit (kirim & ambil data)
REM   - backup:database setiap hari 23:30
REM  Jika proses berhenti (mis. error), otomatis dijalankan ulang setelah 10 detik.
REM
REM  Sesuaikan dua baris di bawah dengan lokasi di PC kasir.
REM ==========================================================================

set "BACKEND_DIR=C:\laragon\www\tomoya\backend"
set "PHP_BIN=php"

cd /d "%BACKEND_DIR%"

:loop
echo [%date% %time%] Menjalankan scheduler sinkronisasi...
"%PHP_BIN%" artisan schedule:work
echo [%date% %time%] Scheduler berhenti, mencoba lagi dalam 10 detik...
timeout /t 10 /nobreak >nul
goto loop
