@echo off
REM ==========================================================================
REM  Daftarkan sync-scheduler.bat ke Windows Task Scheduler supaya otomatis
REM  berjalan setiap kali Windows login. Jalankan file ini SEKALI sebagai
REM  Administrator (klik kanan > Run as administrator).
REM ==========================================================================

set "SCRIPT=%~dp0sync-scheduler.bat"

schtasks /Create /F /TN "Tomoya Sync Scheduler" /SC ONLOGON /RL HIGHEST /TR "cmd /c \"\"%SCRIPT%\"\""
if %errorlevel% neq 0 (
  echo Gagal membuat task. Pastikan dijalankan sebagai Administrator.
  pause
  exit /b 1
)

echo Task "Tomoya Sync Scheduler" berhasil dibuat. Menjalankan sekarang...
schtasks /Run /TN "Tomoya Sync Scheduler"
pause
