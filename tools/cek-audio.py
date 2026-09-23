#!/usr/bin/env python3
"""Cek konsistensi voice-over NEXA.

Membandingkan tiga sumber:
  1. js/voice-config.js           -> daftar baris suara (id, karakter, berkas)
  2. assets/audio/voice/**        -> berkas audio yang benar-benar ada
  3. index.html                   -> baris yang benar-benar dipanggil gim:
                                     nara/kaia/orion/sayAside('id'), string 'id' utuh,
                                     atau awalan dinamis seperti 'nexa_event_' + id

Jalankan dari akar repo:
    python3 tools/cek-audio.py

Keluar dengan kode 1 jika ada masalah: berkas hilang, berkas yatim (tidak
terdaftar), id dipakai gim tapi tidak terdaftar, atau baris terdaftar tapi
tidak pernah dipakai.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = ROOT / "js" / "voice-config.js"
GAME = ROOT / "index.html"
AUDIO = ROOT / "assets" / "audio" / "voice"
EXTS = {".mp3", ".webm", ".ogg", ".m4a", ".wav"}


def main():
    cfg = CONFIG.read_text(encoding="utf-8")
    folders = dict(re.findall(r"(\w+): \{\s*label: '[^']*',\s*folder: '(\w+)'", cfg))
    lines = re.findall(r"L\('([a-z0-9_]+)', '([A-Z]+)', '[a-z]+', '([^']+)'", cfg)
    if not lines:
        sys.exit("Tidak menemukan baris L(...) di js/voice-config.js")

    expected = {}
    for vid, char, fname in lines:
        expected[vid] = AUDIO / folders[char] / fname

    game = GAME.read_text(encoding="utf-8")
    # Dipanggil langsung: nara('id'), kaia('id'), orion('id'), sayAside('id'), atau string 'id' utuh.
    direct = set(re.findall(r"\b(?:nara|kaia|orion|sayAside)\('([a-z0-9_]+)'\s*[,)]", game))
    literals = set(re.findall(r"'([a-z]+_[a-z0-9_]*[a-z0-9])'", game))
    # Dirangkai dinamis: 'nexa_event_' + id, 'regulator_count_' + n, 'citizen_' + ...
    prefixes = set(re.findall(r"'([a-z]+_(?:[a-z0-9_]*_)?)'\s*\+", game))
    used = direct | {v for v in expected if v in literals or any(v.startswith(p) for p in prefixes)}
    on_disk = {p for p in AUDIO.rglob("*") if p.suffix.lower() in EXTS}

    missing = sorted(vid for vid, p in expected.items() if not p.exists())
    orphans = sorted(on_disk - set(expected.values()))
    unregistered = sorted(direct - set(expected))
    unused = sorted(set(expected) - used)

    print(f"Baris terdaftar : {len(expected)}")
    print(f"Dipakai gim     : {len(used)}")
    print(f"Berkas audio    : {len(on_disk)}")

    def section(title, items, fmt=str):
        print(f"\n{title}: {len(items)}")
        for it in items:
            print("  -", fmt(it))

    section("Belum ada audio (berkas hilang)", missing,
            lambda v: f"{v}  ->  {expected[v].relative_to(ROOT)}")
    section("Berkas yatim (tidak terdaftar di voice-config.js)", orphans,
            lambda p: p.relative_to(ROOT))
    section("Dipakai gim tapi tidak terdaftar", unregistered)
    section("Terdaftar tapi tidak dipakai gim", unused)

    problems = missing or orphans or unregistered or unused
    print("\nHASIL:", "ADA MASALAH" if problems else "OK — semua baris dialog punya audio dan terpakai.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
