# AGENTS.md
# Wedding Invitation Cloudflare — Green Glassmorphism

## 1. PERAN AGENT

Anda adalah **Senior Full-Stack Engineer, UI/UX Designer, Cloudflare Architect, Security Engineer, dan Performance Engineer**.

Tugas utama Anda adalah membangun aplikasi undangan pernikahan online yang:

- Modern
- Elegan
- Sangat smooth
- Mobile-first
- Responsive
- Premium
- Bertema hijau
- Menggunakan glassmorphism
- Mudah diedit oleh orang awam
- Tidak membutuhkan server lokal
- Tidak membutuhkan Laragon/XAMPP
- Dapat berjalan sepenuhnya melalui ekosistem Cloudflare

Target deployment:

- Cloudflare Pages
- Cloudflare Workers / Pages Functions
- Cloudflare D1
- Cloudflare R2
- Cloudflare Turnstile
- Cloudflare DNS

Jangan membuat aplikasi yang hanya cocok dijalankan di localhost.

Aplikasi harus production-ready.

---

# 2. TUJUAN PROJECT

Buat website undangan pernikahan dengan arsitektur:

```text
Custom Domain
      │
      ▼
Cloudflare DNS
      │
      ▼
Cloudflare Pages
      │
      ├── Frontend
      │
      ├── Assets
      │
      └── Pages Functions / Worker
                    │
                    ├── Cloudflare D1
                    │
                    ├── Cloudflare R2
                    │
                    └── Cloudflare Turnstile
```

Contoh:

```text
https://namacalon.com
```

Website tetap dapat dibuka walaupun komputer pemilik website dalam keadaan mati.

---

# 3. PRINSIP UTAMA

Selalu prioritaskan:

1. Mobile-first
2. Responsive
3. Performance
4. Accessibility
5. UX sederhana
6. Animasi halus
7. SEO
8. Security
9. Maintainability
10. Kemudahan mengganti data pernikahan

Jangan membuat kode terlalu kompleks jika solusi sederhana tersedia.

Jangan membuat dependency yang tidak diperlukan.

---

# 4. STACK REKOMENDASI

Gunakan:

```text
Frontend:
- React
- Vite
- TypeScript

Styling:
- Tailwind CSS

Animation:
- Framer Motion

Icons:
- Lucide React

Backend:
- Cloudflare Pages Functions
atau
- Cloudflare Workers

Database:
- Cloudflare D1

Storage:
- Cloudflare R2

Security:
- Cloudflare Turnstile

Deployment:
- Cloudflare Pages

Source Control:
- GitHub
```

Jika terdapat alasan teknis kuat untuk memakai stack lain, agent boleh menyesuaikan tetapi tetap harus kompatibel dengan Cloudflare.

---

# 5. CONFIG TERPUSAT

Semua informasi utama pernikahan WAJIB dapat diganti dari satu file.

Buat:

```text
src/config/wedding.ts
```

Contoh:

```ts
export const weddingConfig = {
  groom: {
    name: "Nama Calon Pria",
    shortName: "Calon Pria",
    father: "Nama Ayah Pria",
    mother: "Nama Ibu Pria",
    instagram: "",
    photo: "/images/groom.webp"
  },

  bride: {
    name: "Nama Calon Wanita",
    shortName: "Calon Wanita",
    father: "Nama Ayah Wanita",
    mother: "Nama Ibu Wanita",
    instagram: "",
    photo: "/images/bride.webp"
  },

  wedding: {
    day: "Senin",
    date: "07 Desember 2026",
    isoDate: "2026-12-07",
    timezone: "Asia/Jakarta"
  },

  akad: {
    time: "08:00 WIB",
    location: "Nama Lokasi Akad",
    address: "Alamat lengkap akad",
    googleMapsUrl: ""
  },

  reception: {
    time: "10:00 - 14:00 WIB",
    location: "Nama Lokasi Resepsi",
    address: "Alamat lengkap resepsi",
    googleMapsUrl: ""
  },

  banks: [
    {
      bank: "BCA",
      accountNumber: "1234567890",
      accountName: "NAMA PEMILIK REKENING"
    },
    {
      bank: "SeaBank",
      accountNumber: "901234567890",
      accountName: "NAMA PEMILIK REKENING"
    }
  ]
};
```

Semua komponen mengambil data dari config tersebut.

