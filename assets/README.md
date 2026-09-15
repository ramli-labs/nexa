# NEXA ASSET PIPELINE

Semua aset di sini **opsional**. Kit visual (`assets/js/nexa-visuals.js`) menggambar
setiap karakter, environment, dan ikon secara prosedural (SVG + CSS) sehingga game
tetap utuh tanpa satu pun file gambar. Folder ini adalah **slot pengganti**.

## Cara mengganti aset
1. Simpan file ke folder yang sesuai memakai naming convention di bawah.
2. Isi path-nya di `assets/manifest.json`.
3. Selesai — tidak ada kode yang perlu diubah. Komponen otomatis memakai file itu.

Runtime override (untuk uji cepat):
```js
NexaAssets.set('characters.mentor.neutral', 'assets/characters/mentor/mentor-neutral.svg');
```

## Naming convention
`<kategori>-<subjek>-<varian>-<state>@<scale>.<ext>` — huruf kecil, pemisah tanda hubung.

| Kategori | Pola | Contoh |
|---|---|---|
| Character | `<nama>-<ekspresi>.svg` | `mentor-questioning.svg` |
| Citizen | `citizen-<varian>-<ekspresi>.svg` | `citizen-worker-protest.svg` |
| Environment | `env-<modul>-<layer>.webp` | `env-hub-sky.webp` |
| Icon | `ic-<nama>-24.svg` | `ic-constitution-24.svg` |
| Effect | `fx-<nama>.svg` | `fx-scanline.svg` |
| BGM | `bgm-<scene>.webm` | `bgm-hub.webm` |
| SFX | `sfx-<aksi>.webm` | `sfx-unlock.webm` |
| Voice | `vo-<karakter>-<id>.webm` | `vo-nexa-welcome.webm` |

## Spesifikasi teknis
- **Character**: SVG, viewBox 512×640 (citizen 384×480), ≤40 KB setelah SVGO.
- **Environment**: WebP q=80, lebar 2000–2400 px, ≤180 KB per plate. Layer terpisah untuk parallax.
- **Icon**: SVG 24×24, stroke 1.75 px, `currentColor`, tanpa fill.
- **Audio**: `.webm` (Opus) utama + `.m4a` fallback Safari. BGM mono 96 kbps, SFX 64 kbps, voice 80 kbps. Total ≤3 MB.
- **Font**: Orbitron (display), Manrope (body), JetBrains Mono (data) — semua OFL.

## Budget
| Kategori | Budget |
|---|---|
| Characters | ≤ 700 KB |
| Environments | ≤ 900 KB |
| Icons + effects | ≤ 60 KB |
| Audio | ≤ 3 MB |
| **Total tambahan** | **≤ 4.7 MB** |
