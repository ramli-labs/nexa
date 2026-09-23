/* ============================================================================
   NEXA — PENYESUAIAN TATA LETAK
   Kotak dialog menempel di bawah layar (position:fixed). Skrip ini mengukur
   tingginya dan menaruhnya di --nx-dlg-h, lalu css/main.css memberi ruang
   bawah sebesar itu pada layar aktif. Hasilnya, semua isi (termasuk tombol
   "KUNCI ...") selalu bisa digulir ke atas dialog, terutama di HP.
============================================================================ */
(function () {
  'use strict';
  var root = document.documentElement, current = null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { update(); }) : null;

  function update() {
    var el = document.querySelector('.nx-dlg');
    if (el !== current) {
      if (ro && current) ro.unobserve(current);
      current = el;
      if (ro && el) ro.observe(el);
    }
    if (el) {
      root.style.setProperty('--nx-dlg-h', Math.ceil(el.getBoundingClientRect().height) + 'px');
      root.classList.add('nx-has-dlg');
    } else {
      root.classList.remove('nx-has-dlg');
    }
  }

  new MutationObserver(update).observe(document.body, { childList: true, subtree: true });
  update();
})();
