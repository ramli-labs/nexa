/* ============================================================================
   NEXA — service worker (bisa dimainkan tanpa internet)

   VERSION dan PRECACHE diisi otomatis oleh workflow deploy
   (.github/workflows/pages.yml): VERSION = ID commit, PRECACHE = semua berkas
   situs. Jadi setiap deploy otomatis menyegarkan cache; tidak ada nomor versi
   yang perlu dinaikkan manual.

   Strategi:
   - Kode (navigasi, .html/.js/.css/.json): jaringan dulu, cache saat offline.
     Saat online pemain selalu mendapat versi terbaru.
   - Audio & gambar: cache dulu (cepat, hemat kuota). Permintaan Range
     (audio di Safari/iPad) dijawab 206 dari cache.
   - Gagal total: navigasi jatuh ke index.html; berkas lain mendapat error
     yang benar (tidak pernah dibalas HTML).

   Di server lokal (belum diisi workflow) semuanya jaringan dulu, jadi cache
   tidak mengganggu saat mengembangkan.
============================================================================ */
var VERSION = '__NEXA_VERSION__';
var PRECACHE = [];   // diisi workflow deploy
var BUILT = VERSION.indexOf('__') !== 0;
var CACHE = 'nexa-' + VERSION;

self.addEventListener('install', function (event) {
  event.waitUntil(
    (BUILT ? caches.open(CACHE).then(function (cache) {
      // per berkas: satu berkas gagal tidak menggagalkan seluruh instalasi
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
      }));
    }) : Promise.resolve()).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('nexa-') === 0 && k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isCode(req, url) {
  return req.mode === 'navigate' || /\.(html|js|css|json)$/.test(url.pathname) || url.pathname.slice(-1) === '/';
}

// Jawab permintaan Range dari respons utuh di cache (perlu untuk <audio> di Safari).
function ranged(req, res) {
  var range = req.headers.get('range');
  if (!range || !res || res.status !== 200) return Promise.resolve(res);
  return res.arrayBuffer().then(function (buf) {
    var m = /bytes=(\d*)-(\d*)/.exec(range), size = buf.byteLength;
    var start = m && m[1] ? parseInt(m[1], 10) : 0;
    var end = m && m[2] ? parseInt(m[2], 10) : size - 1;
    if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
    end = Math.min(end, size - 1);
    return new Response(buf.slice(start, end + 1), {
      status: 206,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes'
      }
    });
  });
}

function fallback(req) {
  if (req.mode === 'navigate') return caches.match('./index.html', { cacheName: CACHE }).then(function (r) { return r || Response.error(); });
  return new Response('', { status: 504, statusText: 'Offline' });
}

self.addEventListener('fetch', function (event) {
  var req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  var key = new Request(url.origin + url.pathname);   // abaikan ?v= dsb. dan header Range saat mencari di cache

  function fromNetwork() {
    return fetch(req).then(function (res) {
      if (res.ok && res.status === 200 && BUILT) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(key, copy); });
      }
      return res;
    });
  }
  function fromCache() {
    return caches.match(key, { cacheName: CACHE }).then(function (hit) { return hit ? ranged(req, hit) : null; });
  }

  if (!BUILT || isCode(req, url)) {
    event.respondWith(fromNetwork().catch(function () {
      return fromCache().then(function (hit) { return hit || fallback(req); });
    }));
  } else {
    event.respondWith(fromCache().then(function (hit) {
      return hit || fromNetwork().catch(function () { return fallback(req); });
    }));
  }
});
