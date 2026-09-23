#!/usr/bin/env python3
"""Isi service-worker.js di folder situs hasil build dengan daftar berkas dan versi.

Dipanggil workflow deploy setelah folder _site disusun:
    python3 tools/siapkan-offline.py _site <versi>

- PRECACHE = './' + semua berkas di folder situs (kecuali service-worker.js
  dan .nojekyll), jadi berkas baru otomatis ikut tanpa perlu dicatat manual.
- VERSION  = <versi> (workflow memakai 7 karakter pertama ID commit), jadi
  setiap deploy membuat cache baru dan cache lama dihapus pemain otomatis.
"""
import json
import pathlib
import sys


def main():
    if len(sys.argv) != 3:
        sys.exit('Pakai: python3 tools/siapkan-offline.py <folder-situs> <versi>')
    site, version = pathlib.Path(sys.argv[1]), sys.argv[2]
    sw = site / 'service-worker.js'
    files = sorted(p.relative_to(site).as_posix() for p in site.rglob('*')
                   if p.is_file() and p.name not in ('service-worker.js', '.nojekyll'))
    urls = ['./'] + ['./' + f for f in files]

    src = sw.read_text(encoding='utf-8')
    for old, new in (("var VERSION = '__NEXA_VERSION__';", "var VERSION = '%s';" % version),
                     ("var PRECACHE = [];   // diisi workflow deploy", 'var PRECACHE = %s;' % json.dumps(urls))):
        if old not in src:
            sys.exit('Penanda tidak ditemukan di service-worker.js: ' + old)
        src = src.replace(old, new, 1)
    sw.write_text(src, encoding='utf-8')

    size = sum((site / f).stat().st_size for f in files)
    print('Cache offline versi %s: %d berkas, %.1f MB' % (version, len(urls), size / 1e6))


if __name__ == '__main__':
    main()