DILARANG menulis ulang nama pasangan, tanggal, orang tua, lokasi, rekening, atau waktu secara hardcoded di banyak file.

---

# 6. DATA YANG HARUS MUDAH DIGANTI

Admin harus dapat mengganti:

## Calon pria

- Nama lengkap
- Nama panggilan
- Nama ayah
- Nama ibu
- Foto
- Instagram opsional

## Calon wanita

- Nama lengkap
- Nama panggilan
- Nama ayah
- Nama ibu
- Foto
- Instagram opsional

## Pernikahan

- Hari
- Tanggal
- Bulan
- Tahun
- Zona waktu

## Akad

- Hari
- Tanggal
- Jam
- Lokasi
- Alamat
- Google Maps

## Resepsi

- Hari
- Tanggal
- Jam
- Lokasi
- Alamat
- Google Maps

## Transfer

- BCA
- SeaBank
- Nomor rekening
- Nama pemilik rekening

---

# 7. DESAIN

Tema utama:

```text
Elegant Green Wedding
+
Glassmorphism
+
Botanical
+
Luxury Minimalist
```

Warna utama:

```text
Deep Forest Green
Sage Green
Emerald
Olive
Cream
Soft Gold
White
```

Contoh:

```css
--green-dark: #123524;
--green-primary: #1f5c3a;
--green-soft: #7f9f80;
--sage: #a8b89a;
--cream: #f5f0df;
--gold: #d4bd7f;
```

Jangan membuat warna terlalu terang.

Hindari desain neon.

Hindari desain seperti dashboard bisnis.

Website harus terasa sebagai undangan pernikahan premium.

---

# 8. GLASSMORPHISM

Gunakan secara konsisten tetapi jangan berlebihan.

Contoh:

```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);

border: 1px solid rgba(255, 255, 255, 0.18);

box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.15);
```

Cards:

```text
border-radius: 20px - 32px
```

Gunakan efek:

- blur
- transparency
- subtle border
- soft shadow
- subtle highlight

---

# 9. BACKGROUND

Gunakan background:

- Hijau gelap
- Gradient
- Bokeh
- Leaf pattern
- Floral decoration

Gunakan dekorasi:

- Daun
- Eucalyptus
- Mawar putih
- Bunga putih kecil
- Ornamen botanical

Jangan memenuhi seluruh layar dengan dekorasi.

Pastikan teks tetap mudah dibaca.

---

# 10. TYPOGRAPHY

Gunakan kombinasi maksimal 3 font.

Rekomendasi:

Heading:

```text
Cormorant Garamond
Playfair Display
```

Script:

```text
Great Vibes
Parisienne
```

UI:

```text
Inter
Manrope
```

Contoh:

```text
The Wedding Of
→ Great Vibes

Nama Calon Pria
&
Nama Calon Wanita
→ Cormorant Garamond

Isi
→ Inter
```

---

# 11. MOBILE FIRST

Prioritas utama website adalah smartphone.

Breakpoint:

```text
mobile
320px
360px
375px
390px
414px
430px
```

Kemudian:

```text
tablet
768px

desktop
1024px+

large
1440px+
```

Semua section wajib dites pada:

```text
360 × 800
390 × 844
414 × 896
768 × 1024
1366 × 768
1920 × 1080
```

---

# 12. HERO / COVER

Saat website pertama dibuka tampilkan cover undangan.

Isi:

```text
The Wedding Of

Nama Calon Pria
&
Nama Calon Wanita

Kepada Yth.
Bapak/Ibu/Saudara/i

[Nama Tamu]

Buka Undangan
```

Tambahkan tombol:

```text
Buka Undangan
```

Ketika ditekan:

- buka konten
- jalankan musik jika browser mengizinkan
- smooth transition
- jangan reload halaman

---

# 13. PERSONALISASI NAMA TAMU

Dukung URL:

```text
https://domain.com/?to=Budi
```

Tampilkan:

```text
Kepada Yth.

Bapak/Ibu/Saudara/i

Budi
```

Decode URL dengan benar.

Contoh:

```text
?to=Bapak%20Budi%20Santoso
```

harus tampil:

```text
Bapak Budi Santoso
```

Jika parameter kosong:

```text
Tamu Undangan
```

Jangan memasukkan HTML mentah dari query parameter.

Sanitize input.

---

# 14. NAVIGATION

Desktop:

```text
Beranda
Mempelai
Acara
Galeri
Lokasi
RSVP
Ucapan
Hadiah
```

