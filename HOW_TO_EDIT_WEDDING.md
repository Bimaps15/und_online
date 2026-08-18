# Cara Mengedit Data Undangan

Semua data utama berada di `src/config/wedding.ts`. Edit nilai di antara tanda kutip, simpan, lalu jalankan `npm run build`.

## Data pasangan dan acara

- `groom` dan `bride`: ubah `name`, `shortName`, `father`, `mother`, `instagram`, serta `photo`.
- Kosongkan `instagram` menjadi `''` jika tidak digunakan.
- `wedding.isoDate` harus berformat zona waktu, contoh `2026-12-07T08:00:00+07:00`, karena dipakai countdown.
- Pada `akad` dan `reception`, ubah hari, tanggal, jam, lokasi, alamat, dan link Google Maps.

## Rekening, foto, dan musik

- Pada `banks`, ubah nama bank, nomor rekening, dan nama pemilik.
- Simpan foto teroptimasi di `public/images/`, idealnya WebP/AVIF 800–1400 px, lalu ubah path config.
- Tambahkan lagu berizin sebagai `public/music/wedding-song.mp3` atau ubah `music.src`.

## Moderasi

Set `MODERATE_WISHES=true` jika ucapan harus disetujui sebelum tampil. Default `false`.

## Periksa hasil

```bash
npm run lint
npm run build
```

Uji lebar 360, 390, 414, 768 px dan desktop. Uji nama tamu dengan `/?to=Bapak%20Budi%20Santoso`.
