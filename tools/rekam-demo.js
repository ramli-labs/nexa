#!/usr/bin/env node
/* ============================================================================
   NEXA — rekam video demonstrasi untuk paket lomba (≤ 3 menit, MP4 1920×1080)

   Perekaman layar Playwright tidak membawa suara, sedangkan musik latar dan
   efek NEXA dibangkitkan langsung di browser (Web Audio). Karena itu campuran
   suara direkam dari DALAM halaman: semua AudioContext diarahkan ke satu
   konteks bersama, setiap <audio> (suara tokoh) disambungkan ke konteks itu,
   lalu keluarannya direkam MediaRecorder. Hasilnya persis yang didengar pemain.
   Gambar dan suara lalu digabung dengan ffmpeg.

   Gim harus disajikan lewat HTTP (bukan file://): dari file://, suara berkas
   tidak bisa disambungkan ke Web Audio (aturan asal/origin browser).

   Persiapan: npm i --no-save playwright@1 && npx playwright install chromium
              ffmpeg terpasang
   Pakai (dari akar repo):
       python3 -m http.server 8765 &
       node tools/rekam-demo.js [http://localhost:8765/]
   Hasil: dist/Video Demonstrasi NEXA.mp4
============================================================================ */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), WORK = path.join(DIST, 'rekaman');
const URL = process.argv[2] || 'http://localhost:8765/';
const OUT = path.join(DIST, 'Video Demonstrasi NEXA.mp4');
const W = 1280, H = 720;                        // direkam 720p (tulisan terbaca), diperbesar ke 1080p saat encode
const jeda = ms => new Promise(r => setTimeout(r, ms));

// Dijalankan di halaman sebelum skrip gim.
function perekamSuara() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const bus = ctx.createGain();
  const rec = ctx.createMediaStreamDestination();
  bus.connect(ctx.destination); bus.connect(rec);
  Object.defineProperty(ctx, 'destination', { value: bus });   // gim menyambung ke "destination" = bus
  const Shared = function () { return ctx; };
  Shared.prototype = AC.prototype;
  window.AudioContext = window.webkitAudioContext = Shared;

  const tersambung = new WeakSet(), play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!tersambung.has(this)) { tersambung.add(this); try { ctx.createMediaElementSource(this).connect(bus); } catch (e) {} }
    if (ctx.state === 'suspended') ctx.resume();
    return play.apply(this, arguments);
  };

  const potongan = [], mr = new MediaRecorder(rec.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 192000 });
  mr.ondataavailable = e => { if (e.data.size) potongan.push(e.data); };
  window.__rekam = {
    mulai: () => { if (ctx.state === 'suspended') ctx.resume(); mr.start(1000); return Date.now(); },
    selesai: () => new Promise(res => {
      mr.onstop = async () => {
        const buf = new Uint8Array(await new Blob(potongan, { type: 'audio/webm' }).arrayBuffer());
        let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        res(btoa(s));
      };
      mr.stop();
    })
  };
}