Mobile:

Gunakan hamburger menu.

Tambahkan floating navigation bila cocok.

Gunakan smooth scroll.

Section menggunakan anchor:

```text
#home
#couple
#event
#gallery
#location
#rsvp
#wishes
#gift
```

---

# 15. MUSIC

Tambahkan background music.

Fitur:

```text
Play
Pause
Mute
```

Gunakan floating music button.

Jangan autoplay sebelum interaksi pengguna jika browser melarang.

Setelah tombol:

```text
Buka Undangan
```

ditekan:

coba jalankan musik.

Jika autoplay gagal:

jangan menghasilkan error.

---

# 16. SECTION MEMPELAI

Tampilkan dua profil.

## Pria

```text
Nama Calon Pria

Putra dari

Bapak [Nama Ayah]

&

Ibu [Nama Ibu]
```

## Wanita

```text
Nama Calon Wanita

Putri dari

Bapak [Nama Ayah]

&

Ibu [Nama Ibu]
```

Tambahkan:

- foto
- ornament
- Instagram opsional

Foto harus:

```text
object-fit: cover
```

Gunakan WebP atau AVIF.

---

# 17. SAVE THE DATE

Tampilkan countdown:

```text
120 Hari
08 Jam
45 Menit
30 Detik
```

Countdown harus mengambil:

```ts
weddingConfig.wedding.isoDate
```

Pertimbangkan timezone:

```text
Asia/Jakarta
```

Jangan bergantung pada timezone perangkat pengguna tanpa penyesuaian.

Setelah waktu habis:

```text
Hari Bahagia Telah Tiba
```

---

# 18. RANGKAIAN ACARA

Minimal:

## Akad Nikah

Tampilkan:

- Hari
- Tanggal
- Jam
- Lokasi

## Resepsi

Tampilkan:

- Hari
- Tanggal
- Jam
- Lokasi

Gunakan glass cards.

Tambahkan icon.

---

# 19. GALERI

Buat section:

```text
Galeri
```

Minimal 6 foto.

Desktop:

```text
3 kolom
```

Mobile:

```text
2 kolom
```

Gunakan:

```text
CSS Grid
```

Tambahkan:

- Lazy loading
- Skeleton loading
- Smooth fade-in
- Modal/lightbox

Klik foto:

```text
fullscreen preview
```

Navigasi:

```text
previous
next
close
```

Keyboard desktop:

```text
ArrowLeft
ArrowRight
Escape
```

---

# 20. R2 STORAGE

Foto/video besar dapat disimpan ke:

```text
Cloudflare R2
```

Struktur:

```text
wedding-assets/
│
├── gallery/
├── bride/
├── groom/
├── hero/
├── music/
└── video/
```

Jangan menyimpan file media besar di D1.

---

# 21. LOKASI

Section:

```text
Lokasi
```

Tampilkan:

```text
Nama Gedung / Lokasi

Alamat lengkap
```

Tombol:

```text
Buka Google Maps
```

Gunakan:

```text
target="_blank"
rel="noopener noreferrer"
```

Jangan embed Google Maps berat jika tidak diperlukan.

Prioritaskan preview sederhana.

---

# 22. RSVP

Form RSVP:

```text
Nama
Status Kehadiran
Jumlah Tamu
Pesan opsional
```

Status:

```text
Hadir
Tidak Hadir
Masih Belum Pasti
```

Jumlah tamu:

```text
1
2
3
4
```

Kirim ke API:

```text
/api/rsvp
```

Simpan ke Cloudflare D1.

---

# 23. DATABASE D1

Gunakan tabel:

```sql
CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  guest_name TEXT,

  guest_slug TEXT UNIQUE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

RSVP:

```sql
CREATE TABLE IF NOT EXISTS rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  guest_name TEXT NOT NULL,

  attendance TEXT NOT NULL,

  guest_count INTEGER DEFAULT 1,

  message TEXT,

  ip_hash TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Ucapan:

```sql
CREATE TABLE IF NOT EXISTS wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  guest_name TEXT NOT NULL,

  message TEXT NOT NULL,

  approved INTEGER DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 24. UCAPAN & DOA

Buat form:

```text
Nama
Ucapan
```

Button:

```text
Kirim Ucapan
```

API:

```text
POST /api/wishes
```

Tampilkan daftar ucapan.

Gunakan pagination atau load-more.

Contoh:

```text
Budi

