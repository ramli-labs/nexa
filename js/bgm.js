/* ============================================================================
   NEXA — MUSIK LATAR (prosedural, Web Audio)
   Pad hangat dengan progresi akor yang berganti pelan, reverb, dan (opsional)
   lonceng jarang. Tidak ada berkas musik; tidak ada pola yang diulang terus.

   Global: window.NexaBGM
     NexaBGM.create(ctx, destination, { style })  -> { setScreen(s), stop() }
     NexaBGM.render(screen, seconds, style)       -> Promise<AudioBuffer> (offline,
                                                     dipakai untuk pratinjau)
   Gaya (style): 'lembut' (pad saja) | 'lonceng' (pad + lonceng jarang)
                 | 'mengalir' (pad + petikan akor pelan yang selalu berubah)
============================================================================ */
(function () {
  'use strict';

  // Akor ditulis sebagai nomor MIDI (60 = C4). Satu akor ditahan `bar` detik,
  // lalu berpindah dengan crossfade panjang, jadi tidak ada dengung yang diam.
  var MOODS = {
    intro:  { bar: 9,  cutoff: 1100, prog: [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 52, 59]] },  // Cmaj7 Am7 Fmaj7 G6
    lab:    { bar: 10, cutoff: 1200, prog: [[50, 57, 61, 66], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 57, 61]] },  // Dmaj7 Bm7 Gmaj7 A
    school: { bar: 8,  cutoff: 1400, prog: [[41, 48, 52, 57], [43, 50, 52, 59], [45, 52, 55, 60], [40, 47, 50, 55]] },  // Fmaj7 G6 Am7 Em7
    city:   { bar: 10, cutoff: 950,  prog: [[45, 52, 55, 60], [41, 48, 52, 57], [38, 45, 48, 53], [40, 47, 52, 55]] },  // Am7 Fmaj7 Dm7 Em
    work:   { bar: 8,  cutoff: 1150, prog: [[40, 47, 50, 54], [36, 43, 47, 52], [43, 50, 55, 59], [38, 45, 50, 54]] },  // Em9 Cmaj7 G D
    civ:    { bar: 12, cutoff: 900,  prog: [[38, 45, 50, 53], [34, 41, 45, 50], [41, 48, 53, 57], [36, 43, 48, 52]] },  // Dm Bbmaj7 F C
    ending: { bar: 10, cutoff: 1500, prog: [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]] }   // C G Am F
  };
  var SCREEN_MOOD = {
    opening: 'intro', objective: 'intro', tutorial: 'intro', hub: 'lab', result: 'lab',
    school: 'school', city: 'city', work: 'work', civ: 'civ',
    profile: 'ending', quiz: 'lab', summary: 'ending', reflection: 'ending'
  };
  var STYLES = {
    lembut:   { bells: 0,    pluck: 0 },
    lonceng:  { bells: 0.16, pluck: 0 },     // rata-rata satu lonceng tiap ±6 detik
    mengalir: { bells: 0.08, pluck: 0.55 }   // petikan akor ±1 nada per 2 detik
  };
  var DEFAULT_STYLE = 'lonceng';
  var LEVEL = 2.1;   // ±13 dB di bawah suara tokoh pada volume musik bawaan (40%): ±−35 LUFS vs −22 LUFS
  var PAD_NOTE = 0.045, BELL = 0.035, PLUCK = 0.03;

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Osilator yang sudah selesai dilepas dari daftar, jadi sesi panjang tidak menumpuk node.
  function track(L, o) { L.oscs.add(o); o.onended = function () { L.oscs.delete(o); }; }
  // Hentikan semua osilator layer pada waktu audio `at` (terjadwal, bukan setTimeout,
  // supaya fade tetap utuh juga saat dirender offline).
  function release(L, at, fade) {
    L.gain.gain.cancelScheduledValues(at);
    L.gain.gain.setValueAtTime(L.gain.gain.value, at);
    L.gain.gain.linearRampToValueAtTime(0, at + fade);
    L.oscs.forEach(function (o) { try { o.stop(at + fade + 0.1); } catch (e) {} });
  }

  // PRNG kecil ber-seed agar pratinjau offline bisa diulang persis.
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e6) / 1e6; };
  }

  function impulse(ctx, secs, decay) {
    var n = Math.floor(ctx.sampleRate * secs), buf = ctx.createBuffer(2, n, ctx.sampleRate), r = rng(7);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < n; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  }

  function Engine(ctx, dest, opts) {
    opts = opts || {};
    this.ctx = ctx;
    this.style = STYLES[opts.style] ? opts.style : DEFAULT_STYLE;
    this.rand = opts.seed ? rng(opts.seed) : Math.random;
    this.out = ctx.createGain(); this.out.gain.value = LEVEL; this.out.connect(dest);
    var verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 3.2, 2.6);
    this.wet = ctx.createGain(); this.wet.gain.value = 0.9;
    verb.connect(this.wet); this.wet.connect(this.out);
    this.verbIn = verb;
    this.layer = null; this.timer = null; this.mood = null;
  }

  Engine.prototype._layer = function (moodName, at) {
    var ctx = this.ctx, m = MOODS[moodName];
    var g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + 4);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = m.cutoff; lp.Q.value = 0.5;
    lp.connect(g); g.connect(this.out);
    var send = ctx.createGain(); send.gain.value = 0.55; lp.connect(send); send.connect(this.verbIn);
    return { mood: m, gain: g, input: lp, nextBar: at, bar: 0, nextBell: at + 3 + this.rand() * 4, nextPluck: at + 2, oscs: new Set() };
  };

  Engine.prototype._pad = function (L, chord, t, dur) {
    var ctx = this.ctx, self = this;
    chord.forEach(function (note, i) {
      var g = ctx.createGain(), pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      var a = 3.5, r = 5, peak = PAD_NOTE * (i === 0 ? 1.1 : 1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.setValueAtTime(peak, t + dur);
      g.gain.linearRampToValueAtTime(0, t + dur + r);
      if (pan) { pan.pan.value = (i - 1.5) * 0.35; g.connect(pan); pan.connect(L.input); } else g.connect(L.input);
      [['sine', 0, 1], ['triangle', 5, 0.45], ['sine', -6, 0.5]].forEach(function (v) {
        var o = ctx.createOscillator(), og = ctx.createGain();
        o.type = v[0]; o.frequency.value = hz(note); o.detune.value = v[1] + (self.rand() - 0.5) * 3;
        og.gain.value = v[2]; o.connect(og); og.connect(g);
        o.start(t); o.stop(t + dur + r + 0.1); track(L, o);
      });
    });
  };

  Engine.prototype._tone = function (L, freq, t, peak, decay, wetOnly) {
    var ctx = this.ctx, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2.001;             // parsial kedua tipis: warna lonceng
    var g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g);
    o.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(wetOnly ? this.verbIn : L.input);
    if (wetOnly) { var dry = ctx.createGain(); dry.gain.value = 0.35; g.connect(dry); dry.connect(L.input); }
    o.start(t); o2.start(t); o.stop(t + decay + 0.1); o2.stop(t + decay + 0.1); track(L, o); track(L, o2);
  };

  Engine.prototype._schedule = function (until) {
    var L = this.layer; if (!L) return;
    var m = L.mood, st = STYLES[this.style], chord;
    while (L.nextBar < until) {
      chord = m.prog[L.bar % m.prog.length];
      this._pad(L, chord, L.nextBar, m.bar);
      L.nextBar += m.bar; L.bar++;
    }
    var cur = function (t) { return m.prog[Math.floor((t - (L.nextBar - L.bar * m.bar)) / m.bar) % m.prog.length] || chord || m.prog[0]; };
    while (st.bells && L.nextBell < until) {
      var c = cur(L.nextBell), n = c[1 + Math.floor(this.rand() * (c.length - 1))] + 24;
      this._tone(L, hz(n), L.nextBell, BELL, 3.5, true);
      L.nextBell += -Math.log(1 - this.rand() * 0.95) / st.bells;      // jarak acak, tidak berpola
    }
    while (st.pluck && L.nextPluck < until) {
      var c2 = cur(L.nextPluck), n2 = c2[Math.floor(this.rand() * c2.length)] + 12;
      if (this.rand() < 0.85) this._tone(L, hz(n2), L.nextPluck, PLUCK, 1.8, false);
      L.nextPluck += (1 / st.pluck) * (0.6 + this.rand() * 0.8);
    }
  };

  Engine.prototype.setScreen = function (screen) {
    var name = SCREEN_MOOD[screen] || 'lab';
    if (name === this.mood) return;
    this.mood = name;
    var t = this.ctx.currentTime + 0.05, old = this.layer;
    if (old) release(old, t, 3);
    this.layer = this._layer(name, t);
    this._schedule(t + 4);
    if (!this.timer && !this.offline) {
      var self = this;
      this.timer = setInterval(function () { self._schedule(self.ctx.currentTime + 4); }, 1000);
    }
  };

  Engine.prototype.stop = function (fade) {
    var t = this.ctx.currentTime, f = fade == null ? 1.5 : fade;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.layer) release(this.layer, t, f);
    this.layer = null; this.mood = null;
  };

  window.NexaBGM = {
    MOODS: MOODS, STYLES: STYLES, SCREEN_MOOD: SCREEN_MOOD, DEFAULT_STYLE: DEFAULT_STYLE,
    create: function (ctx, dest, opts) { return new Engine(ctx, dest, opts); },
    render: function (screen, seconds, style) {
      var Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var ctx = new Off(2, Math.ceil(44100 * seconds), 44100);
      var e = new Engine(ctx, ctx.destination, { style: style, seed: 2045 });
      e.offline = true;
      e.setScreen(screen);
      e._schedule(seconds);
      return ctx.startRendering();
    }
  };
})();
