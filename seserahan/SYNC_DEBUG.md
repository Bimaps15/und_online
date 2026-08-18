# 📖 Panduan Sinkronisasi & Diagnostik (SYNC_DEBUG.md)
### Budget & Seserahan Nikah — Bima & Alviana

Dokumen ini berisi spesifikasi teknis, arsitektur sinkronisasi dua arah, prosedur pengujian, dan troubleshooting untuk integrasi Website ↔ Google Sheets.

---

## 1. Identitas Sistem & Konfigurasi

| Komponen | Nilai / Keterangan |
| :--- | :--- |
| **Layanan** | `budget-nikah` |
| **URL Web App Utama** | `https://script.google.com/macros/s/AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA/exec` |
| **Deployment ID** | `AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA` |
| **Google Spreadsheet ID** | `1ywAdLLC6lxJY41Mp_HCqrX6RVgZq4iRqq_EPFGSqvdY` |
| **Target Sheet ID (gid)** | `167218541` (Wajib ada dan dilindungi) |
| **Endpoint Website** | `https://bimalvi.my.id/seserahan` |
| **Debug Mode** | `https://bimalvi.my.id/seserahan?debug=1` |

---

## 2. Arsitektur 2-Way Sync Engine

```text
[ Google Sheet (gid=167218541) ]
           ▲
           │ LockService + SpreadsheetApp.flush() + bumpRevision()
           ▼
[ Google Apps Script (Code.gs) ]
           ▲
           │ GET ?action=read (JSONP) / POST ?action=save (Form + Iframe)
           ▼
[ Sync Engine Frontend ]
   ├── Single POST
   ├── Real Write Verification (Memantau kenaikan server revision)
   └── Conflict Avoidance Polling (Skip jika client isDirty/saving)
           ▲
           ▼
[ Local Cache (localStorage) + UI ]
```

---

## 3. Cara Menerapkan Kode Apps Script (`Code.gs`)

1. Buka project Apps Script Anda di [script.google.com](https://script.google.com/).
2. Buka file **`Code.gs`**, hapus seluruh kode lama, dan gantikan dengan isi file [`seserahan/Code.gs`](file:///C:/Users/HRD/Documents/ASS_ADOBE/und_online/seserahan/Code.gs).
3. Klik tombol **Save 💾 (Ctrl+S)**.
4. Di pojok kanan atas, klik **Deploy** ➔ **Manage deployments (Kelola penerapan)**.
5. Klik ikon **Pensil ✏️ (Edit)** di kanan atas modal.
6. Pada dropdown **Version**, pilih **New version (Versi baru)**.
7. Pastikan:
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone` (Siapa saja)
8. Klik **Deploy** ➔ Klik **Done**.

---

## 4. Cara Menguji Endpoint Backend

### A. Health Check Test
Buka browser dan akses:
```
https://script.google.com/macros/s/AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA/exec?action=health
```
**Ekspektasi Output:**
```json
{
  "ok": true,
  "service": "budget-nikah",
  "deployment": "AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA",
  "spreadsheetId": "1ywAdLLC6lxJY41Mp_HCqrX6RVgZq4iRqq_EPFGSqvdY",
  "sheetId": 167218541,
  "sheetName": "Seserahan",
  "revision": 1,
  "serverTime": "..."
}
```

### B. Read Data Test
Akses:
```
https://script.google.com/macros/s/AKfycby2AP0iagIOiYp4NrBixm0Fg9ZUfjgj2_PtADhqdEtU83Saiw6ddBBsRVDqifR-u_EwdA/exec?action=read
```
Memuat seluruh 58 item dari kolom A–E (Seserahan), G–J (Catering), dan L–O (Perlengkapan Seserahan) beserta revisi saat ini.

---

## 5. Cara Mengakses Panel Diagnostik (Frontend Debugger)

Tambahkan parameter `?debug=1` pada URL di browser:
👉 **`https://bimalvi.my.id/seserahan?debug=1`**

Panel diagnostik di bagian bawah akan menampilkan status real-time:
- **CONNECTION**: ONLINE / OFFLINE
- **SYNC STATE**: IDLE / SAVING / VERIFYING / SYNCED / ERROR
- **CLIENT REVISION vs SERVER REVISION**
- **LAST PULL & LAST PUSH TIMESTAMPS**
- **LAST ERROR DETAILS**

---

## 6. Cara Melihat Execution Log di Apps Script

1. Masuk ke dashboard Apps Script.
2. Di menu sidebar kiri, klik menu **Executions (Eksekusi)** (ikon grafik/daftar).
3. Anda dapat melihat daftar setiap permintaan `doGet` dan `doPost`, durasi eksekusi, serta log `Logger.log` secara langsung.

---

## 7. Acceptance Test Matrix

| No | Uji Skenario | Langkah Pengujian | Kriteria Lolos (PASS) |
| :--- | :--- | :--- | :--- |
| 1 | **Read dari Sheet** | Ubah nama atau harga item di Sheet secara langsung | Saat website di-refresh atau polling (12s), data baru muncul di website. |
| 2 | **Edit Seserahan** | Klik *Edit harga* pada "Cincin Emas 22k 1gr", ubah harga & simpan | Status berubah *Menyimpan...* ➔ *Tersimpan ke Sheet*, sel di kolom D sheet terupdate. |
| 3 | **Status Lunas (Sudah)** | Klik *Update bayar*, isi lunas (misal `2.500.000`) | Sel di Kolom C berubah menjadi "Sudah". |
| 4 | **Status Belum** | Klik *Update bayar*, isi `0` | Sel di Kolom C berubah menjadi "Belum". |
| 5 | **Edit Catering** | Edit item catering (misal "Catering Nasi") | Sel di Kolom G–J catering terupdate di spreadsheet. |
| 6 | **Edit Perlengkapan** | Edit item "Box Kardus" | Sel di Kolom L–O terupdate di spreadsheet. |
| 7 | **Refresh Persist** | Refresh browser setelah edit | Perubahan tetap bertahan (tidak reset ke cache lama). |
| 8 | **Anti-Overwrite Polling** | Buka web, lakukan edit | Polling 12 detik tidak menimpa form yang sedang diedit. |
| 9 | **Multi Device Sync** | HP 1 mengubah data | HP 2 menerima data baru dalam 1 cycle polling. |
| 10 | **Offline / Error Handling** | Ubah URL jadi salah | Status UI menampilkan *Gagal sinkron* secara jujur. |
