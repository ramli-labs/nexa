/* ============================================================================
   NEXA — daftarkan service worker (service-worker.js) supaya gim tetap bisa
   dimainkan tanpa internet setelah dibuka sekali. Didaftarkan setelah halaman
   selesai dimuat, jadi unduhan cache (±7 MB) tidak memperlambat pembukaan
   pertama. Kalau browser tidak mendukung, gim tetap jalan seperti biasa (online).
============================================================================ */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').catch(function () {});
  });
})();
