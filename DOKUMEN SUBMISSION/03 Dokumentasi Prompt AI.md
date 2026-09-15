# NEXA — Dokumentasi Prompt Aset AI
**Navigating the Future with AI** · Festival Biru Putih 2026
Mekanika: NEXA v2.1 (beku) · Referensi: NEXA Production Design Bible

---

## 1. Status Penggunaan AI Generatif dalam Submission

**Penting untuk dewan juri:** versi yang disubmit **tidak memuat satu pun gambar hasil AI generatif**. Seluruh visual dibangun dengan kode (HTML/CSS/SVG) — lihat *02 Atribusi Aset*.

Dokumen ini berfungsi sebagai **dokumentasi transparansi dan rencana produksi**: bila art final ingin ditambahkan pada pengembangan lanjutan, prompt di bawah inilah yang akan dipakai, sehingga sumber setiap aset dapat dilacak sejak awal.

| Kategori | Status dalam submission |
|---|---|
| Karakter (NARA-01, KAIA, ORION) | Bentuk geometris CSS/SVG — placeholder resmi |
| Lingkungan (5 environment) | Gradien & grid CSS |
| Ikon, lencana, emblem | Bentuk CSS/SVG |
| Prompt di dokumen ini | **Belum dieksekusi** — rencana fase art |

---

## 2. Suffix Gaya Wajib

Setiap prompt di bawah harus diakhiri dengan blok berikut agar seluruh aset berada dalam satu semesta visual:

```
— clean sci-fi, optimistic advanced future, cyan (#17D9FF) and violet (#7657FF)
light on deep navy (#071426), translucent holographic panels, soft volumetric glow,
key light upper-left in accent colour, warm white rim light, cinematic lighting,
no text, no neon clutter, no dystopian mood, educational simulation game concept art
```

**Rasio:** `16:9` untuk latar & sinematik · `3:4` untuk potret · `1:1` untuk bust, ikon, lencana.

**Larangan global:** tanpa estetika cyberpunk jalanan, tanpa HUD militer, tanpa dashboard korporat, tanpa nuansa distopia, tanpa merah (warna milik produk ADIL dalam semesta yang sama).

---

## 3. Prompt Karakter

### 3.1 NARA-01 — Pemandu Simulasi AI
```
Elegant holographic AI presence, semi-abstract figure: a luminous warm-white core
suspended inside a tall floating cyan diamond of polarised glass, two thin tilted
orbital rings of cyan and violet light, a minimal energy mask suggesting a calm
serene face, geometric light structures, self-illuminated, graceful and approachable,
not a robot, no mechanical joints, memorable simple silhouette
```
**Varian state yang diperlukan:** idle · speaking · analyzing · warning · affirmation
**Rasio:** 3:4 (hero), 1:1 (bust & close-up)

### 3.2 KAIA — Mentor Manusia
```
Young Indonesian woman future architect in her late twenties, warm confident
approachable smile, minimalist futuristic collarless long outer layer in warm white
and soft grey matte technical fabric with very subtle emissive seams, thin smart
glasses, holding a translucent holographic tablet, warm golden key light from upper
left, white rim light, clearly human and welcoming, no armour, no formal suit
```
**Varian:** full body · teaching pose · reflection pose · simulation interaction · concerned
**Rasio:** 3:4 (hero), 1:1 (bust), 2:3 (full body)

### 3.3 ORION — Kecerdasan Skala Kota
```
City-scale artificial intelligence visualised as a vast luminous sphere composed of
thousands of connected green-cyan light nodes and thin connection lines, volumetric
haze, hovering above and partly through a futuristic city, casting soft green light
down onto the buildings, distributed network intelligence, infrastructural and
powerful, completely faceless, no body, no limbs, calm not threatening
```
**Varian:** passive · active · proposing · recalculating · system alert
**Rasio:** 1:1 (utama), 16:9 (overlay kota)

---

## 4. Prompt Lingkungan

### 4.1 NEXA Orbital Lab Hub
```
Premium futuristic simulation laboratory interior, circular room with no hard walls,
dark glass floor reflecting light, ceiling open to space with a faint grid, a large
holographic Earth floating at the centre surrounded by four concentric data rings,
four translucent module capsules hovering left and right, volumetric cyan and violet
light, mission-control-meets-planetarium, wide eye-level shot, dark empty edges
```
**Batas teknis:** area kolom kiri & kanan **wajib kosong** (tempat kartu modul UI).

### 4.2 Smart School 2045
```
Bright hopeful future classroom in 2045, students collaborating in small movable
clusters with a human teacher clearly present and engaged, soft holographic learning
maps floating above the desks, glass wall opening to tropical greenery, light timber
and acoustic fabric surfaces, warm daylight from the left mixed with gentle cyan
hologram light, isometric wide view, calm uncluttered centre
```
**Aturan pedagogis:** guru **tidak boleh** digambarkan tergantikan AI — guru selalu hadir dan aktif.

