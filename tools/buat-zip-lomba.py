#!/usr/bin/env python3
"""Buat paket ZIP untuk Festival Biru Putih 2026 (kategori GIM Edukasi).

Mengikuti ketentuan teknis panduan (BAB III):
- index.html di root ZIP, beserta semua aset yang dipakainya;
- tanpa aset/URL eksternal, tanpa pengalihan ke halaman HTML lain (SPA);
- berjalan saat dibuka langsung dari berkas (file://) maupun dari server;
- ukuran web disarankan <= 25 MB, total ZIP (dengan panduan & video) <= 150 MB;
- wajib menyertakan panduan penggunaan (PDF) dan video demonstrasi (MP4, <= 3 menit).

Yang dibuang dari versi web: game.html (pengalih), service worker & js/offline.js,
manifest PWA beserta ikonnya, tag pratinjau tautan (URL absolut ke github.io),
dan gambar pratinjau tautan.

Pakai (dari akar repo):
    node tools/buat-pdf-lomba.js                              # PDF ke dist/ (dipakai otomatis)
    python3 tools/buat-zip-lomba.py --video "Demo.mp4"
    python3 tools/buat-zip-lomba.py            # tanpa PDF/video: hanya untuk uji, diberi peringatan
Hasil: dist/NEXA-FestivalBiruPutih.zip
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(DIST, 'NEXA-FestivalBiruPutih.zip')

KEEP_DIRS = ['css', 'js', 'assets']
DROP = {                                   # path relatif yang tidak ikut ZIP
    'js/offline.js',
    'assets/asset-registry.json.bak',
    'assets/images/og-nexa.jpg',
    'assets/images/icon-192.png',
    'assets/images/icon-512.png',
    'assets/images/icon-maskable-512.png',
}
# Baris <head> yang dibuang dari index.html versi ZIP.
DROP_HEAD = [
    r'\s*<link rel="manifest"[^>]*>\n',
    r'\s*<link rel="apple-touch-icon"[^>]*>\n',
    r'\s*<!-- Pratinjau tautan[^\n]*-->\n',
    r'\s*<meta property="og:[^>]*>\n',
    r'\s*<meta name="twitter:[^>]*>\n',
    r'\s*<script defer src="js/offline\.js"></script>\n',
]
# URL yang boleh tertinggal karena hanya teks, bukan sesuatu yang dimuat.
URL_OK = [
    r'http://www\.w3\.org/',                               # namespace SVG/XML
    r'https://reactjs\.org/docs/error-decoder\.html',      # teks pesan error di pustaka React
]
MB = 1024 * 1024


def build_web(dst):
    shutil.copy2(os.path.join(ROOT, 'index.html'), dst)
    for d in KEEP_DIRS:
        for base, _, files in os.walk(os.path.join(ROOT, d)):
            for f in files:
                src = os.path.join(base, f)
                rel = os.path.relpath(src, ROOT).replace(os.sep, '/')
                if rel in DROP:
                    continue
                os.makedirs(os.path.join(dst, os.path.dirname(rel)), exist_ok=True)
                shutil.copy2(src, os.path.join(dst, rel))
    p = os.path.join(dst, 'index.html')
    html = open(p, encoding='utf-8').read()
    for pat in DROP_HEAD:
        html = re.sub(pat, '\n', html)
    html = re.sub(r'\n{3,}', '\n\n', html)
    open(p, 'w', encoding='utf-8').write(html)


def check(dst, problems, notes):
    html = open(os.path.join(dst, 'index.html'), encoding='utf-8').read()
    # 1. hanya satu halaman HTML (SPA, tanpa pengalihan)
    htmls = [os.path.relpath(os.path.join(b, f), dst) for b, _, fs in os.walk(dst) for f in fs if f.endswith('.html')]
    if htmls != ['index.html']:
        problems.append('Ada halaman HTML selain index.html: %s' % htmls)
    # 2. semua rujukan lokal ada
    for ref in re.findall(r'(?:src|href)="([^"#?]+)', html):
        if re.match(r'[a-z]+:', ref) or '{{' in ref:
            continue
        if not os.path.exists(os.path.join(dst, ref)):
            problems.append('Rujukan tidak ditemukan: ' + ref)
    # 3. tidak ada URL eksternal
    for base, _, files in os.walk(dst):
        for f in files:
            if not f.endswith(('.html', '.js', '.css', '.json', '.svg')):
                continue
            path = os.path.join(base, f)
            for url in set(re.findall(r'https?://[^\s"\'<>)]+', open(path, encoding='utf-8', errors='ignore').read())):
                rel = os.path.relpath(path, dst)
                if any(re.match(ok, url) for ok in URL_OK):
                    notes.add('%s: %s (hanya teks, tidak dimuat)' % (rel, url.split('?')[0]))
                else:
                    problems.append('URL eksternal di %s: %s' % (rel, url))
    # 4. ukuran web
    size = sum(os.path.getsize(os.path.join(b, f)) for b, _, fs in os.walk(dst) for f in fs)
    if size > 25 * MB:
        problems.append('Ukuran web %.1f MB (disarankan <= 25 MB)' % (size / MB))
    return size


def main():
    ap = argparse.ArgumentParser(description='Buat ZIP NEXA untuk Festival Biru Putih 2026.')
    ap.add_argument('--panduan', help='PDF panduan penggunaan (wajib untuk pengumpulan)')
    ap.add_argument('--prompting', help='PDF dokumen desain & prompting (wajib bila memakai aset AI)')
    ap.add_argument('--video', help='MP4 video demonstrasi, maks. 3 menit (wajib untuk pengumpulan)')
    args = ap.parse_args()
    # Bawaan: PDF hasil tools/buat-pdf-lomba.js di dist/, bila ada.
    for attr, name in (('panduan', 'Panduan Penggunaan NEXA.pdf'), ('prompting', 'Dokumen Desain dan Prompting NEXA.pdf')):
        if not getattr(args, attr) and os.path.isfile(os.path.join(DIST, name)):
            setattr(args, attr, os.path.join(DIST, name))

    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'cek-audio.py')], stdout=subprocess.DEVNULL):
        sys.exit('cek-audio.py gagal: perbaiki audio dulu (jalankan tools/cek-audio.py).')

    problems, notes, warnings = [], set(), []
    with tempfile.TemporaryDirectory() as tmp:
        web = os.path.join(tmp, 'web')
        os.makedirs(web)
        build_web(web)
        web_size = check(web, problems, notes)

        extra = []
        for flag, path, name, ext in (('--panduan', args.panduan, 'Panduan Penggunaan NEXA.pdf', '.pdf'),
                                      ('--prompting', args.prompting, 'Dokumen Desain dan Prompting NEXA.pdf', '.pdf'),
                                      ('--video', args.video, 'Video Demonstrasi NEXA.mp4', '.mp4')):
            if not path:
                warnings.append('Belum ada %s (wajib untuk pengumpulan, pakai %s).' % (name, flag))
            elif not os.path.isfile(path) or not path.lower().endswith(ext):
                problems.append('%s bukan berkas %s: %s' % (flag, ext, path))
            else:
                extra.append((path, name))
        if args.video and os.path.isfile(args.video):
            try:
                dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                                     '-of', 'default=nw=1:nk=1', args.video]))
                if dur > 180:
                    problems.append('Video %.0f detik (maksimal 3 menit).' % dur)
            except (OSError, subprocess.CalledProcessError, ValueError):
                warnings.append('Durasi video tidak bisa diperiksa (ffprobe tidak ada).')

        if problems:
            print('GAGAL:')
            for p in problems:
                print('  -', p)
            sys.exit(1)

        os.makedirs(DIST, exist_ok=True)
        with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
            for base, _, files in os.walk(web):
                for f in sorted(files):
                    full = os.path.join(base, f)
                    z.write(full, os.path.relpath(full, web).replace(os.sep, '/'))
            for path, name in extra:
                z.write(path, name)

    total = os.path.getsize(OUT)
    print('OK: %s' % os.path.relpath(OUT, ROOT))
    print('  web %.1f MB, ZIP total %.1f MB (batas 150 MB)' % (web_size / MB, total / MB))
    print('  index.html di root, satu halaman (SPA), tanpa URL eksternal yang dimuat')
    for n in sorted(notes):
        print('  catatan:', n)
    for w in warnings:
        print('  PERINGATAN:', w)
    if total > 150 * MB:
        sys.exit('GAGAL: ZIP melebihi 150 MB.')


if __name__ == '__main__':
    main()
