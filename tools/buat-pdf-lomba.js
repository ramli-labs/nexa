#!/usr/bin/env node
/* ============================================================================
   NEXA — buat PDF untuk paket lomba (Festival Biru Putih 2026)

   1. Mengambil tangkapan layar terbaru langsung dari gim (file://index.html,
      1280x720 = 16:9, plus satu tampilan HP 390x844).
   2. Mengisi naskah suara dari js/voice-config.js.
   3. Mencetak dokumen di docs/lomba/ (panduan, desain & prompting, pemetaan
      CP/TP, atribusi aset, surat pernyataan) ke PDF di dist/. Isian yang
      hanya diketahui pengembang diambil dari docs/lomba/isian.json.

   Persiapan: npm i --no-save playwright@1 && npx playwright install chromium
   Pakai (dari akar repo):  node tools/buat-pdf-lomba.js
   Hasil: dist/*.pdf (lima berkas)
============================================================================ */
const fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist'), WORK = path.join(DIST, 'pdf-src');
const GAME = 'file://' + path.join(ROOT, 'index.html');

async function shots(b) {
  const img = path.join(WORK, 'gambar'); fs.mkdirSync(img, { recursive: true });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(GAME); await p.waitForTimeout(2500);
  const snap = async n => { await p.waitForTimeout(700); await p.screenshot({ path: path.join(img, n + '.png') }); };
  const click = async re => { for (const bt of await p.$$('button:visible:enabled')) { if (re.test((await bt.innerText()).trim())) { await bt.click(); await p.waitForTimeout(900); return; } } throw new Error('tombol ' + re); };
  const skip = async () => { for (const bt of await p.$$('button:visible')) if ((await bt.innerText()).trim() === 'LEWATI') { await bt.click(); await p.waitForTimeout(400); return; } };
  const top = () => p.evaluate(() => window.scrollTo(0, 0));
  const view = async sel => { await p.evaluate(s => { const e = [...document.querySelectorAll('div')].find(d => d.innerText.trim().startsWith(s)); if (e) e.scrollIntoView({ block: 'center' }); }, sel); };

  await snap('01-laman-muka');
  await click(/^MULAI/); await top(); await snap('02-tujuan');
  await click(/CARA BERMAIN/); await top(); await snap('03-tutorial');
  await click(/^LANJUT/); await click(/^LANJUT/); await click(/^LANJUT/); await click(/MASUK KE LAB/); await snap('04-orbital-lab');
  await click(/Smart School/); await skip(); await top(); await snap('05-modul-01');
  await p.evaluate(() => { const r = [...document.querySelectorAll('input[type=range]')]; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; [[0, 100], [3, 0]].forEach(([i, v]) => { set.call(r[i], String(v)); r[i].dispatchEvent(new Event('input', { bubbles: true })); }); });
  await p.waitForTimeout(1200); await top(); await snap('06-peristiwa');
  await p.evaluate(() => { const b = document.querySelector('button[aria-label="Tutup"]'); if (b) b.click(); });
  await click(/KUNCI DESAIN/); await skip(); await view('SUARA WARGA SIMULASI'); await snap('07-konsekuensi');
  await click(/KEMBALI KE LAB/); await click(/AI City/); await skip(); await top(); await snap('08-modul-02');
  await click(/TERAPKAN/); await click(/KEMBALI KE LAB/); await click(/Future Work/); await skip();
  for (let i = 0; i < 30; i++) { const bs = await p.$$('button:visible:enabled'); let ok = false; for (const bt of bs) if (/KUNCI EKOSISTEM/.test(await bt.innerText())) { ok = true; break; } if (ok) break; for (const bt of bs) if ((await bt.innerText()).trim() === '+') { await bt.click(); break; } await p.waitForTimeout(80); }
  await p.evaluate(() => { const b = document.querySelector('button[aria-label="Tutup"]'); if (b) b.click(); });
  await top(); await snap('09-modul-03');
  await click(/KUNCI EKOSISTEM/); await click(/KEMBALI KE LAB/); await click(/Konstitusi/); await skip();
  for (const t of ['Manusia, dengan analisis', 'Individu; layanan', 'Urusan yang menyangkut']) await click(new RegExp('^' + t));
  await top(); await snap('10-modul-04');
  for (const t of ['Dalam batas yang', 'Alasan tiap keputusan', 'Memverifikasi dan']) await click(new RegExp('^' + t));
  await click(/SEGEL KONSTITUSI/); await click(/LIHAT DUNIA/); await skip(); await top(); await snap('11-profil');
  await click(/UJI PEMAHAMAN/); await skip(); await click(/^A\s*Kreativitas siswa/); await top(); await snap('12-uji-umpan-balik');
  await click(/SOAL BERIKUTNYA/);
  for (const re of [/^A\s*Efisiensi kota naik/, /^D\s*Agar warga bisa memahami/, /^B\s*Empati dan komunikasi/, /^C\s*Memeriksa ulang/]) { await click(re); await click(/SOAL BERIKUTNYA|LIHAT SKOR/); }
  await top(); await snap('13-uji-skor');
  await click(/HASIL AKHIR/); await skip(); await top(); await snap('14-hasil-akhir');
  await click(/REFLEKSI/); await skip(); await top(); await snap('15-refleksi');
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label') === 'Pengaturan'); if (b) b.click(); });
  await p.waitForTimeout(500); await snap('16-pengaturan');
  for (const bt of await p.$$('button:visible')) if (/^Kredit & keterangan AI$/.test((await bt.innerText()).trim())) { await bt.click(); break; }
  await snap('17-kredit');
  await p.close();

  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto(GAME); await m.waitForTimeout(2000);
  for (const re of [/^MULAI/, /LEWATI KE LAB/, /Smart School/]) { for (const bt of await m.$$('button:visible:enabled')) { if (re.test((await bt.innerText()).trim())) { await bt.click(); await m.waitForTimeout(900); break; } } }
  await m.screenshot({ path: path.join(img, '18-hp.png') }); await m.close();
}

