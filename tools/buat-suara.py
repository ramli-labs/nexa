#!/usr/bin/env python3
"""Generator voice-over NEXA (edge-tts + ffmpeg).

Naskah diambil dari js/voice-config.js (satu sumber kebenaran): id, karakter,
berkas, dan teks subtitle. Setelah berkas dibuat, kolom `duration` baris itu
di voice-config.js diperbarui dengan durasi yang sebenarnya.

Karakter yang dibuat di sini: NEXA (NARA-01), CITIZEN (pelajar / pekerja /
warga senior), REGULATOR. KAIA (MENTOR) dan ORION TIDAK disentuh: berkasnya
rekaman ElevenLabs asli dan tidak ada suara edge-tts yang cukup mirip
(lihat docs/audio.md, bagian "Pemilihan suara").

Pakai (dari akar repo):
    python3 tools/buat-suara.py                  # buat berkas yang belum ada
    python3 tools/buat-suara.py --semua          # buat ulang semua (NEXA, warga, regulator)
    python3 tools/buat-suara.py --id nexa_event_s1,regulator_ready

Butuh: ffmpeg, pip install edge-tts
Catatan: edge-tts memakai layanan text-to-speech Microsoft Edge, jadi teks
naskah dikirim ke internet dan butuh koneksi.
"""
import argparse
import asyncio
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, 'js', 'voice-config.js')
AUDIO = os.path.join(ROOT, 'assets', 'audio', 'voice')

# Efek pasca-produksi (filter ffmpeg), dijalankan setelah hening dipangkas.
FX_NARA = 'highpass=f=90,highshelf=f=4000:g=2,aecho=0.8:0.88:23|41:0.10|0.06'   # "AI": terang + plate tipis
FX_HALL = 'highpass=f=70,aecho=0.8:0.8:60|95:0.14|0.09'                          # ruang aula

# Setelan suara. Dipilih lewat uji Whisper (kejelasan) + resemblyzer (beda antar tokoh).
# Hanya suara penutur asli id-ID / su-ID: suara jv-ID mengubah "saya" jadi "soyo",
# ms-MY berlogat Malaysia, suara multilingual berlogat asing.
PRESETS = {
    'NEXA':            dict(voice='id-ID-ArdiNeural',   rate=10,  pitch=0,   fx=FX_NARA),
    'REGULATOR':       dict(voice='su-ID-JajangNeural', rate=-8,  pitch=-12, fx=FX_HALL),
    'CITIZEN:student': dict(voice='id-ID-GadisNeural',  rate=10,  pitch=20,  fx='highpass=f=80'),
    'CITIZEN:worker':  dict(voice='su-ID-JajangNeural', rate=0,   pitch=0,   fx='highpass=f=70'),
    'CITIZEN:elder':   dict(voice='su-ID-TutiNeural',   rate=-12, pitch=-15, fx='highpass=f=70'),
}

# Warna emosi: geseran kecil tempo (%) dan nada (Hz) di atas preset.
EMOTION = {
    'protest': (6, 4), 'confused': (-6, 0), 'relieved': (-3, 0), 'hopeful': (0, 3),
    'warning': (-4, -2), 'pressing': (4, 0), 'skeptical': (-3, 0), 'acknowledging': (-4, 0),
}

# Ejaan ucapan: teks subtitle -> teks yang dibacakan TTS (regex). Diuji dengan Whisper:
# "AI" apa adanya terdengar "ai" menyatu (seperti "pantai"); "é-ai" terdengar "AI".
UCAPAN = [
    (r'\bAI\b', 'é-ai'),
    (r'Simulation Lab', 'Simulésyen Lab'),
    (r'#DataKami', 'tagar Data Kami'),
    (r'trade-off', 'tred-of'),
]

# Kekerasan disamakan dengan rekaman ElevenLabs KAIA/ORION yang tetap dipakai
# (terukur -22,9 s/d -20,5 LUFS, rata-rata -21,8).
TARGET_LUFS = -22.0

HEAD_SILENCE = 0.12
TAIL_SILENCE = 0.08