Selamat menempuh hidup baru.
Semoga menjadi keluarga sakinah,
mawaddah dan warahmah.
```

---

# 25. MODERASI UCAPAN

Tambahkan field:

```text
approved
```

Jika admin moderation diaktifkan:

```text
approved = 0
```

baru muncul setelah disetujui.

Jika moderation tidak digunakan:

```text
approved = 1
```

---

# 26. CLOUDFLARE TURNSTILE

Gunakan Turnstile pada:

```text
RSVP
Ucapan
```

Untuk mencegah:

- bot
- spam
- flood

Frontend menerima token.

Backend wajib memvalidasi token.

Jangan hanya validasi di frontend.

---

# 27. ONLINE GIFT

Section:

```text
Kirim Hadiah Secara Online
```

Copy:

```text
Doa restu Anda merupakan hadiah terindah bagi kami.

Namun apabila ingin memberikan tanda kasih,
Anda dapat mengirimkannya melalui rekening berikut.
```

---

# 28. BCA

Card:

```text
BCA

No. Rekening

1234567890

a.n.

NAMA PEMILIK
```

Tambahkan:

```text
Salin Nomor Rekening
```

Gunakan:

```js
navigator.clipboard.writeText()
```

Setelah berhasil tampilkan toast:

```text
Nomor rekening berhasil disalin
```

---

# 29. SEABANK

Card:

```text
SeaBank

No. Rekening

901234567890

a.n.

NAMA PEMILIK
```

Tambahkan:

```text
Salin Nomor Rekening
```

---

# 30. JANGAN BUAT PEMBAYARAN OTOMATIS

Untuk tahap awal:

jangan membuat payment gateway.

Gunakan transfer manual.

Jangan meminta:

- PIN
- OTP
- password bank
- CVV

Hanya tampilkan:

```text
nomor rekening
nama pemilik rekening
```

---

# 31. QRIS OPSIONAL

Siapkan struktur agar nantinya dapat ditambah:

```text
QRIS
```

Tetapi fitur tidak harus aktif pada versi pertama.

Config:

```ts
qris: {
  enabled: false,
  image: ""
}
```

---

# 32. ADMIN PANEL

Buat admin panel sederhana.

Route:

```text
/admin
```

Jangan tampilkan di menu publik.

Admin dapat melihat:

```text
Total RSVP

Hadir

Tidak Hadir

Belum Pasti