async function rekam() {
  fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK, { recursive: true });
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: WORK, size: { width: W, height: H } } });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await ctx.addInitScript(perekamSuara);
  const errs = [];
  const p = await ctx.newPage();
  const t0 = Date.now();                       // video mulai bersama halaman
  p.on('pageerror', e => errs.push(e.message));

  // Kursor bergerak pelan supaya terlihat di video.
  const arah = async el => {
    await el.scrollIntoViewIfNeeded().catch(() => {});
    const k = await el.boundingBox(); if (!k) return;
    await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2, { steps: 5 }); await jeda(120);
  };
  // Cari tombol dalam satu panggilan ke halaman (jauh lebih cepat daripada membaca teks tiap tombol).
  const tombol = async re => {
    for (let n = 0; n < 30; n++) {
      const ok = await p.evaluate(([src, fl]) => {
        const re = new RegExp(src, fl);
        document.querySelectorAll('[data-rek]').forEach(e => e.removeAttribute('data-rek'));
        const bt = [...document.querySelectorAll('button')].find(b => !b.disabled && b.offsetParent !== null && re.test(b.innerText.trim()));
        if (bt) bt.setAttribute('data-rek', '1');
        return !!bt;
      }, [re.source, re.flags]);
      if (ok) return p.locator('[data-rek="1"]').first();
      await jeda(150);
    }
    throw new Error('tombol ' + re);
  };
  const log = m => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(6), m);
  // Tombol dicari ulang setelah kursor tiba: template gim bisa menggambar ulang elemennya.
  const klik = async (re, tunggu = 1200) => {
    await arah(await tombol(re));
    for (let n = 0; ; n++) { try { await (await tombol(re)).click({ timeout: 2000 }); break; } catch (e) { if (n > 3) throw e; await jeda(200); } }
    await jeda(tunggu);
  };
  const lewati = async () => { const bt = p.locator('button:visible', { hasText: /^\s*LEWATI\s*$/ }).first(); if (await bt.count()) { await arah(bt); await bt.click().catch(() => {}); await jeda(500); } };
  const tutupPopup = async () => { const bt = await p.$('button[aria-label="Tutup"]:visible'); if (bt) { await arah(bt); await bt.click().catch(() => {}); await jeda(600); } };
  const lihat = async teks => { const el = p.getByText(teks, { exact: false }).first(); if (await el.count()) await arah(el); };
  const atas = () => p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  // Menggeser slider ke nilai tujuan secara bertahap, dengan kursor di atasnya.
  const geser = async (i, ke, ms = 1600) => {
    const r = p.locator('input[type=range]').nth(i); await arah(r);
    const dari = +(await r.inputValue()), langkah = 8;
    for (let s = 1; s <= langkah; s++) {
      const v = Math.round(dari + (ke - dari) * s / langkah);
      await r.evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
      await jeda(ms / langkah);
    }
  };

  await p.goto(URL, { waitUntil: 'load' });
  await jeda(1800);
  const awal = (Date.now() - t0) / 1000;       // bagian kosong saat memuat, dipotong nanti
  const mulaiSuara = await p.evaluate(() => window.__rekam.mulai());

  // 1. Laman muka: judul, tujuan pembelajaran, tombol
  log('1. Laman muka: judul, tujuan pembelajaran, tombol');
  await jeda(2500); await lihat('TUJUAN'); await jeda(2500);
  // 2. Tujuan pembelajaran + NARA-01 menyapa
  log('2. Tujuan pembelajaran + NARA-01 menyapa');
  await klik(/^MULAI/, 5000);
  // 3. Cara bermain (tutorial bersuara)
  log('3. Cara bermain (tutorial bersuara)');
  await klik(/CARA BERMAIN/, 3500);
  await klik(/^LANJUT/, 2500); await klik(/^LANJUT/, 2500); await klik(/^LANJUT/, 2000);
  await klik(/MASUK KE LAB/, 3500);
  // 4. Misi 01 · Smart School: slider, pop-up peristiwa, konsekuensi
  log('4. Misi 01 · Smart School: slider, pop-up peristiwa, konsekuensi');
  await klik(/Smart School/, 3500); await lewati();
  await geser(0, 100, 1200); await geser(3, 0, 1200);
  await jeda(6000); await tutupPopup();
  await geser(1, 85, 1000); await jeda(1000);
  await klik(/KUNCI DESAIN/, 2500); await lewati();
  await lihat('SUARA WARGA'); await jeda(800);
  const kartu = await p.$('button[aria-label="Dengarkan kutipan warga"]');
  if (kartu) { await arah(kartu); await p.click('button[aria-label="Dengarkan kutipan warga"]'); await jeda(3500); }
  // 5. Misi 02 · AI City bersama ORION
  log('5. Misi 02 · AI City bersama ORION');
  await klik(/KEMBALI KE LAB/, 1500); await klik(/AI City/, 4500); await lewati();
  await geser(0, 90, 1000); await geser(1, 85, 1000); await jeda(3000); await tutupPopup();
  await klik(/TERAPKAN/, 2500); await lewati(); await jeda(800);
  // 6. Misi 03 · Future Work: membagi 12 unit energi
  log('6. Misi 03 · Future Work: membagi 12 unit energi');
  await klik(/KEMBALI KE LAB/, 1500); await klik(/Future Work/, 3000); await lewati(); await atas();
  for (let i = 0; i < 12; i++) {
    const plus = p.locator('button:visible:enabled', { hasText: /^\s*\+\s*$/ });
    const n = await plus.count(); if (!n) break;
    const bt = plus.nth((i * 3) % n); await arah(bt); await bt.click().catch(() => {}); await jeda(150);
  }
  await tutupPopup(); await jeda(1000);
  await klik(/KUNCI EKOSISTEM/, 2000); await lewati();
  // 7. Misi 04 · Konstitusi AI dan Delegasi Regulator
  log('7. Misi 04 · Konstitusi AI dan Delegasi Regulator');
  await klik(/KEMBALI KE LAB/, 1500); await klik(/Konstitusi/, 3500); await lewati();
  for (const t of ['Manusia, dengan analisis', 'Individu; layanan', 'Urusan yang menyangkut', 'Dalam batas yang', 'Alasan tiap keputusan', 'Memverifikasi dan']) await klik(new RegExp('^' + t), 700);
  await jeda(1000);
  await klik(/SEGEL KONSTITUSI/, 2500); await klik(/LIHAT DUNIA/, 2500); await lewati(); await atas(); await jeda(1500);
  // 8. Uji Pemahaman: satu jawaban keliru (umpan balik), sisanya tepat
  log('8. Uji Pemahaman: satu jawaban keliru (umpan balik), sisanya tepat');
  await klik(/UJI PEMAHAMAN/, 2000); await lewati();
  const jawab = [/^A\s*Kreativitas siswa/, /^A\s*Efisiensi kota naik/, /^D\s*Agar warga bisa memahami/, /^B\s*Empati dan komunikasi/, /^C\s*Memeriksa ulang/];
  for (let k = 0; k < jawab.length; k++) {
    await klik(jawab[k], k === 0 ? 3500 : 700);
    await klik(k < jawab.length - 1 ? /SOAL BERIKUTNYA/ : /LIHAT SKOR/, k < jawab.length - 1 ? 400 : 3000);
  }
  // 9. Hasil akhir dan refleksi
  log('9. Hasil akhir dan refleksi');
  await klik(/HASIL AKHIR/, 3000); await lewati(); await atas(); await jeda(1000);
  await klik(/REFLEKSI/, 1500); await lewati(); await atas();
  const ta = p.locator('textarea').first();
  if (await ta.count()) { await arah(ta); await ta.pressSequentially('AI boleh membantu, tetapi keputusan penting tetap diambil manusia.', { delay: 20 }); }
  await jeda(800); await klik(/SALIN RINGKASAN/, 2500);

  const b64 = await p.evaluate(() => window.__rekam.selesai());
  const akhir = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(WORK, 'suara.webm'), Buffer.from(b64, 'base64'));
  await ctx.close(); await b.close();
  const webm = path.join(WORK, fs.readdirSync(WORK).find(f => f.endsWith('.webm') && f !== 'suara.webm'));
  return { webm, suara: path.join(WORK, 'suara.webm'), awal, akhir, geserSuara: (mulaiSuara - t0) / 1000, errs };
}

