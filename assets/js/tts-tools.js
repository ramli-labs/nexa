/* ============================================================================
   NEXA — TTS TOOLS
   Helper untuk generate voice over lewat Google Cloud Text-to-Speech REST API
   dan mengemas hasilnya jadi ZIP dengan struktur folder persis seperti yang
   dibaca game (assets/audio/voice/<karakter>/<file>.mp3).

   Global: window.NexaTTS
     .voiceFor(line, tier)  -> { voice, rate, pitch }
     .synthesize(opts)      -> Promise<Uint8Array>  (mp3 bytes)
     .zip(files)            -> Blob                 (files: [{path, bytes}])
     .charCount(lines)      -> jumlah karakter (untuk estimasi kuota)
============================================================================ */
(function () {
  'use strict';

  var ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  /* Setelan per karakter — sumber: DOKUMEN SUBMISSION/06 Prompt TTS Voice Over.md */
  var BASE_MAP = {
    NEXA:      { letter: 'C', rate: 0.95, pitch: -1.0 },
    MENTOR:    { letter: 'A', rate: 0.88, pitch: -0.5 },
    ORION:     { letter: 'B', rate: 1.08, pitch: -3.0 },
    REGULATOR: { letter: 'B', rate: 0.90, pitch: -1.5 },
    CITIZEN:   { letter: 'B', rate: 0.95, pitch: 0.0 }
  };

  /* WARGA pakai tiga suara berbeda (pelajar / pekerja / lansia) */
  var CITIZEN_MAP = {
    citizen_student_01: { letter: 'D', rate: 1.00, pitch: 2.0 },
    citizen_student_02: { letter: 'D', rate: 0.95, pitch: 2.0 },
    citizen_worker_01:  { letter: 'B', rate: 0.95, pitch: 0.0 },
    citizen_worker_02:  { letter: 'B', rate: 1.02, pitch: 0.0 },
    citizen_elder_01:   { letter: 'A', rate: 0.85, pitch: -2.0 },
    citizen_elder_02:   { letter: 'A', rate: 0.85, pitch: -2.0 },
    citizen_protest_01: { letter: 'D', rate: 1.05, pitch: 1.0 },
    citizen_relief_01:  { letter: 'D', rate: 0.98, pitch: 2.0 }
  };

  /* Emosi menggeser sedikit tempo — tetap dalam karakter */
  var EMOTION_RATE = {
    warning: -0.04, pressing: -0.03, protest: 0.04, persuasive: 0.02,
    reflective: -0.04, warm: -0.02, proud: -0.02, confused: -0.03,
    calculating: 0.02, formal: -0.02
  };

  var TIERS = {
    wavenet: 'id-ID-Wavenet-',
    standard: 'id-ID-Standard-',
    chirp3: 'id-ID-Chirp3-HD-'
  };

  /* Chirp3-HD memakai nama suara sendiri, bukan A/B/C/D */
  var CHIRP3 = { A: 'Aoede', B: 'Charon', C: 'Kore', D: 'Leda' };

  function voiceFor(line, tier) {
    var t = TIERS[tier] ? tier : 'wavenet';
    var m = (line.character === 'CITIZEN' && CITIZEN_MAP[line.id]) ||
            BASE_MAP[line.character] || BASE_MAP.NEXA;
    var rate = m.rate + (EMOTION_RATE[line.emotion] || 0);
    rate = Math.round(Math.max(0.25, Math.min(2, rate)) * 100) / 100;
    var name = t === 'chirp3' ? TIERS.chirp3 + CHIRP3[m.letter] : TIERS[t] + m.letter;
    return {
      voice: name,
      rate: rate,
      pitch: t === 'chirp3' ? 0 : m.pitch,
      supportsPitch: t !== 'chirp3'
    };
  }

  function b64ToBytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  /* opts: { key, text, voice, rate, pitch } */
  function synthesize(opts) {
    var body = {
      input: { text: opts.text },
      voice: { languageCode: 'id-ID', name: opts.voice },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: opts.rate,
        sampleRateHertz: 24000,
        effectsProfileId: ['headphone-class-device']
      }
    };
    if (opts.pitch) body.audioConfig.pitch = opts.pitch;

    return fetch(ENDPOINT + '?key=' + encodeURIComponent(opts.key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var msg = (j && j.error && j.error.message) || ('HTTP ' + r.status);
          var e = new Error(msg);
          e.status = r.status;
          throw e;
        }
        if (!j.audioContent) throw new Error('Respons tanpa audioContent');
        return b64ToBytes(j.audioContent);
      });
    });
  }

  /* ------------------------------------------------------------- ZIP (store) */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function strBytes(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
      else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  function dosTime(d) {
    return {
      time: ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xFFFF,
      date: (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF
    };
  }

  /* files: [{ path, bytes }] — metode store (mp3 sudah terkompresi) */
  function zip(files) {
    var now = dosTime(new Date()), parts = [], central = [], offset = 0;

    files.forEach(function (f) {
      var name = strBytes(f.path), data = f.bytes, crc = crc32(data);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true);
      lh.setUint16(10, now.time, true); lh.setUint16(12, now.date, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);

      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, now.time, true); ch.setUint16(14, now.date, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });

    var cSize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cSize, true); end.setUint32(16, offset, true);

    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]),
      { type: 'application/zip' });
  }

  function charCount(lines) {
    return lines.reduce(function (a, l) { return a + l.subtitle.length; }, 0);
  }

  window.NexaTTS = {
    voiceFor: voiceFor,
    synthesize: synthesize,
    zip: zip,
    charCount: charCount,
    tiers: Object.keys(TIERS)
  };
})();
