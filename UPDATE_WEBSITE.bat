@echo off
setlocal

cd /d "%~dp0"
title Update Undangan Bima dan Alviana

echo ================================================
echo   UPDATE WEBSITE UNDANGAN BIMA DAN ALVIANA
echo ================================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [GAGAL] Node.js atau npm belum tersedia.
  echo Silakan instal Node.js, lalu coba kembali.
  goto :failed
)

echo [1/2] Membuat versi terbaru website...
call npm run build
if errorlevel 1 (
  echo.
  echo [GAGAL] Build website mengalami error.
  goto :failed
)

echo.
echo [2/2] Mengunggah ke Cloudflare Pages...
call npx wrangler pages deploy dist --project-name undangan-bima-alvi
if errorlevel 1 (
  echo.
  echo [GAGAL] Upload ke Cloudflare mengalami error.
  echo Jika diminta login, jalankan: npx wrangler login
  goto :failed
)

echo.
echo ================================================
echo   UPDATE BERHASIL
echo   https://bimalvi.my.id
echo ================================================
echo.
pause
exit /b 0

:failed
echo.
echo Website lama tetap aman dan tidak berubah.
echo Periksa pesan error di atas.
echo.
pause
exit /b 1
