# Langkah Upload ke Cloudflare

Panduan ini menggunakan Wrangler agar frontend, Pages Functions, D1, R2, dan Turnstile dapat berjalan bersama.

## 1. Buka folder project

```powershell
cd C:\Users\HRD\Documents\ASS_ADOBE\und_online
```

## 2. Login Cloudflare

```powershell
npx wrangler login
```

Browser akan terbuka untuk memberikan izin ke akun Cloudflare.

## 3. Buat database D1

```powershell
npx wrangler d1 create wedding-db
```

Salin `database_id` yang diberikan Cloudflare ke `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "wedding-db"
database_id = "ID_DARI_CLOUDFLARE"
```

Jalankan migration production:

```powershell
npx wrangler d1 migrations apply wedding-db --remote
```

## 4. R2 opsional untuk media besar

```powershell
npx wrangler r2 bucket create wedding-assets
```

Versi awal menyimpan gambar di `public/images`, sehingga R2 tidak diperlukan. Jika nantinya ada video atau media besar, buat bucket `wedding-assets` lalu gunakan binding bernama `WEDDING_ASSETS`—jangan memakai `ASSETS` karena nama tersebut dicadangkan oleh Cloudflare Pages.

## 5. Instal dan build

```powershell
npm install
npm run build
```

Output production berada di folder `dist/`.

## 6. Buat project Cloudflare Pages

```powershell
npx wrangler pages project create undangan-bima-naya
```

Pilih `main` sebagai production branch.

## 7. Upload website

Jalankan dari root project agar folder `functions/` ikut diunggah:

```powershell
npx wrangler pages deploy dist --project-name undangan-bima-naya
```

Alamat awal website akan berbentuk:

```text
https://undangan-bima-naya.pages.dev
```

## 8. Konfigurasi Turnstile

Di Cloudflare Dashboard buka:

```text
Workers & Pages
→ undangan-bima-naya
→ Settings
→ Variables and Secrets
```

Tambahkan sebagai encrypted secret:

```text
TURNSTILE_SECRET_KEY
IP_HASH_SALT
```

Untuk site key frontend, build dan deploy ulang:

```powershell
$env:VITE_TURNSTILE_SITE_KEY="SITE_KEY_ANDA"
npm run build
npx wrangler pages deploy dist --project-name undangan-bima-naya
```

Jangan memasukkan secret key ke repository.

## 9. Pasang custom domain

Di Cloudflare Dashboard buka:

```text
Workers & Pages
→ undangan-bima-naya
→ Custom domains
→ Set up a custom domain
```

Masukkan domain:

```text
bimalvi.my.id
```

## 10. Lindungi halaman admin

Gunakan Cloudflare Access untuk melindungi:

```text
/admin*
/api/admin/*
```

## Update website berikutnya

Setelah mengganti data atau foto:

```powershell
npm run build
npx wrangler pages deploy dist --project-name undangan-bima-naya
```

Jangan memakai drag-and-drop dashboard jika RSVP, ucapan, dan halaman admin perlu berfungsi karena folder Pages Functions harus diunggah melalui Wrangler atau Git integration.