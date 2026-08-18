# Undangan Pernikahan - Green Glassmorphism

Undangan React + TypeScript untuk Cloudflare Pages. Frontend dilayani CDN; RSVP dan ucapan memakai Pages Functions, D1, serta Turnstile.

Panduan upload lengkap tersedia di [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md).

## Jalankan dan build

1. Instal Node.js 20+.
2. Jalankan `npm install`.
3. Preview dengan `npm run dev`.
4. Build production dengan `npm run build`; output berada di `dist/`.

Semua identitas, tanggal, acara, rekening, galeri, dan musik diedit dari `src/config/wedding.ts`. Lihat `HOW_TO_EDIT_WEDDING.md`.

## Cloudflare D1

```bash
npx wrangler d1 create wedding-db
npx wrangler d1 migrations apply wedding-db --remote
```

Salin `database_id` hasil pembuatan ke `wrangler.toml`.

## Turnstile dan secret

Buat widget Turnstile, set `VITE_TURNSTILE_SITE_KEY` pada build environment Pages, lalu simpan secret backend:

```bash
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name undangan-bima-naya
npx wrangler pages secret put IP_HASH_SALT --project-name undangan-bima-naya
```

## R2, deploy, dan domain

Buat bucket `wedding-assets` untuk media besar. Struktur disarankan: `gallery/`, `bride/`, `groom/`, `hero/`, `music/`, `video/`.

Hubungkan GitHub ke Pages dengan build command `npm run build` dan output `dist`, atau upload langsung:

```bash
npx wrangler pages deploy dist --project-name undangan-bima-naya
```

Tambahkan custom domain pada Pages → Custom domains. Lindungi `/admin*` dan `/api/admin/*` dengan Cloudflare Access.

## Media

Ganti fallback di `public/images/` dengan foto WebP/AVIF dan sesuaikan path config. Tambahkan lagu berizin di `public/music/wedding-song.mp3`.