function naskah() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'voice-config.js'), 'utf8');
  const folders = Object.fromEntries([...src.matchAll(/(\w+): \{\s*label: '[^']*',\s*folder: '(\w+)'/g)].map(m => [m[1], m[2]]));
  const who = { NEXA: 'NARA-01', MENTOR: 'KAIA', ORION: 'ORION', CITIZEN: 'Warga', REGULATOR: 'Regulator' };
  const tool = { NEXA: 'edge-tts', MENTOR: 'ElevenLabs', ORION: 'ElevenLabs', CITIZEN: 'edge-tts', REGULATOR: 'edge-tts' };
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = [...src.matchAll(/L\('([a-z0-9_]+)', '([A-Z]+)', '([a-z]+)', '([^']+)',\s*'((?:[^'\\]|\\.)*)', ([0-9.]+), '([^']*)'\)/g)]
    .map((m, i) => `<tr><td>${i + 1}</td><td>${who[m[2]]}</td><td>${tool[m[2]]}</td><td>${esc(m[7])}</td><td>${esc(m[5].replace(/\\'/g, "'"))}</td></tr>`);
  return { rows: rows.join('\n'), count: rows.length };
}

(async () => {
  fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK, { recursive: true });
  const b = await chromium.launch();
  console.log('Mengambil tangkapan layar…'); await shots(b);
  const n = naskah();
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  // Isian yang hanya bisa diberikan pengembang (docs/lomba/isian.json), mis. {"ALAT_PROTOTIPE": "…"}.
  const isianPath = path.join(ROOT, 'docs', 'lomba', 'isian.json');
  const isian = fs.existsSync(isianPath) ? JSON.parse(fs.readFileSync(isianPath, 'utf8')) : {};
  // [sumber, PDF, surat?] — surat memakai margin dari CSS-nya sendiri dan tanpa footer.
  const jobs = [['panduan-penggunaan.html', 'Panduan Penggunaan NEXA.pdf'], ['dokumen-desain-prompting.html', 'Dokumen Desain dan Prompting NEXA.pdf'],
    ['pemetaan-cp-tp.html', 'Pemetaan CP dan TP NEXA.pdf'], ['atribusi-aset.html', 'Atribusi Aset NEXA.pdf'],
    ['surat-pernyataan.html', 'Lampiran 1 - Surat Pernyataan (NEXA, ADIL, SIGAP).pdf', true]];
  const kosong = [];
  for (const [src, out, surat] of jobs) {
    // Surat pernyataan berisi data pribadi dan sengaja tidak ada di repo (lihat .gitignore).
    if (!fs.existsSync(path.join(ROOT, 'docs', 'lomba', src))) { console.log('Lewati (tidak ada di repo):', src); continue; }
    let html = fs.readFileSync(path.join(ROOT, 'docs', 'lomba', src), 'utf8')
      .replace(/\{\{NASKAH\}\}/g, n.rows).replace(/\{\{JUMLAH_BARIS\}\}/g, String(n.count)).replace(/\{\{TANGGAL\}\}/g, tanggal)
      .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => isian[k] || m);
    for (const m of html.matchAll(/\{\{([A-Z_]+)\}\}/g)) kosong.push(src + ': ' + m[1]);
    const file = path.join(WORK, src); fs.writeFileSync(file, html);
    const p = await b.newPage(); await p.goto('file://' + file); await p.waitForTimeout(500);
    await p.pdf(surat ? { path: path.join(DIST, out), format: 'A4', printBackground: true, preferCSSPageSize: true } : {
      path: path.join(DIST, out), format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '15mm', right: '15mm' },
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#667">NEXA · ' + out.replace('.pdf', '') + ' · hal. <span class="pageNumber"></span>/<span class="totalPages"></span></div>' });
    await p.close(); console.log('OK:', path.relative(ROOT, path.join(DIST, out)));
  }
  if (kosong.length) { console.error('BELUM DIISI (tambahkan ke docs/lomba/isian.json):\n  ' + kosong.join('\n  ')); process.exitCode = 1; }
  await b.close();
})().catch(e => { console.error('GAGAL:', e.message); process.exit(1); });
