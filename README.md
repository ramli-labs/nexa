# NEXA — Navigating the Future with AI

**NEXA** adalah gim edukasi literasi AI berbasis web untuk siswa SMP (Bahasa Indonesia). Pemain berperan sebagai *Future Architect* di tahun 2045. Di sana pemain merancang peran AI dalam empat simulasi, lalu melihat dunia yang terbentuk dari pilihannya.

> Tagline: **"Design the Future."**

Teknologi: **HTML/CSS/JS statis**. Tidak ada build step, backend, atau dependensi CDN (React dimuat dari salinan lokal di `js/vendor/`). **Bisa dimainkan tanpa internet** setelah dibuka sekali (PWA, lihat [Offline](#offline)). Progres dan jawaban refleksi tersimpan **hanya di perangkat pemain** (LocalStorage). Satu sesi kelas ± 40 menit.

---

## Alur gim

1. **Opening → Tujuan Pembelajaran → Tutorial** (tutorial bisa dilewati)
2. **Orbital Lab**, pusat untuk memilih modul:
   - `Modul 01 · Smart School 2045`: enam slider parameter kelas (peran AI vs guru vs siswa)
   - `Modul 02 · AI City 2045`: kebijakan kota bersama ORION (efisiensi vs privasi)
   - `Modul 03 · Future Work 2045`: alokasi 12 unit energi ke keterampilan masa depan
   - `Modul 04 · Human + AI Civilization`: pilih 6 prinsip konstitusi AI (terbuka setelah 3 modul lain selesai)
3. Setiap modul berakhir di layar **Konsekuensi**: perubahan *Future Balance* (Inovasi, Kemanusiaan, Keberlanjutan, Tanggung Jawab) dan tanggapan warga.
4. **Future Profile → Ringkasan Akhir → Refleksi & Diskusi Kelas**. Ada tombol "Salin ringkasan untuk guru".

Tidak ada jawaban benar atau salah. Gim menilai *trade-off*, bukan skor.

---

## Menjalankan secara lokal

Jalankan lewat server HTTP lokal dari folder proyek. Jangan dibuka lewat `file://`, karena runtime membaca ulang `index.html` dengan `fetch`.

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Audio baru bisa diputar setelah ada satu interaksi pengguna (kebijakan autoplay browser).

---

## Deploy ke GitHub Pages

1. Push ke branch `main`.
2. Sekali saja di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   Setelah itu workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) jalan otomatis setiap ada push. Workflow ini:
   - menjalankan `tools/cek-audio.py`, dan build gagal kalau ada audio yang hilang atau yatim;
   - hanya mengunggah berkas aplikasi (`index.html`, `game.html`, `manifest.json`, `service-worker.js`, `css/`, `js/`, `assets/`). Folder `docs/` dan `tools/` tidak ikut;
   - mengisi daftar cache offline dan versinya (ID commit) lewat `tools/siapkan-offline.py`.
3. Situs tersedia di `https://ramli-labs.github.io/nexa/`.

> Selama Source masih **"Deploy from a branch"**, seluruh isi repo tetap disajikan apa adanya dan langkah deploy di workflow akan gagal. Semua path di proyek ini relatif, jadi kedua cara sama-sama bisa menampilkan gim.

---

## Struktur folder

```
nexa/
├── index.html                  # Satu-satunya halaman: template semua layar (di dalam <x-dc>)
│                               #   + logika gim (class Component di <script data-dc-script>)
├── game.html                   # Pengalih alamat lama (…/game.html → …/)
├── manifest.json               # PWA manifest (ikon, warna)
├── service-worker.js           # Cache offline (daftar berkas & versi diisi workflow)
├── css/
│   └── main.css                # Gaya global: reset, animasi nx-*, slider, fokus, reduced-motion
├── js/
│   ├── nexa-visuals.js         # Karakter & latar SVG prosedural (web components), SFX, musik sintesis
│   ├── voice-config.js         # Registri 78 baris suara: id, tokoh, berkas, subtitle, durasi
│   ├── voice-manager.js        # Pemutar suara + subtitle per kata + fallback tanpa audio
│   ├── bgm.js                  # Musik latar prosedural: pad + progresi akor pelan per suasana layar
│   ├── tata-letak.js           # Ruang bawah layar mengikuti tinggi kotak dialog
│   ├── offline.js              # Mendaftarkan service-worker.js
│   └── vendor/
│       ├── dc-runtime.js       # Mesin template (berkas hasil generate, jangan diedit)
│       ├── react.production.min.js
│       └── react-dom.production.min.js
├── assets/
│   ├── asset-registry.json     # Titik ganti aset: isi path untuk menimpa gambar/audio bawaan
│   ├── images/                 # favicon.svg, icon-192/512/maskable-512.png, logo-*.png (header institusi),
│   │                           #   og-nexa.jpg (gambar pratinjau tautan 1200×630)
│   └── audio/voice/
│       ├── nexa/               # NARA-01, 31 berkas (edge-tts)
│       ├── mentor/             # KAIA, 8 berkas (ElevenLabs asli)
│       ├── orion/              # ORION, 2 berkas (ElevenLabs asli)
│       ├── citizen/            # Warga: pelajar, pekerja, warga senior, 30 berkas (edge-tts)
│       └── regulator/          # Delegasi Regulator, 7 berkas (edge-tts)
├── docs/
│   └── audio.md                # Suara per tokoh, pemilihan suara & QA, naskah lengkap 78 baris
├── tools/
│   ├── buat-suara.py           # Generator suara (edge-tts + ffmpeg) dari naskah di voice-config.js
│   ├── siapkan-offline.py      # Dipakai workflow: isi daftar cache & versi di service-worker.js
│   └── cek-audio.py            # Cek voice-config.js ↔ berkas audio ↔ pemakaian di index.html
└── .github/workflows/pages.yml # Deploy ke GitHub Pages
```

### Kenapa logika gim tidak dipecah ke `js/`?

`index.html` dijalankan oleh `js/vendor/dc-runtime.js`. Runtime ini membaca template `<x-dc>` dan skrip `<script type="text/x-dc" data-dc-script>` **langsung dari isi halaman**, jadi keduanya harus tetap berada di `index.html`. Konsekuensinya:

- **Jangan menulis teks tag `x-dc` di komentar HTML.** Runtime mencarinya dengan regex pada teks mentah, dan komentar seperti itu merusak render.
- Gaya per elemen memang ditulis inline. Hanya gaya global yang dipisah ke `css/main.css`.

---

## Offline

Setelah NEXA dibuka sekali saat online, seluruh situs (±6,7 MB, termasuk semua suara) tersimpan di browser. Gim tetap bisa dimainkan kalau Wi-Fi sekolah putus di tengah kelas.

- **Kode** (HTML/JS/CSS) diambil dari jaringan dulu, jadi saat online pemain selalu mendapat versi terbaru. Saat offline, kode diambil dari cache.
- **Audio dan gambar** diambil dari cache dulu, supaya cepat dan hemat kuota.
- **Tidak ada nomor versi yang perlu dinaikkan manual.** Workflow deploy mengisi `service-worker.js` dengan daftar semua berkas dan versi = ID commit. Setiap deploy membuat cache baru, dan cache lama terhapus otomatis di perangkat pemain.
- Di server lokal (`python3 -m http.server`), service worker tidak menyimpan cache apa pun, jadi tidak mengganggu pengembangan.

## Penyimpanan (LocalStorage)

| Key | Isi |
|---|---|
| `nexa_save_v2` | Progres modul, Future Balance, pilihan terkunci |
| `nexa_settings_v2` | Bisu, subtitle, volume musik/suara/SFX |
| `nexa_reflect_v2` | Jawaban refleksi siswa (tidak dikirim ke mana pun) |

---

## Audio

- Musik latar (`js/bgm.js`) dan SFX dibangkitkan di browser (Web Audio), jadi tidak ada berkas musik. Musik memakai pad lembut dengan akor yang berganti pelan dan lonceng sesekali, sekitar 13 dB di bawah suara tokoh pada volume bawaan. Detailnya ada di [`docs/audio.md`](docs/audio.md#musik-latar).
- Voice-over: **78 baris, semuanya bersuara.** Ini mencakup kotak dialog, narasi tutorial, pop-up peristiwa, kutipan warga (tombol ▶ di kartu), dan Delegasi Regulator.
  - KAIA dan ORION memakai rekaman ElevenLabs asli.
  - NARA-01, warga, dan regulator dibuat dengan edge-tts.
  - Alasan pemilihan suara, hasil QA, dan naskah lengkap ada di [`docs/audio.md`](docs/audio.md).
- Membuat ulang atau menambah suara (butuh `ffmpeg` dan `pip install edge-tts`):
  ```bash
  python3 tools/buat-suara.py      # buat berkas yang belum ada
  python3 tools/cek-audio.py       # harus OK
  ```

---

## Catatan teknis

- Diuji di Chromium versi terkini dengan satu kali main penuh dari Opening sampai Refleksi, tanpa error JavaScript maupun berkas 404. Peringatan console `<line> attribute x2: Expected length, "{{ ... }}"` saat halaman dimuat itu normal: muncul sekilas sebelum template SVG terisi.
- Responsif dari HP (360 px) sampai desktop. Di layar ≤640 px, header logo menjadi satu baris, chip profil diringkas, dan kotak dialog menjadi panel ringkas di bawah layar. Ruang bawah setiap layar mengikuti tinggi dialog (`js/tata-letak.js`), jadi tidak ada tombol yang tertutup.
- Menghormati `prefers-reduced-motion`.
- Pratinjau tautan (WhatsApp, Facebook, X) memakai tag Open Graph di `index.html`, dengan URL absolut `https://ramli-labs.github.io/nexa/`. Kalau alamat situs pindah, ubah `og:url` dan `og:image`.