(async () => {
  const r = await rekam();
  const durasi = r.akhir - r.awal;
  const tundaSuara = Math.max(0, r.geserSuara - r.awal);
  console.log(`rekaman ${durasi.toFixed(1)} dtk (awal kosong ${r.awal.toFixed(1)} dtk dipotong), suara mulai +${tundaSuara.toFixed(2)} dtk`);
  if (r.errs.length) console.log('PERINGATAN error halaman:', r.errs.join(' | '));
  // Batas lomba 3 menit. Bila sedikit lewat, percepat gambar & suara bersama (atempo: nada tidak berubah).
  const laju = durasi > 176 ? durasi / 176 : 1;
  if (laju > 1.15) throw new Error(`rekaman ${durasi.toFixed(0)} dtk terlalu panjang; kurangi jeda di skrip`);
  if (laju > 1) console.log(`dipercepat ${laju.toFixed(3)}× agar ≤ 3 menit`);
  const hasil = durasi / laju;
  const ms = Math.round(tundaSuara * 1000);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-ss', r.awal.toFixed(3), '-i', r.webm, '-i', r.suara,
    '-filter_complex', `[1:a]adelay=${ms}|${ms},apad,atrim=0:${durasi.toFixed(3)},atempo=${laju.toFixed(4)},afade=t=in:d=0.5,afade=t=out:st=${(hasil - 1.5).toFixed(3)}:d=1.5,alimiter=limit=0.95[a];` +
      `[0:v]setpts=PTS/${laju.toFixed(4)},scale=1920:1080:flags=lanczos,fade=t=in:d=0.6,fade=t=out:st=${(hasil - 1.2).toFixed(3)}:d=1.2[v]`,
    '-map', '[v]', '-map', '[a]', '-t', hasil.toFixed(3),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '20', '-preset', 'veryfast',
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  console.log('OK:', path.relative(ROOT, OUT));
})().catch(e => { console.error('GAGAL:', e.message); process.exit(1); });