### 4.3 Future Work Lab
```
Futuristic human-potential laboratory, tall dark hall, a floating constellation of
glowing skill nodes connected by thin light threads suspended in mid-air, branching
career pathways receding into depth as light trails, faint violet grid floor, the
room is lit only by the nodes themselves, energetic yet thoughtful, no bright
background points
```

### 4.4 AI City 2045
```
Aerial digital twin of a green tropical futuristic Indonesian city at dusk, layered
semi-transparent data overlays for transport energy and privacy, glowing traffic flow
lines at street level, rooftop gardens, clean river, elevated transit lines, soft
green light cast from above by a network intelligence, navy-to-cyan horizon gradient,
expansive system-level view, empty sky in the upper centre
```
**Batas teknis:** langit atas-tengah kosong (tempat sfera ORION).

### 4.5 Constitution Chamber
```
Solemn circular holographic council chamber, no hierarchical seating and no podium,
six tall standing planes of light arranged in a ring, a forming golden digital seal
hovering at the centre of the dark stone floor, single shaft of warm gold light from
an open dome revealing a starfield, cyan and violet ambient palette with gold
ceremonial accent, vast empty reflective space, deeply emotional and reverent
```
**Catatan diferensiasi:** dilarang menyerupai ruang sidang — tanpa podium, tanpa meja tinggi, tanpa ikonografi hukum.

---

## 5. Prompt Latar UI & Sinematik

| Nama | Rasio | Prompt |
|---|---|---|
| UI background · Hub | 16:9 | `Abstract dark simulation-lab backdrop, circular reflective glass floor, faint space grid overhead, volumetric cyan haze, completely empty centre and empty left/right thirds reserved for interface, no focal object` |
| UI background · School | 16:9 | `Soft-focus bright future classroom seen from a distance, warm daylight and gentle cyan hologram glow, quiet uncluttered centre, low detail suitable for 50% opacity behind interface` |
| UI background · City | 16:9 | `Dusk sky gradient from deep navy to cyan horizon over a distant clean river valley, no buildings in the upper centre, subtle atmospheric haze, low contrast` |
| Sinematik · Opening | 16:9 | `Wide establishing shot of a hopeful 2045 world at dawn: a tropical futuristic city, wind and solar arrays, elevated transit, students walking to school, soft volumetric light, a sense of a future worth designing` |
| Sinematik · Seal | 16:9 | `Close cinematic shot of a golden holographic seal completing itself from six glowing arc segments around a luminous diamond core, dark reflective floor, shaft of warm light from above, solemn and reverent` |

---

## 6. Prompt Ikon, Lencana, dan Emblem

| Nama | Format | Prompt |
|---|---|---|
| Ikon modul ×4 | SVG 48 px | `Minimal futuristic line icons on a 24px grid, 1.5px stroke, rounded 2px corners, monoline: a holographic book for education, a layered city block for the city, a branching skill constellation for work, a ringed seal for civilisation` |
| Ikon Future Balance ×4 | SVG 32 px | `Four minimal monoline symbols on a 24px grid: an upward spark for innovation, an open hand outline for humanity, a leaf-in-circle for sustainability, an eye-in-diamond for responsibility, 1.5px stroke, currentColor` |
| Lencana modul ×4 | SVG 128 px | `Circular completion badge, thin glowing ring with a small geometric glyph at the centre, single accent colour on transparent background, readable at 32px, no gradients, no text` |
| Emblem ending ×5 | SVG 256 px | `Five ceremonial emblems built from the same geometry language: a four-point radar polygon inside a ring, each variant differing only in polygon shape and single accent colour — cyan optimizer, gold guardian, green balancer, violet accelerator, lilac explorer` |
| Frame avatar pemain | SVG | `Thin conic-gradient ring frame, cyan to violet to green to gold, 2px stroke, transparent interior, futuristic and minimal` |

---

## 7. Prosedur Verifikasi Aset AI (bila dieksekusi)

1. **Konsistensi semesta** — bandingkan dengan suffix gaya; tolak hasil yang memakai palet atau pencahayaan berbeda.
2. **Cek pedagogis** — Smart School wajib menampilkan guru aktif; Constitution Chamber tidak boleh menyerupai ruang sidang.
3. **Cek keterbacaan UI** — latar wajib lolos uji tampil pada opacity 0,5 di belakang antarmuka.
4. **Cek proyektor** — periksa pada 1280×720 dengan kontras rendah.
5. **Pencatatan** — simpan prompt final, nama model, tanggal, dan versi berkas untuk setiap aset yang dihasilkan pada tabel pelacakan di dokumen ini.

| Berkas aset | Prompt (§) | Model | Tanggal | Status |
|---|---|---|---|---|
| — | — | — | — | Belum ada aset AI dalam submission |