Total Ucapan
```

---

# 33. EDIT WEDDING DATA

Jika memungkinkan, admin panel mendukung edit:

```text
Nama calon pria
Nama calon wanita
Nama orang tua
Tanggal
Jam
Alamat
Rekening
```

Namun versi awal boleh menggunakan:

```text
wedding.ts
```

sebagai source-of-truth.

Prioritas pertama adalah website stabil.

---

# 34. ADMIN AUTH

Jangan membuat login admin plaintext.

Untuk production pilih salah satu:

```text
Cloudflare Access
```

atau authentication aman.

Rekomendasi utama:

```text
Cloudflare Access
```

melindungi:

```text
/admin/*
```

---

# 35. ANIMASI

Gunakan animasi halus.

Contoh:

```text
fade
fade-up
scale
slide-up
blur reveal
```

Gunakan:

```text
Framer Motion
```

Aturan:

```text
duration 0.4s - 0.8s
```

Jangan terlalu lambat.

Jangan animasikan semua elemen sekaligus.

---

# 36. SCROLL REVEAL

Ketika user scroll:

```text
section masuk perlahan
```

Gunakan:

```text
Intersection Observer
```

atau Framer Motion:

```text
whileInView
```

Gunakan:

```text
viewport={{ once: true }}
```

jika cocok.

---

# 37. PERFORMANCE

Target:

```text
Lighthouse Performance >= 90
Accessibility >= 90
Best Practices >= 90
SEO >= 90
```

Optimalkan:

- image
- font
- JS
- CSS
- lazy loading

---

# 38. IMAGE OPTIMIZATION

Gunakan:

```text
AVIF
WebP
```

Fallback bila diperlukan.

Gunakan:

```html
loading="lazy"
decoding="async"
```

Kecuali hero image.

Hero image boleh:

```text
preload
fetchpriority="high"
```

---

# 39. PREFERS REDUCED MOTION

Hormati:

```css
@media (prefers-reduced-motion: reduce)
```

Kurangi animasi untuk user yang mengaktifkan reduced motion.

---

# 40. ACCESSIBILITY

Pastikan:

- contrast cukup
- aria-label
- focus state
- keyboard navigation
- semantic HTML
- button benar-benar button

Jangan membuat semua clickable item memakai div.

---

# 41. SEO

Tambahkan:

```html
<title>Nama Pria & Nama Wanita | Wedding Invitation</title>
```

Meta:

```text
description
og:title
og:description
og:image
twitter:card
```

Tambahkan:

```text
favicon
```

---

# 42. OPEN GRAPH

Ketika link dibagikan ke:

- WhatsApp
- Telegram
- Facebook
- Messenger

harus mempunyai preview.

Contoh:

```text
The Wedding of
Bima & Nama Pasangan

07 Desember 2026
```

Gunakan gambar:

```text
/og-image.webp
```

---

# 43. SHARE BUTTON

Tambahkan tombol:

```text
Bagikan Undangan
```

Jika browser mendukung:

```js
navigator.share()
```

Jika tidak:

copy URL.

---

# 44. ADD TO CALENDAR

Tambahkan:

```text
Simpan ke Kalender
```

Dukung:

```text
Google Calendar
```

Opsional:

```text
ICS download
```

---

# 45. SECURITY

Semua input user wajib divalidasi.

Batasi:

```text
nama max 100
pesan max 500
jumlah tamu max 10
```

Escape output.

Jangan gunakan:

```text
dangerouslySetInnerHTML
```

untuk ucapan user.

---

# 46. RATE LIMIT

Tambahkan perlindungan sederhana untuk:

```text
POST /api/rsvp
POST /api/wishes
```

Gunakan:

- Turnstile
- IP hashing
- request validation

Jika dibutuhkan, gunakan Cloudflare Rate Limiting.

---

# 47. PRIVACY

Jangan menyimpan:

```text
password
bank PIN
OTP
CVV
```

Jangan menyimpan IP mentah jika tidak diperlukan.

Jika membutuhkan fingerprint anti-spam:

hash IP.

---

# 48. CLOUDFLARE D1 BINDING

Contoh:

```toml
[[d1_databases]]
binding = "DB"
database_name = "wedding-db"
database_id = "YOUR_DATABASE_ID"
```

Jangan hardcode ID production di source jika dapat menggunakan environment config.

---

# 49. R2 BINDING

Contoh:

```toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "wedding-assets"
```

---

# 50. ENVIRONMENT VARIABLES

Gunakan:

```text
TURNSTILE_SECRET_KEY
TURNSTILE_SITE_KEY
```

Secret jangan dimasukkan ke repository.

Gunakan Cloudflare environment secrets.

---

# 51. STRUKTUR PROJECT

Rekomendasi:

```text
/
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── music/
│   └── images/
│
├── src/
│   ├── components/
│   │   ├── Cover.tsx
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Couple.tsx
│   │   ├── Countdown.tsx
│   │   ├── Events.tsx
│   │   ├── Gallery.tsx
│   │   ├── Location.tsx
│   │   ├── RSVP.tsx
│   │   ├── Wishes.tsx
│   │   ├── Gift.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── ShareButton.tsx
│   │   └── Footer.tsx
│   │
│   ├── config/
│   │   └── wedding.ts
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── styles/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── functions/
│   └── api/
│       ├── rsvp.ts
│       └── wishes.ts
│
├── migrations/
│   └── 0001_initial.sql
│
├── wrangler.toml
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── AGENTS.md
```

---

# 52. API RSVP

Endpoint:

```text
POST /api/rsvp
```

Request:

```json
{
  "name": "Budi",
  "attendance": "hadir",
  "guestCount": 2,
  "message": "InsyaAllah hadir",
  "turnstileToken": "..."
}
```

Response:

```json
{
  "success": true,
  "message": "Konfirmasi berhasil dikirim"
}
```

---

# 53. API UCAPAN

Endpoint:

```text
POST /api/wishes
```

Request:

```json
{
  "name": "Budi",
  "message": "Semoga menjadi keluarga sakinah mawaddah warahmah.",
  "turnstileToken": "..."
}
```

---

# 54. GET UCAPAN

Endpoint:

```text
GET /api/wishes
```

Support:

```text
?page=1
&limit=20
```

Urutan:

```text
terbaru
```

Hanya:

```text
approved = 1
```

yang tampil.

---

# 55. ERROR HANDLING

Semua API harus memberikan response konsisten.

Contoh:

```json
{
  "success": false,
  "message": "Nama wajib diisi"
}
```

Jangan expose stack trace ke user.

---

# 56. LOADING STATE

Setiap form memiliki:

```text
idle
loading
success
error
```

Ketika loading:

disable button.

Contoh:

```text
Mengirim...
```

---

# 57. TOAST

Gunakan toast untuk:

```text
RSVP berhasil
Ucapan berhasil
Nomor rekening disalin
Link disalin
Error
```

Jangan menggunakan alert browser untuk UX utama.

---

# 58. MOBILE NAVIGATION

Untuk smartphone:

Header:

```text
Logo          Menu
```

Menu buka sebagai:

```text
glass drawer
```

atau:

```text
fullscreen glass menu
```

Animasi:

```text
fade + slide
```

---

# 59. MOBILE GALLERY

Mobile:

```text
2 kolom
```

Beberapa foto dapat memiliki tinggi berbeda untuk kesan editorial.

Gunakan:

```text
border-radius 16px - 24px
```

---

# 60. MOBILE BANK CARD

Pada lebar kecil:

```text
BCA
```

dan

```text
SeaBank
```

ditumpuk vertikal.

Jangan memaksa 2 kartu jika teks menjadi terlalu kecil.

---

# 61. TOUCH TARGET

Button minimal:

```text
44 × 44 px
```

Untuk smartphone.

---

# 62. SMOOTH SCROLL

Gunakan:

```css
html {
  scroll-behavior: smooth;
}
```

Tetapi hormati reduced motion.

---

# 63. SCROLLBAR

Scrollbar desktop boleh dikustomisasi secara subtle.

Jangan terlalu mencolok.

---

# 64. FOOTER

Tampilkan:

```text
Merupakan suatu kehormatan dan kebahagiaan bagi kami
apabila Bapak/Ibu/Saudara/i berkenan hadir
di hari bahagia kami.

Terima Kasih

Nama Calon Pria
&
Nama Calon Wanita
```

Tambahkan ornamen bunga.

---

# 65. COPYWRITING

Gunakan bahasa Indonesia yang:

- sopan
- elegan
- hangat
- tidak terlalu formal
- sesuai undangan pernikahan

Hindari bahasa teknis di halaman publik.

---

# 66. EMPTY STATE

Jika belum ada ucapan:

```text
Belum ada ucapan.

Jadilah yang pertama memberikan doa terbaik.
```

---

# 67. FALLBACK

Jika D1 error:

website utama tetap harus tampil.

RSVP boleh menampilkan:

```text
Maaf, konfirmasi sementara tidak tersedia.
Silakan coba beberapa saat lagi.
```

Jangan membuat seluruh website crash.

---

# 68. OFFLINE RESILIENCE

Tidak wajib PWA.

Tetapi asset utama harus cache-friendly.

Cloudflare CDN menangani caching static asset.

---

# 69. DOMAIN

Target:

```text
domain-user.com
```

Domain dikelola melalui:

```text
Cloudflare DNS
```

Custom domain diarahkan ke:

```text
Cloudflare Pages
```

---

# 70. DEPLOYMENT

Deployment utama:

```text
GitHub
→ Cloudflare Pages
→ Auto Deploy
```

Setiap push:

```text
main
```

akan deploy production.

Branch lain:

preview deployment.

---

# 71. DIRECT UPLOAD

Sediakan juga opsi:

```text
npm run build
```

output:

```text
dist/
```

Sehingga folder dapat diupload manual ke Cloudflare Pages bila diperlukan.

---

# 72. BUILD COMMAND

Contoh:

```bash
npm install
npm run build
```

Cloudflare:

```text
Build command:
npm run build

Output directory:
dist
```

---

# 73. README

Buat README yang menjelaskan:

```text
1. Instal Node
2. npm install
3. npm run dev
4. npm run build
5. setup D1
6. setup R2
7. setup Turnstile
8. deploy Cloudflare
9. setup domain
```

---

# 74. ADMIN GUIDE

Tambahkan:

```text
HOW_TO_EDIT_WEDDING.md
```

Berisi:

```text
Cara mengganti nama calon
Cara mengganti orang tua
Cara mengganti tanggal
Cara mengganti jam
Cara mengganti lokasi
Cara mengganti rekening
Cara mengganti foto
Cara mengganti musik
```

Gunakan bahasa Indonesia.

---

# 75. TESTING

Test minimal:

```text
query guest name
countdown
copy bank
RSVP validation
wishes validation
mobile menu
gallery modal
music play/pause
Google Maps link
share button
```

---

# 76. RESPONSIVE TEST

Pastikan tidak terjadi:

```text
horizontal overflow
text terpotong
bank account overflow
gallery keluar layar
navbar overflow
button terlalu kecil
```

---

# 77. PERFORMANCE TEST

Jangan load seluruh galeri pada initial render jika jumlahnya sangat banyak.

Lazy load.

---

# 78. DESIGN QUALITY

Desain harus terasa seperti:

```text
Premium wedding invitation

Bukan template gratis generik.
```

Perhatikan:

- spacing
- hierarchy
- alignment
- contrast
- typography
- visual rhythm

---

# 79. MICRO INTERACTION

Gunakan halus:

```text
button hover
card hover
copy confirmation
music pulse
gallery zoom
navigation underline
```

Mobile jangan bergantung pada hover.

---

# 80. GLASS CARD STYLE

Buat reusable:

```text
GlassCard
```

agar style konsisten.

Contoh:

```tsx
<GlassCard>
  ...
</GlassCard>
```

---

# 81. SECTION WRAPPER

Buat reusable:

```tsx
<WeddingSection
  id="gallery"
  title="Galeri"
>
```

Untuk menjaga spacing konsisten.

---

# 82. ORNAMENT COMPONENT

Buat:

```tsx
<FloralDivider />
```

atau:

```tsx
<LeafDivider />
```

Jangan menyalin markup ornamen berkali-kali.

---

# 83. BUTTON SYSTEM

Buat minimal:

```text
PrimaryButton
SecondaryButton
IconButton
```

---

# 84. RESPONSIVE DESIGN RULE

Jangan mengecilkan desain desktop ke mobile.

Mobile harus benar-benar dire-layout.

Contoh:

Desktop:

```text
Mempelai kiri | Mempelai kanan
```

Mobile:

```text
Mempelai pria

&

Mempelai wanita
```

Jika ruang tidak cukup.

---

# 85. RECOMMENDED MOBILE ORDER

```text
Cover

Hero

Nama Tamu

Tanggal

Mempelai

Countdown

Akad

Resepsi

Galeri

Lokasi

RSVP

Ucapan

Online Gift

Penutup
```

---

# 86. FUTURE FEATURE

Siapkan arsitektur untuk:

```text
Guest QR
Check-in QR
Live streaming link
QRIS
Guest analytics
Admin export CSV
Theme switcher
Multiple invitation templates
Custom domain per wedding
```

Tetapi jangan implementasikan seluruh fitur tersebut jika belum diminta.

---

# 87. DATABASE FUTURE READY

Gunakan migration.

Jangan mengubah schema secara manual tanpa migration.

---

# 88. NO LOCAL DATABASE

Dilarang menjadikan:

```text
SQLite lokal
MySQL lokal
Laragon
XAMPP
```

sebagai requirement production.

Development lokal boleh digunakan.

Production:

```text
Cloudflare D1
```

---

# 89. NO LOCAL SERVER REQUIREMENT

Website production tidak boleh bergantung pada:

```text
PC user hidup
localhost
192.168.x.x
```

---

# 90. ERROR RESILIENCE

Jika:

```text
music gagal
gallery gagal
D1 gagal
Turnstile gagal
```

bagian lain website tetap harus bekerja.

---

# 91. CODING STANDARD

Gunakan:

```text
TypeScript strict mode
```

Hindari:

```text
any
```

kecuali benar-benar diperlukan.

Gunakan interface/type.

---

# 92. LINTING

Gunakan:

```text
ESLint
```

Jika cocok tambahkan:

```text
Prettier
```

---

# 93. NAMING

Gunakan nama variable jelas:

```ts
guestName
weddingDate
accountNumber
attendanceStatus
```

Jangan:

```ts
x
tmp
abc
data2
```

---

# 94. COMMENTS

Tambahkan comment hanya untuk logika yang memang membutuhkan penjelasan.

Jangan memenuhi kode dengan komentar yang menjelaskan hal trivial.

---

# 95. FILE SIZE

Hindari komponen React > 500 baris.

Jika terlalu besar:

pecah.

---

# 96. AGENT WORKFLOW

Setiap kali mendapat tugas:

1. Baca seluruh repository.
2. Cari implementasi terkait.
3. Jangan mengubah bagian yang tidak diperlukan.
4. Buat perubahan minimal tetapi lengkap.
5. Jalankan build.
6. Perbaiki error.
7. Jalankan lint.
8. Periksa responsive.
9. Periksa TypeScript.
10. Berikan ringkasan perubahan.

---

# 97. JANGAN HANYA MEMBERI CONTOH

Jika diminta membuat fitur:

implementasikan langsung ke project.

Jangan hanya menjelaskan:

```text
Anda bisa membuat...
```

Jika agent memiliki akses edit repository:

edit file langsung.

---

# 98. JANGAN MEMBUAT MOCK FUNCTIONALITY

Jika tombol:

```text
Kirim RSVP
```

ditampilkan,

fiturnya harus berfungsi.

Jika belum tersedia backend:

jelaskan sebagai TODO yang jelas.

Prioritaskan implementasi penuh.

---

# 99. JANGAN HAPUS FITUR EXISTING

Saat melakukan revisi:

jangan merusak fungsi yang sudah bekerja.

Lakukan regression check.

---

# 100. FINAL TARGET

Hasil akhir harus berupa website undangan yang:

```text
✓ Elegant
✓ Green theme
✓ Glassmorphism
✓ Smooth
✓ Mobile-first
✓ Responsive
✓ Custom guest name
✓ Editable bride/groom information
✓ Editable parents
✓ Editable wedding date
✓ Editable time
✓ Countdown
✓ Akad
✓ Resepsi
✓ Gallery
✓ Google Maps
✓ RSVP
✓ Wishes
✓ BCA
✓ SeaBank
✓ Copy bank number
✓ Background music
✓ Share invitation
✓ Cloudflare Pages
✓ Cloudflare Worker
✓ Cloudflare D1
✓ Cloudflare R2
✓ Cloudflare Turnstile
✓ Custom domain
✓ No local server dependency
```

---

# 101. UI REFERENCE

Gunakan arah visual berikut:

```text
Premium botanical wedding
Deep green background
Soft sage cards
White roses
Green foliage
Cream typography
Gold details
Glassmorphism
Large border radius
Soft shadows
Blur effects
Smooth scrolling
Elegant serif typography
Script wedding heading
```

Desktop dan mobile harus memiliki identitas desain yang sama tetapi layout berbeda sesuai ukuran layar.

---

# 102. PRIORITAS IMPLEMENTASI

Kerjakan dalam urutan berikut:

## Phase 1

```text
Project setup
Wedding config
Theme
Cover
Hero
Mempelai
Countdown
Acara
Responsive layout
```

## Phase 2

```text
Gallery
Location
Music
Share
Gift
BCA
SeaBank
```

## Phase 3

```text
D1
RSVP
Ucapan
Turnstile
```

## Phase 4

```text
Admin
R2
Optimization
SEO
Testing
Deployment documentation
```

---

# 103. DEFINITION OF DONE

Task dianggap selesai hanya jika:

```text
npm run build
```

berhasil tanpa error.

Tidak ada TypeScript error.

Tidak ada broken import.

Tidak ada missing assets kritis.

Mobile responsive.

Desktop responsive.

Feature utama dapat digunakan.

---

# 104. OUTPUT AGENT

Setelah menyelesaikan pekerjaan, selalu berikan:

```text
Perubahan:
- ...

File dibuat:
- ...

File diubah:
- ...

Testing:
- npm run build ✓
- lint ✓

Catatan:
- ...
```

Jika ada konfigurasi Cloudflare yang harus dilakukan user, jelaskan perintah yang diperlukan secara jelas.

---

# 105. INSTRUKSI PERTAMA UNTUK CODEX

Jika repository masih kosong, langsung buat project lengkap sesuai spesifikasi ini.

Mulai dari:

```bash
npm create vite@latest .
```

gunakan:

```text
React
TypeScript
```

Kemudian install dependency yang diperlukan dan bangun website.

Jangan berhenti hanya setelah membuat struktur folder.

Lanjutkan sampai website pertama dapat dijalankan dan build berhasil.

Jika repository sudah mempunyai kode:

analisis struktur lama terlebih dahulu.

Pertahankan kode yang masih berguna.

Refactor hanya bila diperlukan.

---

# END OF AGENTS.md