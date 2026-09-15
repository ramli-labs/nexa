/* ============================================================================
   NEXA — Google Cloud TTS batch generator (Node.js, tanpa dependensi)

   Menjalankan seluruh 45 baris di assets/js/voiceConfig.js lewat Cloud
   Text-to-Speech dan menulis mp3 langsung ke folder yang dibaca game.

   Cara pakai (dari root project):
     export GOOGLE_TTS_KEY="AIza..."        # Windows: set GOOGLE_TTS_KEY=AIza...
     node assets/audio/voice/_google_tts.mjs
     node assets/audio/voice/_google_tts.mjs --tier=standard --only=nexa
     node assets/audio/voice/_google_tts.mjs --force     # timpa file yang sudah ada

   Butuh Node 18+ (fetch bawaan). Tidak menimpa file yang sudah ada kecuali --force.
============================================================================ */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const KEY = process.env.GOOGLE_TTS_KEY || '';
const args = process.argv.slice(2);
const arg = (n, d) => (args.find((a) => a.startsWith('--' + n + '=')) || '').split('=')[1] || d;
const TIER = arg('tier', 'wavenet');
const ONLY = arg('only', '');
const FORCE = args.includes('--force');

if (!KEY) {
  console.error('\n  GOOGLE_TTS_KEY belum diset.\n  export GOOGLE_TTS_KEY="AIza..."\n');
  process.exit(1);
}

/* muat voiceConfig.js + tts-tools.js di sandbox (keduanya menulis ke window) */
const sandbox = { window: {}, atob: (b) => Buffer.from(b, 'base64').toString('binary'), console, Blob: class {}, DataView, Uint8Array, Uint32Array, TextEncoder, fetch };
vm.createContext(sandbox);
for (const f of ['assets/js/voiceConfig.js', 'assets/js/tts-tools.js']) {
  vm.runInContext(readFileSync(resolve(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const CFG = sandbox.window.NexaVoiceConfig;
const TTS = sandbox.window.NexaTTS;

let lines = CFG.all();
if (ONLY) lines = lines.filter((l) => CFG.characters[l.character].folder === ONLY || l.character === ONLY.toUpperCase());

console.log(`\n  NEXA voice over · ${lines.length} baris · tier ${TIER}\n`);

let ok = 0, skip = 0, fail = 0;

for (const line of lines) {
  const out = resolve(ROOT, line.audio.replace('./', ''));
  if (existsSync(out) && !FORCE) { skip++; console.log(`  · skip   ${line.id}`); continue; }

  const s = TTS.voiceFor(line, TIER);
  const body = {
    input: { text: line.subtitle },
    voice: { languageCode: 'id-ID', name: s.voice },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: s.rate,
      sampleRateHertz: 24000,
      effectsProfileId: ['headphone-class-device'],
      ...(s.pitch ? { pitch: s.pitch } : {})
    }
  };

  try {
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'HTTP ' + res.status);

    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(json.audioContent, 'base64'));
    ok++;
    console.log(`  ✓ ${line.id.padEnd(26)} ${s.voice.replace('id-ID-', '')} ${s.rate}x`);
  } catch (err) {
    fail++;
    console.log(`  ✗ ${line.id.padEnd(26)} ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 120));
}

console.log(`\n  selesai — ${ok} dibuat · ${skip} dilewati · ${fail} gagal`);
console.log('  verifikasi: buka game, konsol browser, VoiceManager.audit()\n');
