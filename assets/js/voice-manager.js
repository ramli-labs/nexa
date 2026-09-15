/* ============================================================================
   NEXA — VOICE MANAGER
   Pemutar voice-over berbasis aset eksternal (mp3 / webm), dengan subtitle
   tersinkron per kata dan fallback penuh saat file audio belum tersedia.

   Butuh: voiceConfig.js (window.NexaVoiceConfig)
   Opsional: nexa-visuals.js (window.NexaAudio untuk SFX & manifest override)
   Global: window.VoiceManager

   API
     VoiceManager.playVoice(id, opts)   → Promise<{played, source, line}>
     VoiceManager.stopVoice()
     VoiceManager.pauseVoice()
     VoiceManager.resumeVoice()
     VoiceManager.replay()
     VoiceManager.setVolume(0..1)
     VoiceManager.enableSubtitle(bool)
     VoiceManager.onSubtitle(fn)        → unsubscribe()
     VoiceManager.preload(id | [id])
     VoiceManager.state()

   Subtitle callback menerima:
     { id, character, emotion, full, visible, wordIndex, wordCount,
       speaking, source: 'audio' | 'fallback', done }

   Fallback: jika file tidak ada / gagal dimuat / autoplay diblokir, manajer
   tetap menjalankan timeline per kata memakai `duration` dari voiceConfig dan
   memicu SFX ketik halus. Tidak pernah melempar error ke pemanggil.
============================================================================ */
(function () {
  'use strict';

  var CFG = function () { return window.NexaVoiceConfig || { get: function () { return null; } }; };

  var WORD_MS = 320;        // perkiraan tempo baca per kata (fallback)
  var LEAD_MS = 260;        // jeda sebelum kata pertama
  var TICK_EVERY = 2;       // SFX ketik setiap N kata (fallback)

  var VM = {
    volume: 0.85,
    subtitles: true,
    muted: false,

    _el: null,            // <audio> aktif
    _cache: {},           // id → objectURL/kesiapan
    _missing: {},         // id → true (404 / gagal) agar tidak diulang
    _subs: [],            // subscriber subtitle
    _timer: null,
    _raf: null,
    _cur: null,           // { id, line, words, wordIndex, source, speaking, startedAt }
    _seq: 0,              // penjaga urutan agar baris lama tidak menimpa baru

    /* ------------------------------------------------------------ helpers */
    _url: function (line) {
      // manifest override menang atas path default di voiceConfig
      var over = window.NexaAssets && window.NexaAssets.get
        ? window.NexaAssets.get('audio.voice.' + line.id)
        : '';
      return over || line.audio;
    },

    _words: function (text) {
      return String(text || '').split(/\s+/).filter(Boolean);
    },

    _emitCleared: function () {
      var payload = { id: null, character: null, emotion: null, full: '', visible: '', wordIndex: 0, wordCount: 0, speaking: false, source: null, done: true };
      this._subs.forEach(function (fn) { try { fn(payload); } catch (e) {} });
    },

    _emit: function (patch) {
      var c = this._cur;
      if (!c) return;
      var visible = this.subtitles
        ? c.words.slice(0, Math.max(0, c.wordIndex)).join(' ')
        : '';
      var payload = {
        id: c.id,
        character: c.line.character,
        emotion: c.line.emotion,
        full: c.line.subtitle,
        visible: visible,
        wordIndex: c.wordIndex,
        wordCount: c.words.length,
        speaking: c.speaking,
        source: c.source,
        done: c.wordIndex >= c.words.length
      };
      if (patch) for (var k in patch) payload[k] = patch[k];
      this._subs.forEach(function (fn) { try { fn(payload); } catch (e) {} });
    },

    _tick: function () {
      if (window.NexaAudio && !this.muted) {
        try { window.NexaAudio.playSFX('hover'); } catch (e) {}
      }
    },

    _clearTimers: function () {
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    },

    /* --------------------------------------------------------- subtitles */
    onSubtitle: function (fn) {
      if (typeof fn !== 'function') return function () {};
      this._subs.push(fn);
      var self = this;
      return function () {
        var i = self._subs.indexOf(fn);
        if (i >= 0) self._subs.splice(i, 1);
      };
    },

    enableSubtitle: function (on) {
      this.subtitles = on !== false;
      this._emit();
      return this;
    },

    setVolume: function (v) {
      this.volume = Math.max(0, Math.min(1, typeof v === 'number' ? v : 0.85));
      if (this._el) this._el.volume = this.muted ? 0 : this.volume;
      return this;
    },

    setMuted: function (m) {
      this.muted = !!m;
      if (this.muted) this.stopVoice();
      else if (this._el) this._el.volume = this.volume;
      return this;
    },

    /* -------------------------------------------------------- transport  */
    stopVoice: function () {
      this._clearTimers();
      if (this._el) {
        try { this._el.pause(); this._el.currentTime = 0; } catch (e) {}
        this._el.onended = this._el.onerror = this._el.onloadedmetadata = null;
        this._el = null;
      }
      var had = !!this._cur;
      this._cur = null;                 // null dulu: baris yang ditinggalkan tidak boleh mengirim teks parsialnya
      this._seq++;
      if (had) this._emitCleared();
      return this;
    },

    pauseVoice: function () {
      if (this._el) { try { this._el.pause(); } catch (e) {} }
      this._clearTimers();
      if (this._cur) { this._cur.speaking = false; this._cur.pausedAt = Date.now(); this._emit(); }
      return this;
    },

    resumeVoice: function () {
      var c = this._cur;
      if (!c) return this;
      c.speaking = true;
      if (this._el) {
        var p = this._el.play();
        if (p && p.catch) p.catch(function () {});
        this._followAudio();
      } else {
        this._runFallback(c.wordIndex);
      }
      this._emit();
      return this;
    },

    replay: function () {
      var c = this._cur;
      var id = c ? c.id : this._lastId;
      return id ? this.playVoice(id, { force: true }) : Promise.resolve({ played: false });
    },

    /* --------------------------------------------------------- preloading */
    preload: function (ids) {
      var self = this;
      (Array.isArray(ids) ? ids : [ids]).forEach(function (id) {
        var line = CFG().get(id);
        if (!line || self._missing[id] || self._cache[id]) return;
        var a = new Audio();
        a.preload = 'auto';
        a.src = self._url(line);
        a.onloadedmetadata = function () { self._cache[id] = a.duration || line.duration; };
        a.onerror = function () { self._missing[id] = true; };
      });
      return this;
    },

    /* ------------------------------------------------------------- play  */
    playVoice: function (id, opts) {
      opts = opts || {};
      var self = this;
      var line = CFG().get(id);
      this.stopVoice();
      if (!line) return Promise.resolve({ played: false, source: 'none', line: null });

      this._lastId = id;
      var seq = ++this._seq;
      var words = this._words(line.subtitle);
      this._cur = {
        id: id, line: line, words: words, wordIndex: 0,
        source: 'fallback', speaking: true, startedAt: Date.now()
      };

      if (this.muted || this.volume === 0) {
        // tetap jalankan subtitle agar pacing & pembacaan tidak hilang
        this._runFallback(0);
        this._emit();
        return Promise.resolve({ played: false, source: 'fallback', line: line });
      }

      if (this._missing[id]) {
        this._cur.source = 'fallback';
        this._runFallback(0);
        this._emit();
        return Promise.resolve({ played: false, source: 'fallback', line: line });
      }

      return new Promise(function (resolve) {
        var a = new Audio();
        a.preload = 'auto';           // lazy: elemen baru dibuat saat dialog muncul
        a.volume = self.volume;
        a.src = self._url(line);
        self._el = a;

        var settled = false;
        var giveUp = setTimeout(function () {         // tidak ada metadata → anggap tak tersedia
          if (settled || seq !== self._seq) return;
          settled = true;
          self._missing[id] = true;
          self._el = null;
          if (self._cur) { self._cur.source = 'fallback'; self._runFallback(0); self._emit(); }
          resolve({ played: false, source: 'fallback', line: line });
        }, 1400);

        a.onerror = function () {
          if (settled || seq !== self._seq) return;
          settled = true; clearTimeout(giveUp);
          self._missing[id] = true;
          self._el = null;
          if (self._cur) { self._cur.source = 'fallback'; self._runFallback(0); self._emit(); }
          resolve({ played: false, source: 'fallback', line: line });
        };

        a.onloadedmetadata = function () {
          if (settled || seq !== self._seq) return;
          settled = true; clearTimeout(giveUp);
          self._cache[id] = a.duration || line.duration;
          if (self._cur) { self._cur.source = 'audio'; self._cur.audioDur = a.duration || line.duration; }
          var p = a.play();
          if (p && p.catch) {
            p.catch(function () {                       // autoplay diblokir → fallback
              if (seq !== self._seq) return;
              self._el = null;
              if (self._cur) { self._cur.source = 'fallback'; self._runFallback(0); self._emit(); }
            });
          }
          a.onended = function () {
            if (seq !== self._seq || !self._cur) return;
            self._cur.wordIndex = self._cur.words.length;
            self._cur.speaking = false;
            self._emit({ done: true });
            if (typeof opts.onEnd === 'function') opts.onEnd();
          };
          self._followAudio();
          self._emit();
          resolve({ played: true, source: 'audio', line: line });
        };
      });
    },

    /* subtitle mengikuti currentTime audio nyata */
    _followAudio: function () {
      var self = this;
      this._clearTimers();
      var step = function () {
        var c = self._cur, a = self._el;
        if (!c || !a) return;
        var dur = c.audioDur || a.duration || c.line.duration || (c.words.length * WORD_MS / 1000);
        var t = Math.max(0, a.currentTime - LEAD_MS / 1000);
        var idx = Math.min(c.words.length, Math.ceil((t / Math.max(0.2, dur)) * c.words.length));
        if (idx !== c.wordIndex) { c.wordIndex = idx; self._emit(); }
        if (!a.paused && !a.ended) self._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    },

    /* fallback: timeline per kata + SFX ketik */
    _runFallback: function (from) {
      var self = this;
      var c = this._cur;
      if (!c) return;
      this._clearTimers();
      c.speaking = true;
      var total = (c.line.duration || c.words.length * WORD_MS / 1000) * 1000;
      var per = Math.max(110, Math.min(520, (total - LEAD_MS) / Math.max(1, c.words.length)));
      var i = from || 0;

      var next = function () {
        if (!self._cur || self._cur !== c) return;
        if (i >= c.words.length) {
          c.speaking = false;
          self._emit({ done: true });
          return;
        }
        i++;
        c.wordIndex = i;
        if (i % TICK_EVERY === 0) self._tick();
        self._emit();
        self._timer = setTimeout(next, per);
      };
      this._timer = setTimeout(next, i === 0 ? LEAD_MS : per);
    },

    /* --------------------------------------------------------- introspect */
    state: function () {
      var c = this._cur;
      return {
        playing: !!(c && c.speaking),
        id: c ? c.id : null,
        source: c ? c.source : null,
        volume: this.volume,
        muted: this.muted,
        subtitles: this.subtitles,
        missing: Object.keys(this._missing),
        loaded: Object.keys(this._cache)
      };
    },

    /* laporan ketersediaan aset — berguna saat memasukkan file rekaman */
    audit: function () {
      var cfg = CFG();
      if (!cfg.all) return Promise.resolve([]);
      var self = this;
      return Promise.all(cfg.all().map(function (line) {
        if (self._cache[line.id]) return { id: line.id, ok: true, duration: self._cache[line.id] };
        if (self._missing[line.id]) return { id: line.id, ok: false, url: self._url(line) };
        return new Promise(function (res) {
          var a = new Audio();
          a.preload = 'metadata';
          a.onloadedmetadata = function () { self._cache[line.id] = a.duration; res({ id: line.id, ok: true, duration: a.duration }); };
          a.onerror = function () { self._missing[line.id] = true; res({ id: line.id, ok: false, url: self._url(line) }); };
          a.src = self._url(line);
        });
      }));
    }
  };

  window.VoiceManager = VM;
})();
