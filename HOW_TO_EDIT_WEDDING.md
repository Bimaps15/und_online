ï»¿# Cara Mengedit Data Undangan

Semua data utama berada di `src/config/wedding.ts`. Edit nilai di antara tanda kutip, simpan, lalu jalankan `npm run build`.

## Data pasangan dan acara

- `groom` dan `bride`: ubah `name`, `shortName`, `father`, `mother`, `instagram`, serta `photo`.
- Kosongkan `instagram` menjadi `''` jika tidak digunakan.
- `wedding.isoDate` harus berformat zona waktu, contoh `2026-12-07T08:00:00+07:00`, karena dipakai countdown.
- Pada `akad` dan `reception`, ubah hari, tanggal, jam, lokasi, alamat, dan link Google Maps.

## Kisah Cinta

- Melalui Admin (`/admin`): buka tab **Kisah Cinta**. Setiap slide memiliki kolom **Heading / Judul Slide** (contoh: *Awal Pertemuan*) dan **Isi Kalimat**. Anda dapat menambah slide baru dengan tombol **Tambah Kalimat**, mengubah urutan dengan tombol **Naik** dan **Turun**, atau menghapus dengan tombol **Hapus**.
- **Format Teks (Bold, Italic, Underscore)**: Anda dapat memodifikasi teks dengan menyorot (blok) kata yang diinginkan pada kolom kalimat, lalu mengklik tombol **Bold** (`<b>`), **Italic** (`<i>`), atau **Underscore** (`<u>`). Pratinjau hasil format langsung tampil di bawah kolom input. Format markdown seperti `**teks**`, `*teks*`, dan `__teks__` juga didukung secara otomatis.
- Tekan **Simpan Perubahan** untuk menyimpan ke server/penyimpanan lokal. Kolom yang kosong akan otomatis diabaikan. Jika seluruh kalimat dihapus, bagian Kisah Cinta pada undangan otomatis disembunyikan. Jika hanya ada 1 kalimat, teks ditampilkan tanpa kontrol slider.
- Melalui file konfigurasi: ubah array `loveStory` pada `src/config/wedding.ts`. Setiap elemen berupa objek `{ title?: 'Judul Slide', content: 'Isi cerita' }`.

## Rekening, foto, dan musik

- Pada `banks`, ubah nama bank, nomor rekening, dan nama pemilik.
- Simpan foto teroptimasi di `public/images/`, idealnya WebP/AVIF 800â€“1400 px, lalu ubah path config.
- Tambahkan lagu berizin sebagai `public/music/wedding-song.mp3` atau ubah `music.src`.

## Video opening

Simpan video portrait 9:16 di `public/video/bimalvi.mp4`. URL-nya diatur melalui `openingVideo.src` pada `src/config/wedding.ts` (default `/video/bimalvi.mp4`). Ganti file atau URL tersebut, lalu build dan deploy ulang. Video diputar sekali tanpa suara setelah klik Buka Undangan; musik undangan tetap memakai `music.src`. Setelah video selesai, dilewati, atau gagal diputar, halaman utama terbuka otomatis.

## Moderasi ucapan

Set `MODERATE_WISHES=true` jika ucapan harus disetujui sebelum tampil. Default `false`.

## Nama tamu dari link pribadi

Gunakan `/amat`, `/amat-saputra`, atau format lama `/?to=Bapak%20Budi%20Santoso`. Cover, konfirmasi kehadiran, ucapan, dan popup RSVP memakai identitas yang sama. Nama pada formulir hanya bisa dibaca. Tanpa nama valid, formulir meminta tamu membuka link pribadi dan pengiriman dinonaktifkan.

Jika tabel D1 `guests` memiliki `guest_slug` yang cocok, `guest_name` menjadi nama tampilan. Jika belum terdaftar, nama dirapikan dari URL. Backend mencocokkan link halaman asal (header `Referer` dengan origin yang sama) dan membaca ulang data tamu, lalu mengabaikan nama kiriman formulir. Jangan menambahkan kebijakan `no-referrer` pada permintaan formulir. Link ini bukan login; siapa pun yang memiliki link tamu dapat menggunakannya.

Tidak ada migration baru untuk fitur ini; gunakan tabel `guests` dari migration awal. Deploy frontend dan Pages Functions bersama agar `/api/guest`, `/api/rsvp`, dan `/api/wishes` menggunakan aturan yang sama.

## Pemeriksaan

```bash
npm run lint
npm run build
```

Uji lebar 360, 390, 414, 768 px dan desktop. Uji nama tamu dengan `/?to=Bapak%20Budi%20Santoso`.
