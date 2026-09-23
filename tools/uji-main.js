#!/usr/bin/env node
/* ============================================================================
   NEXA — uji main penuh otomatis (Playwright)

   Memainkan gim dari Opening sampai Refleksi seperti pengguna sungguhan
   (klik normal: gagal kalau tombol tertutup), sambil memeriksa suara tutorial,
   pop-up peristiwa, kartu warga, regulator, tombol salin, dan error console.

   Persiapan (sekali, dari akar repo; node_modules/ tidak di-commit):
       npm i --no-save playwright@1 && npx playwright install chromium firefox webkit
   Pakai:
       node tools/uji-main.js <chromium|firefox|webkit> <url> [lebar] [tinggi]
   Contoh:
       python3 -m http.server 8000 &
       node tools/uji-main.js chromium http://localhost:8000/
       node tools/uji-main.js webkit "file://$PWD/index.html" 390 844
   Keluar dengan kode 1 kalau alur gagal atau ada error.
============================================================================ */
const pw = require('playwright');
const [, , br = 'chromium', url, w = '1280', h = '720'] = process.argv;
if (!url) { console.error('Pakai: node tools/uji-main.js <browser> <url> [lebar] [tinggi]'); process.exit(2); }

(async () => {
  const W = +w, H = +h, touch = W < 1100;
  const b = await pw[br].launch(br === 'chromium' ? { args: ['--autoplay-policy=no-user-gesture-required'] }
    : br === 'firefox' ? { firefoxUserPrefs: { 'media.autoplay.default': 0 } } : {});
  const p = await b.newPage({ viewport: { width: W, height: H }, isMobile: touch && br !== 'firefox', hasTouch: touch });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 140)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });

  await p.goto(url);
  await p.waitForTimeout(2500);
  const seen = [], ck = {};
  const scr = () => p.evaluate(() => { const e = [...document.querySelectorAll('[data-screen-label]')].find(x => x.offsetParent !== null); return e ? e.dataset.screenLabel.slice(0, 2) : '?'; });
  const click = async re => {
    for (const bt of await p.$$('button:visible:enabled')) {
      const t = (await bt.innerText()).trim();
      if (re.test(t)) {
        await bt.click({ timeout: 4000 });
        await p.waitForTimeout(900);
        const s = await scr(); if (seen[seen.length - 1] !== s) seen.push(s);
        return;
      }
    }
    throw new Error('tombol ' + re + ' tidak ada di layar ' + (await scr()));
  };
  const vm = () => p.evaluate(() => window.VoiceManager ? VoiceManager.state().id : null);

  try {
    seen.push(await scr());
    await click(/^MULAI/); await click(/CARA BERMAIN/); ck.tutorial = await vm();
    await click(/^LANJUT/); await click(/^LANJUT/); await click(/^LANJUT/); await click(/MASUK KE LAB/);
    await click(/Smart School/);
    await p.evaluate(() => { const r = [...document.querySelectorAll('input[type=range]')]; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; [[0, 100], [3, 0]].forEach(([i, v]) => { set.call(r[i], String(v)); r[i].dispatchEvent(new Event('input', { bubbles: true })); }); });
    await p.waitForTimeout(1200); ck.peristiwa = await vm();
    await click(/KUNCI DESAIN/);
    await p.click('button[aria-label="Dengarkan kutipan warga"]'); await p.waitForTimeout(700); ck.kartu = await vm();
    await click(/KEMBALI KE LAB/); await click(/AI City/); await click(/TERAPKAN/); await click(/KEMBALI KE LAB/);
    await click(/Future Work/);
    for (let i = 0; i < 30; i++) {
      const bs = await p.$$('button:visible:enabled');
      let ready = false;
      for (const bt of bs) if (/KUNCI EKOSISTEM/.test(await bt.innerText())) { ready = true; break; }
      if (ready) break;
      for (const bt of bs) if ((await bt.innerText()).trim() === '+') { await bt.click(); break; }
      await p.waitForTimeout(100);
    }
    await click(/KUNCI EKOSISTEM/); await click(/KEMBALI KE LAB/); await click(/Konstitusi/);
    for (const t of ['Manusia, dengan analisis', 'Individu; layanan', 'Urusan yang menyangkut', 'Dalam batas yang', 'Alasan tiap keputusan', 'Memverifikasi dan']) await click(new RegExp('^' + t));
    ck.regulator = await vm();
    await click(/SEGEL KONSTITUSI/); await click(/LIHAT DUNIA/); await click(/HASIL AKHIR/); await click(/REFLEKSI/);
    await p.fill('textarea >> nth=0', 'AI perlu diawasi manusia.');
    await click(/SALIN RINGKASAN/); await p.waitForTimeout(600);
    ck.salin = await p.evaluate(() => [...document.querySelectorAll('button')].some(b => /TERSALIN/.test(b.innerText)));
  } catch (e) { errs.push('ALUR: ' + e.message.slice(0, 120)); }

  const expected = '01>02>03>04>05>09>04>06>09>04>07>09>04>08>09>10>11>12';
  const path = seen.join('>');
  const okVoice = ck.tutorial === 'nexa_tutorial_1' && ck.peristiwa === 'nexa_event_s1' && /^citizen_school_/.test(ck.kartu || '') && ck.regulator === 'regulator_ready';
  const pass = path === expected && okVoice && errs.length === 0;
  console.log(`${pass ? 'LULUS' : 'GAGAL'}  ${br} ${W}x${H} ${url.startsWith('file:') ? 'file' : 'http'}`);
  console.log('  layar :', path, path === expected ? '(lengkap)' : '(DIHARAPKAN ' + expected + ')');
  console.log('  suara :', JSON.stringify(ck));
  console.log('  error :', errs.length ? errs.join(' || ') : 'tidak ada');
  await b.close();
  process.exit(pass ? 0 : 1);
})();
