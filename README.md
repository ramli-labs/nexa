# NEXA — Navigating the Future with AI

Gim edukasi literasi AI berbasis web. Empat modul simulasi tahun 2045: Smart School, AI City, Future Work, dan Konstitusi Manusia + AI.

## Cara menjalankan di GitHub Pages

1. Buat repository baru di GitHub (public).
2. Upload **seluruh isi folder ini** ke root repository (bukan foldernya, tapi isinya: `index.html`, `game.html`, `support.js`, `assets/`, `.nojekyll`).
3. Buka **Settings → Pages**.
4. Pada *Source* pilih **Deploy from a branch**, branch `main`, folder `/ (root)`. Simpan.
5. Tunggu 1–2 menit. Gim tersedia di `https://<username>.github.io/<nama-repo>/`.

> File `.nojekyll` wajib ada agar GitHub Pages tidak memfilter folder aset.

## Cara menjalankan lokal

Karena gim memuat skrip dan audio lewat path relatif, jalankan melalui server lokal (bukan klik dua kali):

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur

```
index.html                     pembungkus halaman (memuat game.html)
game.html                      mesin gim: semua layar, dialog, logika penilaian
support.js                     runtime pendukung template
assets/js/nexa-visuals.js      karakter & latar SVG prosedural, musik sintesis
assets/js/voiceConfig.js       peta dialog → berkas suara
assets/js/voice-manager.js     pemutar suara + sinkronisasi subtitle
assets/audio/voice/            45 rekaman suara (nexa, mentor, citizen, orion, regulator)
assets/logo-*.png              logo institusi pada header
assets/manifest.json           registri aset
```

## Catatan teknis

- Musik latar dibangkitkan secara sintesis di browser (Web Audio), tidak ada berkas musik.
- Audio memerlukan satu interaksi pengguna terlebih dahulu (kebijakan autoplay browser).
- Diuji pada Chrome, Edge, dan Safari versi terkini; lebar layar minimum yang nyaman ±920 px.
- Menghormati `prefers-reduced-motion` untuk pengguna yang menonaktifkan animasi.
