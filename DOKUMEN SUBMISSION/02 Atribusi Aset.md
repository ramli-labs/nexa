# NEXA — Dokumen Atribusi Aset
**Navigating the Future with AI** · Festival Biru Putih 2026
Diperbarui: 14 September 2026 · Mekanika: NEXA v2.1 (beku)

---

## 1. Ringkasan Kepatuhan

| Kriteria | Status |
|---|---|
| Dependensi eksternal saat dijalankan | **Tidak ada** — `index.html` sepenuhnya mandiri |
| URL aset eksternal | **Tidak ada** — seluruh aset tertanam di dalam berkas |
| Aset berlisensi pihak ketiga | **Tidak ada** foto/ilustrasi/musik stok |
| Aset audio | **100% disintesis** saat aplikasi berjalan (Web Audio API) |
| Grafik & ilustrasi | **100% dibuat sendiri** dengan HTML/CSS/SVG |
| Logo institusi | Disediakan oleh penyelenggara/instansi, dipakai tanpa modifikasi |

---

## 2. Logo Institusi

Keempat logo diberikan dalam bentuk berkas resmi dan **tidak diubah**: tanpa perubahan warna, tanpa distorsi, tanpa efek glow/bayangan, proporsi asli dipertahankan (hanya diskalakan proporsional pada tinggi tetap).

| Berkas dalam proyek | Logo | Sumber berkas asli | Penempatan |
|---|---|---|---|
| `assets/logo-kemendikdasmen.png` | Kementerian Pendidikan Dasar dan Menengah (Tut Wuri Handayani) | `Tutwuri 3.png` | Header kiri — 56 px (penuh) / 36 px (ringkas) |
| `assets/logo-pendidikan-bermutu.png` | #Pendidikan Bermutu Untuk Semua | `Logo-02.png` | Header kanan, posisi 1 — 34 px / 20 px |
| `assets/logo-ramah.png` | Kemendikdasmen RAMAH | `Logo-03.png` | Header kanan, posisi 2 — 34 px / 20 px |
| `assets/logo-sobat-smp.png` | Sobat SMP | `Logo Sobat SMP 2025.png` | Header kanan, posisi 3 — 38 px / 23 px |

**Hak:** seluruh hak atas logo di atas dimiliki oleh Kementerian Pendidikan Dasar dan Menengah Republik Indonesia dan program terkait. Logo dipakai semata untuk menandai konteks penyelenggaraan festival pendidikan.

---

## 3. Tipografi

| Keluarga | Peran | Sumber & lisensi |
|---|---|---|
| Orbitron | Judul, label sistem, angka | Google Fonts — SIL Open Font License 1.1 |
| Inter | Isi teks, dialog, subtitle | Google Fonts — SIL Open Font License 1.1 |
| Bahnschrift / DIN Alternate / system-ui | Fallback judul | Font sistem operasi |
| system-ui / Segoe UI / Helvetica / Arial | Fallback isi | Font sistem operasi |

Pada berkas mandiri `index.html`, font dimuat melalui tumpukan fallback sistem sehingga aplikasi tetap tampil benar **tanpa koneksi internet**. Tidak ada berkas font berlisensi terbatas yang didistribusikan ulang.

---

## 4. Grafik, Ilustrasi, dan Ikon

Seluruh elemen visual di bawah ini **dibuat sendiri** menggunakan kode (HTML, CSS, SVG inline) — tidak ada gambar raster pihak ketiga, tidak ada ikon dari pustaka luar.