def read_config():
    src = open(CONFIG, encoding='utf-8').read()
    folders = dict(re.findall(r"(\w+): \{\s*label: '[^']*',\s*folder: '(\w+)'", src))
    pat = re.compile(r"L\('([a-z0-9_]+)', '([A-Z]+)', '([a-z]+)', '([^']+)',\s*"
                     r"'((?:[^'\\]|\\.)*)', ([0-9.]+)")
    lines = []
    for m in pat.finditer(src):
        lines.append(dict(id=m[1], char=m[2], emo=m[3], file=m[4],
                          text=m[5].replace("\\'", "'"), folder=folders[m[2]]))
    return src, lines


def preset_for(line):
    if line['char'] == 'CITIZEN':
        variant = line['id'].split('_')[2]
        return PRESETS['CITIZEN:' + variant]
    return PRESETS.get(line['char'])


def spoken(text):
    for a, b in UCAPAN:
        text = re.sub(a, b, text)
    return text


async def synth(line, cfg, out, sem):
    import edge_tts
    dr, dp = EMOTION.get(line['emo'], (0, 0))
    rate, pitch = cfg['rate'] + dr, cfg['pitch'] + dp
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(spoken(line['text']), cfg['voice'],
                                           rate='%+d%%' % rate, pitch='%+dHz' % pitch).save(out)
                return
            except Exception as e:  # layanan kadang menolak sesaat
                if attempt == 3:
                    raise
                await asyncio.sleep(2 + attempt * 2)


def lufs(path):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', err)[-1])


def encode(src, dst, fx):
    """Pangkas hening, beri efek, samakan kekerasan (dua tahap), lalu encode mp3."""
    trim = ('silenceremove=start_periods=1:start_silence=%g:start_threshold=-45dB,areverse,'
            'silenceremove=start_periods=1:start_silence=%g:start_threshold=-45dB,areverse'
            % (HEAD_SILENCE, TAIL_SILENCE))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    mid = dst + '.tmp.wav'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-i', src, '-af', ','.join(f for f in (trim, fx) if f),
                           '-ac', '1', '-ar', '44100', '-y', mid])
    gain = TARGET_LUFS - lufs(mid)
    subprocess.check_call(['ffmpeg', '-v', 'error', '-i', mid,
                           '-af', 'volume=%.2fdB,alimiter=limit=0.89:level=false' % gain,
                           '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-y', dst])
    os.remove(mid)


def duration(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                   '-of', 'default=nw=1:nk=1', path])
    return float(out)


def main():
    ap = argparse.ArgumentParser(description='Buat voice-over NEXA dari js/voice-config.js.')
    ap.add_argument('--semua', action='store_true', help='buat ulang semua berkas yang punya preset')
    ap.add_argument('--id', help='daftar id dipisah koma')
    args = ap.parse_args()

    src, lines = read_config()
    wanted = set(args.id.split(',')) if args.id else None
    todo = []
    for l in lines:
        cfg = preset_for(l)
        dst = os.path.join(AUDIO, l['folder'], l['file'])
        if wanted is not None:
            if l['id'] not in wanted:
                continue
            if not cfg:
                sys.exit('%s tidak punya preset (rekaman ElevenLabs asli), tidak dibuat ulang.' % l['id'])
        elif not cfg or (os.path.exists(dst) and not args.semua):
            continue
        todo.append((l, cfg, dst))

    if not todo:
        print('Tidak ada yang perlu dibuat.')
        return

    with tempfile.TemporaryDirectory() as tmp:
        sem = asyncio.Semaphore(4)
        raws = {l['id']: os.path.join(tmp, l['id'] + '.mp3') for l, _, _ in todo}

        async def run():
            await asyncio.gather(*(synth(l, cfg, raws[l['id']], sem) for l, cfg, _ in todo))
        asyncio.run(run())

        for l, cfg, dst in todo:
            encode(raws[l['id']], dst, cfg['fx'])
            d = round(duration(dst), 1)
            src = re.sub(r"(L\('%s',[^)]*?'(?:[^'\\]|\\.)*',\s*)[0-9.]+" % re.escape(l['id']),
                         lambda m: m.group(1) + ('%.1f' % d), src, count=1)
            print('%-28s %5.1f s  %s' % (l['id'], d, os.path.relpath(dst, ROOT)))

    with open(CONFIG, 'w', encoding='utf-8') as f:
        f.write(src)
    print('\n%d berkas dibuat; durasi di js/voice-config.js diperbarui.' % len(todo))


if __name__ == '__main__':
    main()
