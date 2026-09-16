/* ==========================================================================
   NEXA VISUAL & AUDIO KIT  v1.0
   Modular, framework-agnostic web components + audio manager.
   Zero dependencies. Works offline. No gameplay logic inside.

   Registers:  <nexa-avatar> <mentor-avatar> <citizen-avatar> <regulator-avatar>
               <nexa-icon> <nexa-scene> <nexa-count> <nexa-panel>
   Globals:    window.NexaAudio   window.NexaFX   window.NexaAssets

   ASSET OVERRIDE CONTRACT
   Every drawn asset falls back to built-in procedural art. To replace any
   asset with a real file, add its URL to assets/manifest.json (or call
   NexaAssets.set('characters.mentor.neutral', 'assets/characters/mentor/
   mentor-neutral.svg')). Nothing else changes.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__nexaKit) return;
  window.__nexaKit = true;

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var C = {
    bg: '#071426', hull: '#0D2A4A', cyan: '#17D9FF', violet: '#7657FF',
    green: '#35F2A1', amber: '#FFC857', coral: '#FF6B6B', ink: '#F5F8FC',
    mute: '#91A4B8', skin: '#C98A5E', skin2: '#A86F46', hair: '#171F2B',
    batik: '#1E6F7A', cloth: '#0F3A52'
  };

  /* ---------------------------------------------------------------- assets */
  var Assets = {
    map: {},
    set: function (path, url) { this.map[path] = url; return this; },
    get: function (path) { return this.map[path] || null; },
    load: function (url) {
      var self = this;
      return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
        (function walk(o, p) {
          Object.keys(o).forEach(function (k) {
            var v = o[k], key = p ? p + '.' + k : k;
            if (v && typeof v === 'object') walk(v, key);
            else if (typeof v === 'string' && v) self.map[key] = v;
          });
        })(j, '');
        return self.map;
      }).catch(function () { return self.map; });
    }
  };
  window.NexaAssets = Assets;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function base(host, css) {
    var r = host.shadowRoot || host.attachShadow({ mode: 'open' });
    r.innerHTML = '<style>:host{display:inline-block;line-height:0}svg{display:block;width:100%;height:auto;overflow:visible}' +
      (RM ? '*{animation:none!important;transition:none!important}' : '') + css + '</style>';
    return r;
  }
  function overrideImg(root, url, w, h) {
    root.appendChild(el('img', { src: url, alt: '', style: 'display:block;width:100%;height:auto', width: w, height: h }));
  }

  /* ============================================================ NEXA CORE */
  var NEXA_STATE = {
    idle:     { a: C.cyan,  b: C.violet, spin: 26, pulse: 3.4, glow: .38, rings: 3, parts: 0 },
    thinking: { a: C.violet,b: C.cyan,   spin: 7,  pulse: 1.1, glow: .55, rings: 3, parts: 7 },
    warning:  { a: C.amber, b: C.coral,  spin: 14, pulse: .9,  glow: .5,  rings: 2, parts: 0 },
    success:  { a: C.green, b: C.cyan,   spin: 34, pulse: 2.2, glow: .6,  rings: 3, parts: 0 },
    overload: { a: C.coral, b: C.amber,  spin: 3,  pulse: .45, glow: .72, rings: 4, parts: 12 }
  };

  function NexaAvatarRender(host) {
    var st = NEXA_STATE[host.getAttribute('state')] || NEXA_STATE.idle;
    var size = host.getAttribute('size') || '160';
    var ov = Assets.get('characters.nexa.' + (host.getAttribute('state') || 'idle'));
    host.style.width = /\D/.test(size) ? size : size + 'px';
    var root = base(host, [
      '@keyframes nx-s{to{transform:rotate(360deg)}}',
      '@keyframes nx-sr{to{transform:rotate(-360deg)}}',
      '@keyframes nx-p{0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}',
      '@keyframes nx-jt{0%,100%{transform:translate(0,0)}25%{transform:translate(1.6px,-1.2px)}50%{transform:translate(-1.4px,1px)}75%{transform:translate(.8px,1.4px)}}',
      '@keyframes nx-orb{0%{opacity:0;transform:translate(0,0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.1)}}',
      '.r{transform-origin:110px 110px}',
      '.core{transform-origin:110px 110px;animation:nx-p ' + st.pulse + 's ease-in-out infinite}',
      '.jt{animation:nx-jt ' + (st.pulse < 1 ? .28 : .9) + 's steps(2,end) infinite}'
    ].join(''));
    if (ov) { overrideImg(root, ov, 220, 220); return; }

    var parts = '';
    for (var i = 0; i < st.parts; i++) {
      var ang = (i / st.parts) * Math.PI * 2, R = 92;
      parts += '<circle cx="' + (110 + Math.cos(ang) * R).toFixed(1) + '" cy="' + (110 + Math.sin(ang) * R).toFixed(1) +
        '" r="2.6" fill="' + st.b + '" style="--dx:' + (-Math.cos(ang) * R).toFixed(1) + 'px;--dy:' + (-Math.sin(ang) * R).toFixed(1) +
        'px;animation:nx-orb ' + (1.1 + i * .08).toFixed(2) + 's ' + (i * .13).toFixed(2) + 's ease-in infinite"/>';
    }
    var rings = '';
    var defs = [[96, st.a, .34, st.spin, 0], [74, st.b, .5, st.spin * .7, 1], [56, st.a, .22, st.spin * 1.5, 0], [110, st.b, .16, st.spin * 2, 1]];
    for (var k = 0; k < st.rings; k++) {
      var d = defs[k];
      rings += '<circle class="r" cx="110" cy="110" r="' + d[0] + '" fill="none" stroke="' + d[1] + '" stroke-opacity="' + d[2] +
        '" stroke-width="1.2"' + (k === 1 ? ' stroke-dasharray="5 7"' : '') +
        ' style="animation:' + (d[4] ? 'nx-sr' : 'nx-s') + ' ' + d[3] + 's linear infinite"/>';
    }

    root.appendChild(el('div', null,
      '<svg viewBox="0 0 220 220" role="img" aria-label="NEXA AI core, state ' + (host.getAttribute('state') || 'idle') + '">' +
      '<defs>' +
      '<radialGradient id="g1"><stop offset="0" stop-color="' + st.a + '" stop-opacity="' + st.glow + '"/><stop offset="1" stop-color="' + st.a + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + st.a + '"/><stop offset="1" stop-color="' + st.b + '"/></linearGradient>' +
      '<filter id="f1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '</defs>' +
      '<circle cx="110" cy="110" r="104" fill="url(#g1)"/>' + rings +
      '<g' + (st.pulse < 1 ? ' class="jt"' : '') + '>' +
      '<g class="core">' +
      '<path d="M110 52 154 110 110 168 66 110Z" fill="url(#g2)" fill-opacity=".28" stroke="' + st.a + '" stroke-width="2" filter="url(#f1)"/>' +
      '<path d="M110 52 154 110 110 168 66 110Z" fill="url(#g2)" fill-opacity=".3" stroke="' + st.a + '" stroke-width="1.8"/>' +
      '<path d="M110 52 110 168M66 110 154 110" stroke="' + st.b + '" stroke-width="1" stroke-opacity=".65"/>' +
      '<path d="M110 52 132 110 110 168 88 110Z" fill="' + st.b + '" fill-opacity=".26"/>' +
      '<circle cx="110" cy="110" r="9" fill="' + C.ink + '"/><circle cx="110" cy="110" r="16" fill="' + st.a + '" fill-opacity=".4"/>' +
      '</g></g>' + parts + '</svg>'));
  }

  /* ============================================================== HUMANS  */
  function face(expr) {
    var m = {
      neutral:     { brow: 'M86 92 100 90M120 90 134 92', mouth: 'M102 118 Q110 122 118 118', tilt: 0,  lid: 'M88 100 Q93 97 98 100M122 100 Q127 97 132 100', px: 0,   py: 0,   arm: 'M72 190 Q56 212 54 236', hand: 'M54 236 q-6 4-2 9 q6 4 10-2 q3-5-2-8Z', blush: 0 },
      explaining:  { brow: 'M86 90 100 87M120 87 134 90', mouth: 'M100 117 Q110 126 120 117', tilt: -2, lid: 'M88 99 Q93 95 98 99M122 99 Q127 95 132 99',   px: 0,   py: -.6, arm: 'M72 190 Q50 198 44 176', hand: 'M44 176 q-7-3-8 4 q0 8 7 8 q6-1 5-8Z', blush: .1 },
      questioning: { brow: 'M86 95 100 88M120 91 134 90', mouth: 'M102 119 Q110 117 118 121', tilt: 3,  lid: 'M88 100 Q93 96 98 100M122 101 Q127 98 132 101', px: 1.4, py: 0,   arm: 'M72 192 Q60 176 86 154', hand: 'M86 154 q-4-6 3-8 q8-1 7 7 q-1 6-8 5Z', blush: 0 },
      proud:       { brow: 'M86 89 100 88M120 88 134 89', mouth: 'M99 116 Q110 128 121 116', tilt: -1, lid: 'M88 101 Q93 98 98 101M122 101 Q127 98 132 101', px: 0,   py: .4,  arm: 'M72 190 Q64 210 96 202', hand: 'M96 202 q8-1 9 6 q-1 7-9 5 q-6-3-3-9Z', blush: .16 },
      concerned:   { brow: 'M86 88 100 93M120 93 134 88', mouth: 'M102 121 Q110 117 118 121', tilt: 2,  lid: 'M88 101 Q93 99 98 101M122 101 Q127 99 132 101', px: -1,  py: .8,  arm: 'M72 192 Q56 216 92 220', hand: 'M92 220 q9 0 9 7 q-2 6-10 3 q-5-4-1-9Z', blush: 0 }
    };
    return m[expr] || m.neutral;
  }

  function MentorRender(host) {
    var expr = host.getAttribute('expression') || 'neutral';
    var size = host.getAttribute('size') || '220';
    var ov = Assets.get('characters.mentor.' + expr);
    host.style.width = /\D/.test(size) ? size : size + 'px';
    var root = base(host, '@keyframes nx-br{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}.b{animation:nx-br 4.2s ease-in-out infinite}');
    if (ov) { overrideImg(root, ov, 512, 640); return; }
    var f = face(expr);
    root.appendChild(el('div', null,
      '<svg viewBox="0 0 220 260" role="img" aria-label="Bu Arka, mentor, ekspresi ' + expr + '">' +
      '<defs>' +
      '<pattern id="bt" width="18" height="18" patternUnits="userSpaceOnUse">' +
      '<rect width="18" height="18" fill="' + C.cloth + '"/>' +
      '<path d="M9 2 16 9 9 16 2 9Z" fill="none" stroke="' + C.batik + '" stroke-width="1.1"/>' +
      '<circle cx="9" cy="9" r="1.5" fill="' + C.batik + '" fill-opacity=".75"/>' +
      '<circle cx="0" cy="0" r="1.2" fill="' + C.batik + '" fill-opacity=".5"/><circle cx="18" cy="18" r="1.2" fill="' + C.batik + '" fill-opacity=".5"/>' +
      '</pattern>' +
      '<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.cyan + '" stop-opacity=".5"/><stop offset=".5" stop-color="' + C.cyan + '" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<g class="b" transform="rotate(' + f.tilt + ' 110 150)">' +
      '<path d="M34 260 Q40 196 78 180 L142 180 Q180 196 186 260Z" fill="url(#bt)"/>' +
      '<path d="M34 260 Q40 196 78 180 L96 180 Q74 210 70 260Z" fill="' + C.cyan + '" fill-opacity=".08"/>' +
      '<path d="M96 180 110 206 124 180 L142 180 Q136 196 110 214 Q84 196 78 180Z" fill="' + C.ink + '" fill-opacity=".9"/>' +
      '<path d="M96 168 L124 168 L124 186 Q110 196 96 186Z" fill="' + C.skin2 + '"/>' +
      '<path d="M78 104 Q78 60 110 60 Q142 60 142 104 Q142 148 110 152 Q78 148 78 104Z" fill="' + C.skin + '"/>' +
      '<path d="M76 100 Q70 52 110 48 Q150 52 144 100 Q136 78 110 74 Q84 78 76 100Z" fill="' + C.hair + '"/>' +
      '<path d="M74 96 Q66 132 74 146 Q78 120 80 108Z" fill="' + C.hair + '"/><path d="M146 96 Q154 132 146 146 Q142 120 140 108Z" fill="' + C.hair + '"/>' +
      '<circle cx="93" cy="103" r="3.1" fill="' + C.hair + '"/><circle cx="127" cy="103" r="3.1" fill="' + C.hair + '"/>' +
      '<ellipse cx="93" cy="103" rx="5.4" ry="4.3" fill="#F7FAFF" fill-opacity=".92"/><ellipse cx="127" cy="103" rx="5.4" ry="4.3" fill="#F7FAFF" fill-opacity=".92"/>' +
      '<circle cx="' + (93 + f.px) + '" cy="' + (103 + f.py) + '" r="2.5" fill="#2A2118"/><circle cx="' + (127 + f.px) + '" cy="' + (103 + f.py) + '" r="2.5" fill="#2A2118"/>' +
      '<circle cx="' + (94.2 + f.px) + '" cy="' + (101.6 + f.py) + '" r=".9" fill="#FFFFFF" fill-opacity=".85"/><circle cx="' + (128.2 + f.px) + '" cy="' + (101.6 + f.py) + '" r=".9" fill="#FFFFFF" fill-opacity=".85"/>' +
      '<path d="' + f.lid + '" stroke="' + C.hair + '" stroke-width="1.5" stroke-linecap="round" fill="none" stroke-opacity=".9"/>' +
      '<path d="M110 104 Q108 112 112 114" stroke="' + C.skin2 + '" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
      (f.blush ? '<ellipse cx="88" cy="114" rx="6" ry="3.4" fill="#D98A7A" fill-opacity="' + f.blush + '"/><ellipse cx="132" cy="114" rx="6" ry="3.4" fill="#D98A7A" fill-opacity="' + f.blush + '"/>' : '') +
      '<path d="' + f.brow + '" stroke="' + C.hair + '" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="' + f.mouth + '" stroke="#7A3B3B" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '<g stroke="' + C.mute + '" stroke-width="1.6" fill="none" stroke-opacity=".85">' +
      '<rect x="82" y="95" width="22" height="16" rx="5"/><rect x="116" y="95" width="22" height="16" rx="5"/><path d="M104 102 116 102M82 100 74 98M138 100 146 98"/></g>' +
      '<g transform="rotate(-14 170 214)"><rect x="146" y="190" width="48" height="62" rx="6" fill="' + C.hull + '" stroke="' + C.cyan + '" stroke-opacity=".7"/>' +
      '<path d="M154 240 162 226 170 232 178 212 186 220" fill="none" stroke="' + C.cyan + '" stroke-width="1.6"/>' +
      '<path d="M154 200 186 200M154 208 176 208" stroke="' + C.green + '" stroke-width="1.4" stroke-opacity=".8"/></g>' +
      '<path d="M78 104 Q78 60 110 60 Q118 60 124 64 Q92 70 86 110Z" fill="url(#rim)"/>' +
      '</g></svg>'));
  }

  var CITIZEN = {
    student: { accent: C.cyan,   label: 'pelajar' },
    worker:  { accent: C.amber,  label: 'pekerja' },
    elder:   { accent: C.green,  label: 'lansia' }
  };
  var CIT_EXPR = { hopeful: 1, confused: 2, protest: 3, relieved: 4 };

  function CitizenRender(host) {
    var v = host.getAttribute('variant') || 'student';
    var e = host.getAttribute('expression') || 'hopeful';
    var cfg = CITIZEN[v] || CITIZEN.student;
    var size = host.getAttribute('size') || '150';
    var ov = Assets.get('characters.citizen.' + v + '.' + e);
    host.style.width = /\D/.test(size) ? size : size + 'px';
    var root = base(host, '@keyframes nx-sw{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}.s{transform-origin:96px 190px;animation:nx-sw 5s ease-in-out infinite}');
    if (ov) { overrideImg(root, ov, 384, 480); return; }
    var arm = e === 'protest' ? 'M62 150 Q40 120 46 96' : (e === 'confused' ? 'M62 150 Q44 156 42 138' : 'M62 150 Q48 172 52 190');
    var FE = {
      hopeful:  { brow: 'M82 96 91 94M101 94 110 96', mouth: 'M88 118 Q96 124 104 118', eye: 2.9 },
      confused: { brow: 'M82 93 91 98M101 98 110 93', mouth: 'M89 119 Q96 115 103 120', eye: 2.6 },
      protest:  { brow: 'M82 92 91 98M101 98 110 92', mouth: '', eye: 2.4 },
      relieved: { brow: 'M82 97 91 96M101 96 110 97', mouth: 'M88 117 Q96 122 104 117', eye: 2.2 }
    };
    var f = FE[e] || FE.hopeful;
    var face = '<g stroke-linecap="round" fill="none">' +
      '<path d="' + f.brow + '" stroke="' + C.hair + '" stroke-width="2.2"/>' +
      '</g>' +
      '<circle cx="86" cy="106" r="' + f.eye + '" fill="' + C.hair + '"/>' +
      '<circle cx="106" cy="106" r="' + f.eye + '" fill="' + C.hair + '"/>' +
      (f.mouth
        ? '<path d="' + f.mouth + '" stroke="#7A3B3B" stroke-width="2.2" stroke-linecap="round" fill="none"/>'
        : '<ellipse cx="96" cy="119" rx="6" ry="4.6" fill="#7A3B3B" fill-opacity=".85"/>');
    var extra = v === 'student'
      ? '<path d="M126 128 Q150 136 146 176" fill="none" stroke="' + cfg.accent + '" stroke-width="6" stroke-opacity=".55"/><circle cx="80" cy="96" r="3" fill="' + cfg.accent + '"/>'
      : v === 'worker'
        ? '<path d="M64 78 Q96 58 128 78 L134 84 L58 84Z" fill="' + cfg.accent + '" fill-opacity=".85"/><rect x="112" y="146" width="34" height="26" rx="4" fill="' + cfg.accent + '" fill-opacity=".3" stroke="' + cfg.accent + '"/>'
        : '<path d="M70 84 Q96 62 122 84 Q122 118 96 124 Q70 118 70 84Z" fill="' + cfg.accent + '" fill-opacity=".25" stroke="' + cfg.accent + '" stroke-opacity=".6"/><path d="M136 140 136 200" stroke="' + cfg.accent + '" stroke-width="3" stroke-opacity=".7"/>';
    root.appendChild(el('div', null,
      '<svg viewBox="0 0 192 240" role="img" aria-label="Warga ' + cfg.label + ', ' + e + '">' +
      '<g class="s">' +
      '<path d="M36 240 Q40 162 96 148 Q152 162 156 240Z" fill="' + C.hull + '"/>' +
      '<path d="M36 240 Q40 162 96 148 Q80 176 74 240Z" fill="' + cfg.accent + '" fill-opacity=".12"/>' +
      '<circle cx="96" cy="106" r="34" fill="' + C.hull + '"/>' +
      '<path d="' + arm + '" fill="none" stroke="' + C.hull + '" stroke-width="13" stroke-linecap="round"/>' +
      extra +
      '<circle cx="96" cy="106" r="34" fill="none" stroke="' + cfg.accent + '" stroke-opacity=".45"/>' +
      face +
      '</g></svg>'));
  }

  function RegulatorRender(host) {
    var expr = host.getAttribute('expression') || 'formal';
    var size = host.getAttribute('size') || '200';
    var ov = Assets.get('characters.regulator.' + expr);
    host.style.width = /\D/.test(size) ? size : size + 'px';
    var root = base(host, '');
    if (ov) { overrideImg(root, ov, 512, 640); return; }
    var brow = expr === 'skeptical' ? 'M84 94 100 90M120 88 136 92' : expr === 'pressing' ? 'M84 88 100 94M120 94 136 88' : expr === 'acknowledging' ? 'M84 91 100 90M120 90 136 91' : 'M84 91 100 91M120 91 136 91';
    var mouth = expr === 'acknowledging' ? 'M101 120 Q110 126 119 120' : expr === 'pressing' ? 'M100 121 Q110 118 120 121' : 'M101 121 120 121';
    root.appendChild(el('div', null,
      '<svg viewBox="0 0 220 260" role="img" aria-label="Delegasi regulator, ' + expr + '">' +
      '<path d="M30 260 Q36 194 76 178 L144 178 Q184 194 190 260Z" fill="#16203A"/>' +
      '<path d="M96 178 110 212 124 178 L112 178 110 190 108 178Z" fill="' + C.violet + '" fill-opacity=".8"/>' +
      '<path d="M76 178 Q88 214 110 218 Q132 214 144 178 L128 178 Q118 200 110 202 Q102 200 92 178Z" fill="' + C.ink + '" fill-opacity=".14"/>' +
      '<path d="M80 106 Q80 64 110 64 Q140 64 140 106 Q140 150 110 154 Q80 150 80 106Z" fill="' + C.skin2 + '"/>' +
      '<path d="M78 96 Q80 56 110 54 Q140 56 142 96 Q132 76 110 74 Q88 76 78 96Z" fill="#20262F"/>' +
      '<circle cx="94" cy="104" r="2.9" fill="#20262F"/><circle cx="126" cy="104" r="2.9" fill="#20262F"/>' +
      '<path d="' + brow + '" stroke="#20262F" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="' + mouth + '" stroke="#6B3A3A" stroke-width="2.3" stroke-linecap="round" fill="none"/>' +
      '<path d="M104 186 110 232" stroke="' + C.violet + '" stroke-width="2" stroke-opacity=".8"/>' +
      '<rect x="96" y="230" width="28" height="18" rx="3" fill="' + C.violet + '" fill-opacity=".35" stroke="' + C.violet + '"/>' +
      '<path d="M80 106 Q80 64 110 64 Q118 64 124 68 Q94 74 88 112Z" fill="' + C.violet + '" fill-opacity=".14"/>' +
      '</svg>'));
  }

  /* =============================================================== ICONS  */
  var ICONS = {
    home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z',
    back: 'M14 5 7 12l7 7', forward: 'M10 5l7 7-7 7', close: 'M6 6l12 12M18 6 6 18',
    menu: 'M4 7h16M4 12h16M4 17h16', expand: 'M9 4H4v5M15 20h5v-5M20 9V4h-5M4 15v5h5',
    balance: 'M12 4v16M5 8h14M7 8l-3 6h6ZM17 8l-3 6h6ZM8 20h8',
    work: 'M4 5h7v7H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 14h7v5H4z',
    society: 'M3 12h3l2-5 3 10 3-7 2 4h5', constitution: 'M5 20h14M6 20V9M12 20V9M18 20V9M4 9h16L12 4Z',
    save: 'M5 5h11l3 3v11H5zM8 5v5h7V5M8 19v-5h8v5',
    reset: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5', info: 'M12 8h.01M11 12h1v5h1',
    warning: 'M12 4 3 19h18ZM12 10v4M12 17h.01', success: 'M5 13l4 4L19 7',
    lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3', unlock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 5.7-1.3',
    sound: 'M4 10v4h3l4 3V7l-4 3ZM15 9a4 4 0 0 1 0 6M18 6.5a7 7 0 0 1 0 11',
    'sound-off': 'M4 10v4h3l4 3V7l-4 3ZM16 10l4 4M20 10l-4 4',
    voice: 'M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3ZM6 11a6 6 0 0 0 12 0M12 17v3',
    subtitle: 'M3 5h18v14H3zM7 11h4M14 11h3M7 15h3M13 15h4',
    play: 'M8 5l11 7-11 7Z', pause: 'M8 5v14M16 5v14'
  };
  function IconRender(host) {
    var name = host.getAttribute('name') || 'info';
    var size = host.getAttribute('size') || '24';
    var sw = host.getAttribute('stroke') || '1.75';
    var ov = Assets.get('icons.' + name);
    host.style.width = size + 'px'; host.style.height = size + 'px';
    host.style.color = host.style.color || 'currentColor';
    var root = base(host, 'svg{width:100%;height:100%}');
    if (ov) { overrideImg(root, ov, size, size); return; }
    root.appendChild(el('div', null,
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="' + name + '">' +
      '<path d="' + (ICONS[name] || ICONS.info) + '"/></svg>'));
  }

  /* ============================================================== SCENES  */
  var SCENES = {
    hub: { sky: ['#0D2A4A', '#071426'], accent: C.cyan, dust: 40, haze: .16, label: 'Orbital Lab' },
    future: { sky: ['#1A1040', '#071426'], accent: C.violet, dust: 16, haze: .3, label: 'Ruang Simulasi' },
    work: { sky: ['#123A44', '#08202B'], accent: C.green, dust: 10, haze: .08, label: 'Lantai Kerja' },
    social: { sky: ['#2A1B2E', '#0A1220'], accent: C.amber, dust: 18, haze: .26, label: 'Ruang Dampak' },
    constitution: { sky: ['#101A2E', '#050D18'], accent: C.ink, dust: 0, haze: .1, label: 'Ruang Konstitusi' },
    ending: { sky: ['#0E2E3A', '#071426'], accent: C.green, dust: 24, haze: .2, label: 'Proyeksi 2060' }
  };

  function sceneLayers(name, s) {
    if (name === 'hub') {
      return '<g opacity=".9"><circle cx="600" cy="470" r="250" fill="#0B2E52"/>' +
        '<g stroke="' + C.cyan + '" stroke-opacity=".35" fill="none"><path d="M380 420q220 70 440 0M392 500q208 70 416 0M420 560q180 60 360 0M600 220v500M480 246q60 460 0 0M720 246q-60 460 0 0"/></g>' +
        '<circle cx="600" cy="470" r="250" fill="none" stroke="' + C.cyan + '" stroke-opacity=".5"/></g>' +
        '<path d="M0 620h1200v40H0z" fill="#0A2038"/>' +
        '<g fill="none" stroke="' + C.cyan + '" stroke-opacity=".5"><path d="M120 660v-90h180v90M900 660v-90h180v90"/><path d="M150 600h120M150 620h90M930 600h120M930 620h80"/></g>' +
        '<path d="M300 0 380 660M900 0 820 660" stroke="' + C.cyan + '" stroke-opacity=".12" stroke-width="40"/>';
    }
    if (name === 'future') {
      // Ruang simulasi: kubah rusuk + poros cahaya. Tidak ada bentuk batang/baseline
      // supaya latar tidak pernah terbaca sebagai grafik di balik diagram kelas.
      var ribs = '';
      for (var i = 0; i < 7; i++) {
        var sp = 90 + i * 130;
        ribs += '<path d="M' + sp + ' 660 Q600 ' + (90 + i * 26) + ' ' + (1110 - i * 130) + ' 660" fill="none" stroke="' + C.violet + '" stroke-opacity=".1" stroke-width="1.5"/>';
      }
      var halos = '';
      for (var r = 0; r < 4; r++) halos += '<ellipse cx="600" cy="600" rx="' + (200 + r * 150) + '" ry="' + (34 + r * 22) + '" fill="none" stroke="' + C.violet + '" stroke-opacity=".12"/>';
      return '<path d="M0 660V330Q600 120 1200 330v330Z" fill="' + C.violet + '" fill-opacity=".06"/>' +
        ribs + halos +
        '<path d="M600 600V140" stroke="' + C.violet + '" stroke-opacity=".1" stroke-width="180"/>' +
        '<ellipse cx="600" cy="600" rx="150" ry="26" fill="' + C.violet + '" fill-opacity=".14"/>';
    }
    if (name === 'work') {
      return '<rect x="0" y="470" width="1200" height="190" fill="#0C2833"/>' +
        '<g stroke="' + C.green + '" stroke-opacity=".45" fill="none"><path d="M140 470v-90h220v90M160 400h180M160 424h120"/>' +
        '<path d="M840 470V330l80-60 60 50M900 300l60 40"/><circle cx="990" cy="316" r="16"/></g>' +
        '<g stroke="' + C.ink + '" stroke-opacity=".18" fill="none"><path d="M480 470V300h240v170M500 330h200M500 366h160M500 402h200"/></g>' +
        '<circle cx="600" cy="120" r="130" fill="#F7E6B8" fill-opacity=".08"/>';
    }
    if (name === 'social') {
      // distrik jauh: kecil, redup, duduk di bawah — latar, bukan subjek
      var w = '', PROF = [140, 96, 178, 118, 210, 88, 156, 124, 196, 104, 168, 132];
      for (var b = 0; b < 12; b++) {
        var bx = 24 + b * 100, bh = PROF[b];
        w += '<rect x="' + bx + '" y="' + (660 - bh) + '" width="72" height="' + bh + '" fill="#0E1626" fill-opacity=".9"/>';
        for (var r = 0; r < Math.floor(bh / 40); r++) for (var c = 0; c < 3; c++) {
          if (((b * 7 + r * 3 + c * 5) % 4) === 0) continue;
          w += '<rect x="' + (bx + 10 + c * 22) + '" y="' + (660 - bh + 14 + r * 40) + '" width="9" height="12" fill="' + C.amber + '" fill-opacity=".3"/>';
        }
      }
      return w + '<rect x="0" y="380" width="1200" height="280" fill="#0A1220" fill-opacity=".45"/>' +
        '<rect x="0" y="646" width="1200" height="14" fill="#0A1220"/>' +
        '<g stroke="' + C.mute + '" stroke-opacity=".18" fill="none"><path d="M0 612h1200M0 578h1200"/></g>';
    }
    if (name === 'constitution') {
      var p = '';
      for (var j = 0; j < 6; j++) {
        var px = 210 + j * 156;
        p += '<rect x="' + px + '" y="180" width="34" height="400" fill="' + C.cyan + '" fill-opacity=".07"/>' +
          '<rect x="' + px + '" y="180" width="34" height="400" fill="none" stroke="' + C.ink + '" stroke-opacity=".22"/>' +
          '<ellipse cx="' + (px + 17) + '" cy="580" rx="40" ry="10" fill="' + C.cyan + '" fill-opacity=".12"/>';
      }
      return p + '<ellipse cx="600" cy="610" rx="330" ry="54" fill="#0B1626" stroke="' + C.ink + '" stroke-opacity=".2"/>' +
        '<path d="M600 0v180" stroke="' + C.ink + '" stroke-opacity=".1" stroke-width="220"/>';
    }
    var sk = '';
    for (var q = 0; q < 12; q++) {
      var qx = 40 + q * 100, qh = 120 + ((q * 113) % 220);
      sk += '<rect x="' + qx + '" y="' + (660 - qh) + '" width="64" height="' + qh + '" fill="#0C2436" stroke="' + C.green + '" stroke-opacity=".3"/>';
      sk += '<rect x="' + (qx + 14) + '" y="' + (660 - qh - 26) + '" width="36" height="26" fill="' + C.green + '" fill-opacity=".18"/>';
    }
    return sk;
  }

  function SceneRender(host) {
    var name = host.getAttribute('name') || 'hub';
    var s = SCENES[name] || SCENES.hub;
    var ov = Assets.get('environments.' + name + '.plate');
    var root = base(host, [
      ':host{display:block;position:relative;width:100%;height:100%;overflow:hidden;background:' + s.sky[1] + '}',
      '.w{position:absolute;inset:0}',
      '.plate{width:100%;height:100%;object-fit:cover}',
      '@keyframes nx-dust{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:.7}100%{transform:translate3d(var(--dx),var(--dy),0);opacity:0}}',
      '.d{position:absolute;width:2px;height:2px;border-radius:50%;background:' + s.accent + ';animation:nx-dust linear infinite}',
      '.haze{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 30%,' + s.accent + '00,' + s.accent + '00 40%,transparent),linear-gradient(180deg,transparent 40%,' + s.sky[1] + 'cc)}',
      '.vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 180px 40px rgba(3,8,16,.75)}'
    ].join(''));

    var wrap = el('div', { class: 'w' });
    if (ov) { wrap.appendChild(el('img', { class: 'plate', src: ov, alt: '' })); }
    else {
      wrap.innerHTML = '<svg class="plate" viewBox="0 0 1200 660" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.sky[0] + '"/><stop offset="1" stop-color="' + s.sky[1] + '"/></linearGradient></defs>' +
        '<rect width="1200" height="660" fill="url(#sky)"/>' + sceneLayers(name, s) + '</svg>';
    }
    root.appendChild(wrap);

    if (!RM && s.dust) {
      var dw = el('div', { class: 'w', style: 'pointer-events:none' });
      var html = '';
      for (var i = 0; i < s.dust; i++) {
        html += '<span class="d" style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) +
          '%;--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;--dy:' + (-40 - Math.random() * 80).toFixed(0) +
          'px;animation-duration:' + (7 + Math.random() * 9).toFixed(1) + 's;animation-delay:-' + (Math.random() * 10).toFixed(1) + 's;opacity:0"></span>';
      }
      dw.innerHTML = html;
      root.appendChild(dw);
    }
    root.appendChild(el('div', { class: 'haze', style: 'opacity:' + s.haze }));
    root.appendChild(el('div', { class: 'vig' }));
    var slot = el('slot'); var sh = el('div', { style: 'position:relative;width:100%;height:100%' });
    sh.appendChild(slot); root.appendChild(sh);
  }

  /* =============================================================== PANEL  */
  function PanelRender(host) {
    var tone = host.getAttribute('tone') || 'neutral';
    var map = { neutral: C.mute, info: C.cyan, ai: C.violet, success: C.green, warning: C.amber, critical: C.coral };
    var a = map[tone] || C.mute;
    var root = base(host, [
      ':host{display:block;position:relative}',
      '.p{position:relative;border-radius:18px;background:rgba(7,20,38,.72);border:1px solid ' + a + '33;backdrop-filter:blur(10px);box-shadow:0 18px 40px -24px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.02) inset;padding:var(--pad,20px);overflow:hidden}',
      '@keyframes nx-bd{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}',
      '.bd{position:absolute;top:0;left:0;height:1px;width:40%;background:linear-gradient(90deg,transparent,' + a + ',transparent);animation:nx-bd 3.6s linear infinite}',
      '.gl{position:absolute;inset:-40% 40% 60% -10%;background:radial-gradient(ellipse,' + a + '22,transparent 70%);pointer-events:none}'
    ].join(''));
    var p = el('div', { class: 'p' });
    p.appendChild(el('div', { class: 'gl' }));
    if (host.hasAttribute('animate-border')) p.appendChild(el('div', { class: 'bd' }));
    p.appendChild(el('slot'));
    root.appendChild(p);
  }

  /* ============================================================ COUNT-UP  */
  function animateCount(node, from, to, dur, fmt) {
    if (RM || !(dur > 0) || !isFinite(from) || !isFinite(to)) { node.textContent = fmt(isFinite(to) ? to : 0); return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ================================================================= FX   */
  var FX = {
    scan: function (target, opts) {
      opts = opts || {};
      if (!target || RM) return Promise.resolve();
      var dur = opts.duration || 900, color = opts.color || C.cyan;
      var cs = getComputedStyle(target);
      if (cs.position === 'static') target.style.position = 'relative';
      var line = document.createElement('div');
      line.setAttribute('aria-hidden', 'true');
      line.style.cssText = 'position:absolute;left:0;right:0;top:0;height:26%;pointer-events:none;z-index:40;' +
        'background:linear-gradient(to bottom,transparent,' + color + '26,' + color + ',' + color + '26,transparent);' +
        'opacity:.7;will-change:transform';
      target.appendChild(line);
      var a = line.animate(
        [{ transform: 'translateY(-110%)' }, { transform: 'translateY(400%)' }],
        { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' });
      return a.finished.then(function () { line.remove(); }).catch(function () { line.remove(); });
    },
    burst: function (x, y, opts) {
      opts = opts || {};
      if (RM) return;
      var n = opts.count || 18, color = opts.color || C.cyan;
      var host = document.createElement('div');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:9998;pointer-events:none';
      document.body.appendChild(host);
      for (var i = 0; i < n; i++) {
        var ang = (i / n) * Math.PI * 2 + Math.random() * .4, d = 40 + Math.random() * 70;
        var p = document.createElement('span');
        p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:5px;height:5px;border-radius:50%;background:' + color + ';will-change:transform,opacity';
        host.appendChild(p);
        p.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: 'translate(' + (Math.cos(ang) * d - 50) + '%,' + (Math.sin(ang) * d - 50) + '%) scale(0)', opacity: 0 }
        ], { duration: 550 + Math.random() * 250, easing: 'cubic-bezier(.2,.6,.3,1)' });
      }
      setTimeout(function () { host.remove(); }, 900);
    },
    hologram: function (target, on) {
      if (!target) return;
      if (on === false) { target.style.filter = ''; target.style.opacity = ''; return; }
      target.style.filter = 'drop-shadow(0 0 12px ' + C.violet + '66)';
      target.style.opacity = '.94';
    },
    count: animateCount,
    /* Full decision feedback chain — visuals + audio only. No game logic. */
    decision: function (opts) {
      opts = opts || {};
      var panel = opts.panel, pt = opts.point;
      return Promise.resolve()
        .then(function () { window.NexaAudio && NexaAudio.playSFX('scan'); return FX.scan(panel, { color: opts.color || C.cyan }); })
        .then(function () { return new Promise(function (r) { setTimeout(r, opts.think || 420); }); })
        .then(function () {
          window.NexaAudio && NexaAudio.playSFX('decision');
          if (pt) FX.burst(pt.x, pt.y, { color: opts.color || C.cyan });
          if (typeof opts.onCount === 'function') opts.onCount();
        })
        .then(function () { return new Promise(function (r) { setTimeout(r, opts.hold || 520); }); })
        .then(function () { if (typeof opts.onDone === 'function') opts.onDone(); });
    }
  };
  window.NexaFX = FX;

  /* ============================================================== AUDIO   */
  var SFX_DEF = {
    click:   { type: 'blip', f: 880,  f2: 1180, d: .05, g: .16, w: 'triangle' },
    hover:   { type: 'blip', f: 1400, f2: 1500, d: .03, g: .06, w: 'sine' },
    press:   { type: 'blip', f: 520,  f2: 380,  d: .06, g: .18, w: 'square' },
    scan:    { type: 'sweep', f: 300, f2: 2400, d: .55, g: .1,  w: 'sawtooth' },
    decision:{ type: 'chord', notes: [440, 660, 880], d: .5, g: .12, w: 'triangle' },
    unlock:  { type: 'chord', notes: [523, 659, 784, 1046], d: .7, g: .14, w: 'triangle' },
    warning: { type: 'blip', f: 320, f2: 240, d: .28, g: .18, w: 'square' },
    success: { type: 'chord', notes: [659, 880], d: .4, g: .13, w: 'sine' },
    delta_up:{ type: 'blip', f: 700, f2: 1050, d: .12, g: .12, w: 'sine' },
    delta_dn:{ type: 'blip', f: 700, f2: 420,  d: .14, g: .12, w: 'sine' },
    toast:   { type: 'chord', notes: [880, 1175], d: .22, g: .1, w: 'sine' },
    disabled:{ type: 'blip', f: 160, f2: 130, d: .12, g: .14, w: 'sine' },
    boot:    { type: 'sweep', f: 120, f2: 900, d: 1.2, g: .12, w: 'sine' },
    pillar:  { type: 'chord', notes: [392, 588], d: .45, g: .11, w: 'triangle' }
  };
  // Nada petikan jarang (bukan pad bernada tetap): tiap nada meredup sampai nol,
  // jadi tidak ada bunyi yang menyala terus-menerus di latar.
  var BGM_DEF = {
    hub:          { root: 220, steps: [0, 3, 5, 7, 10], lp: 1500, g: .075, gap: [2600, 4200] },
    future:       { root: 261.63, steps: [0, 2, 5, 7, 9], lp: 1700, g: .07, gap: [2800, 4600] },
    work:         { root: 196, steps: [0, 3, 5, 7, 12], lp: 1900, g: .065, gap: [2200, 3600] },
    social:       { root: 174.61, steps: [0, 3, 7, 10, 12], lp: 1300, g: .075, gap: [3000, 5000] },
    constitution: { root: 164.81, steps: [0, 5, 7, 12, 14], lp: 1100, g: .08, gap: [3400, 5600] },
    ending:       { root: 233.08, steps: [0, 4, 7, 9, 11], lp: 1600, g: .075, gap: [2600, 4400] }
  };
  var PREF_KEY = 'nexa.audio.prefs';

  var Audio_ = {
    ctx: null, master: null, bgmGain: null, sfxGain: null, voiceGain: null,
    bgmNodes: null, bgmName: null, armed: false, voiceEl: null,
    prefs: { muted: false, bgm: .5, sfx: .8, voice: 1 },

    init: function () {
      try {
        var saved = localStorage.getItem(PREF_KEY);
        if (saved) this.prefs = Object.assign(this.prefs, JSON.parse(saved));
      } catch (e) {}
      return this;
    },
    save: function () { try { localStorage.setItem(PREF_KEY, JSON.stringify(this.prefs)); } catch (e) {} },
    arm: function () {
      if (this.armed) return this;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return this;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.prefs.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain(); this.bgmGain.gain.value = this.prefs.bgm; this.bgmGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.prefs.sfx; this.sfxGain.connect(this.master);
      this.voiceGain = this.ctx.createGain(); this.voiceGain.gain.value = this.prefs.voice; this.voiceGain.connect(this.master);
      this.armed = true;
      if (this.bgmName) { var n = this.bgmName; this.bgmName = null; this.playBGM(n); }
      return this;
    },
    resume: function () { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return this; },
    setMuted: function (m) {
      this.prefs.muted = !!m; this.save();
      if (this.master) this.master.gain.value = m ? 0 : 1;
      return this;
    },
    setVolume: function (bus, v) {
      v = Math.max(0, Math.min(1, v));
      this.prefs[bus] = v; this.save();
      var g = bus === 'bgm' ? this.bgmGain : bus === 'voice' ? this.voiceGain : this.sfxGain;
      if (g) g.gain.value = v;
      return this;
    },

    playSFX: function (name) {
      var url = Assets.get('audio.sfx.' + name);
      if (url) return this._file(url, this.prefs.sfx);
      if (!this.armed) this.arm();
      if (!this.ctx || this.prefs.muted) return;
      this.resume();
      var d = SFX_DEF[name]; if (!d) return;
      var t = this.ctx.currentTime, self = this;
      function tone(freq, freq2, dur, gain, wave, delay) {
        var o = self.ctx.createOscillator(), g = self.ctx.createGain();
        o.type = wave || 'sine';
        o.frequency.setValueAtTime(freq, t + delay);
        if (freq2) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq2), t + delay + dur);
        g.gain.setValueAtTime(0, t + delay);
        g.gain.linearRampToValueAtTime(gain, t + delay + .012);
        g.gain.exponentialRampToValueAtTime(.0001, t + delay + dur);
        o.connect(g); g.connect(self.sfxGain); o.start(t + delay); o.stop(t + delay + dur + .05);
      }
      if (d.type === 'chord') d.notes.forEach(function (f, i) { tone(f, null, d.d, d.g / d.notes.length * 1.6, d.w, i * .055); });
      else tone(d.f, d.f2, d.d, d.g, d.w, 0);
    },

    playBGM: function (name, opts) {
      opts = opts || {};
      if (this.bgmName === name) return;
      var url = Assets.get('audio.bgm.' + name);
      this.stopBGM(opts.fade == null ? .8 : opts.fade);
      this.bgmName = name;
      if (url) {
        var a = new Audio(url); a.loop = true; a.volume = this.prefs.muted ? 0 : this.prefs.bgm;
        a.play().catch(function () {});
        this.bgmNodes = { file: a };
        return;
      }
      if (!this.armed) this.arm();
      if (!this.ctx) return;
      this.resume();
      var d = BGM_DEF[name] || BGM_DEF.hub, ctx = this.ctx, self = this;
      var g = ctx.createGain(); g.gain.value = d.g;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = d.lp;
      lp.connect(g); g.connect(this.bgmGain);
      var nodes = { g: g, timer: null, stopped: false };
      var last = -1;
      function pluck(semi, when, vel, oct) {
        var o = ctx.createOscillator(), og = ctx.createGain();
        o.type = oct > 1 ? 'sine' : 'triangle';
        o.frequency.value = d.root * Math.pow(2, semi / 12) * oct;
        og.gain.setValueAtTime(0, when);
        og.gain.linearRampToValueAtTime(vel, when + .05);
        og.gain.exponentialRampToValueAtTime(.0001, when + 2.4 + Math.random());
        o.connect(og); og.connect(lp); o.start(when); o.stop(when + 4);
      }
      function step() {
        if (nodes.stopped) return;
        var i = Math.floor(Math.random() * d.steps.length);
        if (i === last) i = (i + 1) % d.steps.length;
        last = i;
        var t0 = ctx.currentTime + .05, oct = Math.random() < .3 ? 2 : 1;
        pluck(d.steps[i], t0, .5, oct);
        // sesekali nada kedua sebagai jawaban, bukan akor yang menggantung
        if (Math.random() < .35) pluck(d.steps[(i + 2) % d.steps.length], t0 + .9 + Math.random() * .6, .3, oct === 2 ? 1 : 2);
        nodes.timer = setTimeout(step, d.gap[0] + Math.random() * (d.gap[1] - d.gap[0]));
      }
      step();
      this.bgmNodes = nodes;
    },
    stopBGM: function (fade) {
      var n = this.bgmNodes; this.bgmNodes = null; this.bgmName = null;
      if (!n) return;
      if (n.file) { n.file.pause(); return; }
      var t = this.ctx.currentTime, f = fade == null ? .6 : fade;
      n.stopped = true;
      if (n.timer) clearTimeout(n.timer);
      try {
        n.g.gain.cancelScheduledValues(t);
        n.g.gain.setValueAtTime(n.g.gain.value, t);
        n.g.gain.linearRampToValueAtTime(0, t + f);
      } catch (e) {}
      setTimeout(function () {
        (n.oscs || []).forEach(function (o) { try { o.stop(); } catch (e) {} });
        try { if (n.lfo) n.lfo.stop(); } catch (e) {}
        try { if (n.breath) n.breath.stop(); } catch (e) {}
      }, f * 1000 + 80);
    },

    /* Voice: plays a recorded line if the manifest has one, otherwise resolves
       immediately so subtitles/pacing still work with no audio asset. */
    playVoice: function (id, opts) {
      opts = opts || {};
      var url = Assets.get('audio.voice.' + id);
      if (this.voiceEl) { try { this.voiceEl.pause(); } catch (e) {} this.voiceEl = null; }
      if (!url || this.prefs.muted) {
        if (typeof opts.onEnd === 'function') setTimeout(opts.onEnd, opts.fallbackMs || 0);
        return Promise.resolve(false);
      }
      var a = new Audio(url); a.volume = this.prefs.voice; this.voiceEl = a;
      var p = a.play(); if (p && p.catch) p.catch(function () {});
      return new Promise(function (res) {
        a.onended = function () { if (typeof opts.onEnd === 'function') opts.onEnd(); res(true); };
      });
    },
    stopVoice: function () { if (this.voiceEl) { try { this.voiceEl.pause(); } catch (e) {} this.voiceEl = null; } return this; }
  }.init();
  window.NexaAudio = Audio_;

  /* One-time arm on first gesture (browser autoplay policy). */
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function once() {
      Audio_.arm().resume();
      window.removeEventListener(ev, once);
    }, { once: true, passive: true });
  });

  /* ========================================================== REGISTRATION */
  function define(tag, render, attrs) {
    if (customElements.get(tag)) return;
    customElements.define(tag, class extends HTMLElement {
      static get observedAttributes() { return attrs; }
      connectedCallback() { render(this); }
      attributeChangedCallback() { if (this.shadowRoot) render(this); }
    });
  }
  define('nexa-avatar', NexaAvatarRender, ['state', 'size']);
  define('mentor-avatar', MentorRender, ['expression', 'size']);
  define('citizen-avatar', CitizenRender, ['variant', 'expression', 'size']);
  define('regulator-avatar', RegulatorRender, ['expression', 'size']);
  define('nexa-icon', IconRender, ['name', 'size', 'stroke']);
  define('nexa-scene', SceneRender, ['name']);
  define('nexa-panel', PanelRender, ['tone', 'animate-border']);

  if (!customElements.get('nexa-count')) {
    customElements.define('nexa-count', class extends HTMLElement {
      static get observedAttributes() { return ['value', 'duration', 'decimals', 'prefix', 'suffix']; }
      connectedCallback() { this._cur = parseFloat(this.getAttribute('value')) || 0; this._paint(this._cur, 0); }
      attributeChangedCallback(n, o) {
        if (n !== 'value' || o == null) return;
        var d = parseInt(this.getAttribute('duration') || 520, 10);
        this._paint(parseFloat(this.getAttribute('value')) || 0, isFinite(d) ? d : 520);
      }
      _paint(to, dur) {
        var dec = parseInt(this.getAttribute('decimals') || 0, 10);
        var pre = this.getAttribute('prefix') || '', suf = this.getAttribute('suffix') || '';
        var from = this._cur == null || !isFinite(this._cur) ? to : this._cur;
        if (!isFinite(to)) to = 0;
        this.style.fontVariantNumeric = 'tabular-nums';
        animateCount(this, from, to, dur, function (v) { return pre + v.toFixed(dec) + suf; });
        this._cur = to;
      }
    });
  }

  /* Optional: auto-load the manifest if present, then repaint mounted assets. */
  Assets.load('assets/manifest.json').then(function (m) {
    if (!Object.keys(m).length) return;
    document.querySelectorAll('nexa-avatar,mentor-avatar,citizen-avatar,regulator-avatar,nexa-icon,nexa-scene')
      .forEach(function (n) { if (n.shadowRoot) n.connectedCallback && n.connectedCallback(); });
  });
})();