| Elemen | Teknik |
|---|---|
| Wordmark NEXA | Tipografi + gradien CSS `background-clip: text` |
| Bumi holografis | `radial-gradient` + `repeating-linear-gradient` + `box-shadow` inset |
| Cincin Future Balance | SVG `<circle>` dengan `stroke-dasharray` dinamis |
| Radar Future Balance | SVG `<polygon>` dihitung dari nilai dimensi |
| Segel NEXA (6 segmen) | SVG `<path>` busur yang dihitung secara trigonometris |
| Panggung Smart School | SVG `<circle>`/`<line>` yang dihasilkan dari parameter |
| Kota AI City | Div bertumpuk + `radial-gradient` jendela + kabut CSS |
| Konstelasi Future Work | Div lingkaran + SVG garis penghubung |
| Karakter NARA-01 | Bentuk geometris CSS (belah ketupat, cincin orbit, inti) |
| Karakter ORION | Lingkaran + pola titik `radial-gradient` berputar |
| Karakter KAIA | Bentuk plakat CSS bergaris (placeholder resmi untuk art final) |
| Lencana & emblem | Lingkaran CSS + label teks, tanpa gambar |
| Latar ambien | Grid CSS beranimasi + gradien radial |

**Catatan produksi:** NEXA Production Design Bible menyediakan slot berukuran tetap bila art final ingin ditambahkan di kemudian hari; versi yang disubmit berjalan penuh tanpa aset gambar tambahan.

---

## 5. Audio

Tidak ada berkas audio yang didistribusikan. Seluruh bunyi **dibangkitkan saat aplikasi berjalan** memakai Web Audio API.

| Kategori | Teknik |
|---|---|
| Musik latar (12 identitas layar) | Pad osilator (`sine`/`triangle`/`square`/`sawtooth`) + low-pass filter ber-LFO + arpeggio terjadwal |
| Klik & konfirmasi | Dua nada naik, envelope eksponensial |
| Slider | Tik granular yang nadanya mengikuti nilai parameter |
| Unit energi | Nada pendek 980 Hz |
| Kunci desain | Akor empat nada (C–E–G–C) |
| Proyeksi simulasi | Dua denyut rendah 180 Hz |
| Segel konstitusi | Nada dasar rendah + shimmer |
| Hasil akhir | Swell lima nada 3,5 detik |
| Suara karakter | `SpeechSynthesis` peramban (`id-ID`), pitch & rate berbeda per karakter |

Suara karakter memakai mesin sintesis suara milik peramban/sistem operasi pengguna — tidak ada rekaman suara pihak ketiga yang disertakan.

---

## 6. Pustaka & Kode

| Komponen | Keterangan |
|---|---|
| Kerangka kerja | React (runtime tertanam di dalam berkas mandiri) |
| Pustaka UI pihak ketiga | Tidak ada |
| Pustaka grafik/animasi | Tidak ada — animasi memakai CSS `@keyframes` dan SVG |
| Pustaka audio | Tidak ada — Web Audio API native |
| Logika permainan, rumus, naskah | **Dibuat sendiri sepenuhnya** |

---

## 7. Konten Naratif & Edukatif

Seluruh naskah dialog (NARA-01, KAIA, ORION), pertanyaan prinsip konstitusi, teks konsekuensi, refleksi, poin literasi AI, peristiwa proyeksi simulasi, dan pertanyaan diskusi kelas **ditulis sendiri** untuk proyek ini dalam Bahasa Indonesia dengan tingkat keterbacaan jenjang SMP.

**Pernyataan integritas data:** NEXA tidak menampilkan statistik dunia nyata. Semua angka, metrik, dan peristiwa adalah keluaran model simulasi yang disederhanakan dari parameter yang diatur pemain, dan diberi label **"PROYEKSI SIMULASI"** beserta keterangan bahwa itu bukan data dunia nyata.

---

## 8. Daftar Berkas yang Disubmit

```
index.html                          Aplikasi mandiri (buka berkas ini)
NEXA Game.dc.html                   Berkas sumber permainan
assets/                             4 logo institusi
DOKUMEN SUBMISSION/
  01 Panduan Pengguna.md
  02 Atribusi Aset.md               (dokumen ini)
  03 Dokumentasi Prompt AI.md
  04 Storyboard Video 3 Menit.md
```
