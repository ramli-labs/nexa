/* ============================================================================
   NEXA — VOICE CONFIG
   Registry baris voice-over. Satu sumber kebenaran untuk id, karakter, emosi,
   path audio, subtitle, dan durasi perkiraan.

   Dipakai oleh: voice-manager.js  (window.VoiceManager)
   Global:       window.NexaVoiceConfig

   Menambah / mengganti suara:
     1. Rekam file sesuai kolom `audio` (mp3 80 kbps mono, atau .webm Opus).
     2. Simpan di path itu — tidak perlu ubah kode.
     3. Jika belum ada file: sistem otomatis memakai fallback
        (subtitle + animasi per kata + SFX). Tidak ada error.

   `duration` = perkiraan detik untuk sinkronisasi subtitle SEBELUM audio asli
   ada. Saat file audio tersedia, durasi nyata dari metadata audio dipakai dan
   nilai di sini diabaikan.
============================================================================ */
(function () {
  'use strict';

  var BASE = './assets/audio/voice/';

  /* character voice direction — dipakai VOICE_SCRIPT.md & panel audio */
  var CHARACTERS = {
    NEXA: {
      label: 'NARA-01 (NEXA Core)',
      folder: 'nexa',
      gender: 'neutral AI',
      persona: 'tenang, cerdas, presisi — bukan robot kaku',
      processing: 'ringan: high-shelf +2 dB, reverb plate 8%, sedikit bitcrush pada ekor kata',
      pace: 'sedang, jeda jelas antar klausa'
    },
    MENTOR: {
      label: 'KAIA (Mentor)',
      folder: 'mentor',
      gender: 'perempuan Indonesia, 40-an',
      persona: 'hangat, profesional, membimbing — seperti guru yang dipercaya',
      processing: 'natural, tanpa efek. Kompresi lembut 3:1',
      pace: 'lebih lambat dari NEXA, ada napas'
    },
    ORION: {
      label: 'ORION (City AI)',
      folder: 'orion',
      gender: 'maskulin sintetis, rendah',
      persona: 'efisien, persuasif, sedikit dingin — optimizer yang sopan',
      processing: 'pitch -2 semitone, chorus tipis, gerbang noise ketat',
      pace: 'cepat dan datar'
    },
    CITIZEN: {
      label: 'Warga 2045',
      folder: 'citizen',
      gender: 'campuran (pelajar, pekerja, lansia)',
      persona: 'suara manusia natural, tidak teatrikal — rekaman ruang nyata',
      processing: 'tanpa efek, room tone dipertahankan',
      pace: 'natural, boleh ada ragu'
    },
    REGULATOR: {
      label: 'Delegasi Regulator',
      folder: 'regulator',
      gender: 'dewasa, netral-formal',
      persona: 'formal, tegas, institusional — mewakili lembaga, bukan diri sendiri',
      processing: 'sedikit ruang aula (reverb hall 12%)',
      pace: 'mantap, penuh titik'
    }
  };

  /* --------------------------------------------------------------- lines --- */
  function L(id, character, emotion, file, subtitle, duration, scene) {
    return {
      id: id,
      character: character,
      emotion: emotion,
      audio: BASE + CHARACTERS[character].folder + '/' + file,
      subtitle: subtitle,
      duration: duration,
      scene: scene || ''
    };
  }

  var LINES = [
    /* ───────────────────────── NEXA / NARA-01 · 20 baris ───────────────── */
    L('nexa_boot_01', 'NEXA', 'calm', 'boot_01.mp3',
      'Sistem NEXA aktif. Menyiapkan Orbital Lab.', 3.0, 'Opening'),
    L('nexa_intro_01', 'NEXA', 'calm', 'intro_01.mp3',
      'Selamat datang di NEXA Simulation Lab.', 2.8, 'Tujuan Pembelajaran'),
    L('nexa_intro_02', 'NEXA', 'calm', 'intro_02.mp3',
      'Di sini, kamu tidak hanya mempelajari masa depan. Kamu akan merancangnya.', 5.4, 'Tujuan Pembelajaran'),
    L('nexa_hub_01', 'NEXA', 'informative', 'hub_01.mp3',
      'Empat simulasi telah disiapkan. Simulasi keempat terbuka setelah tiga lainnya selesai.', 6.2, 'Orbital Lab · kunjungan pertama'),
    L('nexa_hub_02', 'NEXA', 'analytical', 'hub_02.mp3',
      'Setiap simulasi menunjukkan tantangan masa depan yang berbeda. Pilih satu untuk memulai.', 6.0, 'Orbital Lab · kunjungan pertama'),
    L('nexa_hub_progress_01', 'NEXA', 'analytical', 'hub_progress_01.mp3',
      'Future Balance diperbarui. Masih ada simulasi yang menunggu sebelum Ruang Konstitusi terbuka.', 6.6, 'Orbital Lab · 1–2 modul selesai'),
    L('nexa_hub_complete_01', 'NEXA', 'affirming', 'hub_complete_01.mp3',
      'Semua sistem telah dirancang. Buka profilmu untuk melihat dunia yang terbentuk.', 5.6, 'Orbital Lab · semua modul selesai'),
    L('nexa_module_school_01', 'NEXA', 'informative', 'module_school_01.mp3',
      'Modul satu. Smart School dua ribu empat puluh lima. Enam parameter menunggu keputusanmu.', 6.4, 'Modul 01 · masuk'),
    L('nexa_module_city_01', 'NEXA', 'informative', 'module_city_01.mp3',
      'Modul dua. Kota ini dikelola oleh ORION. Dengarkan usulannya, tetapi keputusan tetap milikmu.', 6.8, 'Modul 02 · masuk'),
    L('nexa_module_work_01', 'NEXA', 'calm', 'module_work_01.mp3',
      'Pekerjaan berubah. Kemampuan manusia juga harus berkembang.', 4.4, 'Modul 03 · masuk'),
    L('nexa_module_work_02', 'NEXA', 'analytical', 'module_work_02.mp3',
      'Energi pengembangan terbatas: dua belas unit. Mana yang paling penting untuk dua ribu empat puluh lima?', 7.4, 'Modul 03 · alokasi'),
    L('nexa_module_future_01', 'NEXA', 'calm', 'module_future_01.mp3',
      'Tidak ada masa depan yang tercipta tanpa pilihan. Setiap prinsip akan membentuk segel.', 6.2, 'Modul 04 · Konstitusi'),
    L('nexa_warning_01', 'NEXA', 'warning', 'warning_01.mp3',
      'Peringatan. Indikator kemanusiaan turun di bawah ambang aman. Sistem efisien, tetapi warga mulai kehilangan tempat.', 8.4, 'Event · human rendah'),
    L('nexa_warning_02', 'NEXA', 'warning', 'warning_02.mp3',
      'Peringatan. Tanggung jawab tidak terdefinisi. Jika sistem ini salah, tidak ada yang dapat menjawab.', 7.2, 'Event · responsibility rendah'),
    L('nexa_warning_03', 'NEXA', 'warning', 'warning_03.mp3',
      'Otomasi melampaui kapasitas pengawasan manusia. Kecepatan naik, kendali menurun.', 6.0, 'Event · otomasi ekstrem'),
    L('nexa_decision_01', 'NEXA', 'analytical', 'decision_01.mp3',
      'Pilihanmu menciptakan konsekuensi. Tidak ada yang salah — hanya trade-off yang berbeda.', 6.4, 'Layar Konsekuensi'),
    L('nexa_decision_02', 'NEXA', 'affirming', 'decision_02.mp3',
      'Desain terkunci. Menghitung dampaknya terhadap dua ribu empat puluh lima.', 5.2, 'Kunci modul'),
    L('nexa_decision_03', 'NEXA', 'analytical', 'decision_03.mp3',
      'Menghitung ulang. Parameter berubah, proyeksi ikut bergeser.', 4.6, 'Parameter diubah setelah lock'),
    L('nexa_ending_01', 'NEXA', 'affirming', 'ending_01.mp3',
      'Saya dapat menghitung kemungkinan masa depan. Kamu yang memutuskan masa depan mana yang layak dibangun.', 8.0, 'Future Profile'),
    L('nexa_ending_02', 'NEXA', 'calm', 'ending_02.mp3',
      'Simulasi selesai. Dunia ini hanya satu dari banyak kemungkinan — dan kamu yang memilihnya.', 6.6, 'Hasil Akhir'),

    /* ───────────────────────── MENTOR / KAIA · 10 baris ─────────────────── */
    L('mentor_intro', 'MENTOR', 'warm', 'intro.mp3',
      'Teknologi tidak cukup hanya canggih. Kita harus memastikan masa depan tetap manusiawi.', 6.4, 'Tujuan Pembelajaran'),
    L('mentor_explanation', 'MENTOR', 'explaining', 'explanation.mp3',
      'AI dapat membantu belajar lebih personal.', 3.2, 'Modul 01 · masuk'),
    L('mentor_explanation_02', 'MENTOR', 'concerned', 'explanation_02.mp3',
      'Tetapi sekolah bukan hanya tempat menerima informasi. Perhatikan garis interaksi saat kamu menggeser parameter.', 8.2, 'Modul 01 · parameter'),
    L('mentor_explanation_03', 'MENTOR', 'explaining', 'explanation_03.mp3',
      'Setiap kenaikan di satu sisi biasanya menurunkan sisi lain. Itu bukan kegagalan — itu cara sistem bekerja.', 7.8, 'Layar Konsekuensi'),
    L('mentor_reflection', 'MENTOR', 'reflective', 'reflection.mp3',
      'Ini bukan hanya soal aturan. Ini soal nilai seperti apa yang ingin kita jaga.', 6.0, 'Modul 04 · Konstitusi'),
    L('mentor_reflection_02', 'MENTOR', 'encouraging', 'reflection_02.mp3',
      'Bawa jawabanmu ke diskusi kelas. Masa depan dirancang bersama.', 5.0, 'Refleksi & Diskusi'),
    L('mentor_unlock', 'MENTOR', 'reflective', 'unlock.mp3',
      'Ruang Konstitusi telah terbuka. Ini saatnya menuliskan nilai yang ingin kita jaga.', 6.2, 'Orbital Lab · 3 modul selesai'),
    L('mentor_concern', 'MENTOR', 'concerned', 'concern.mp3',
      'Coba lihat sekali lagi. Dunia yang kamu rancang efisien, tetapi apakah kamu ingin tinggal di dalamnya?', 7.6, 'Event · balance ekstrem'),
    L('mentor_praise', 'MENTOR', 'proud', 'praise.mp3',
      'Kamu menimbang, bukan hanya memilih. Itu yang membedakan perancang dari pengguna.', 6.4, 'Hasil seimbang'),
    L('mentor_debrief', 'MENTOR', 'warm', 'debrief.mp3',
      'Bandingkan hasilmu dengan temanmu. Dunia yang sama-sama berhasil bisa terlihat sangat berbeda.', 7.0, 'Hasil Akhir · debrief'),

    /* ───────────────────────── ORION · 3 baris ──────────────────────────── */
    L('orion_offer_01', 'ORION', 'persuasive', 'offer_01.mp3',
      'Sistem kota dapat menjadi lebih efisien.', 3.2, 'Modul 02 · masuk'),
    L('orion_offer_02', 'ORION', 'calculating', 'offer_02.mp3',
      'Pertanyaannya: berapa banyak data yang akan Anda gunakan?', 4.4, 'Modul 02 · permintaan data'),
    L('orion_push_01', 'ORION', 'calculating', 'push_01.mp3',
      'Dengan akses penuh, saya dapat mengurangi kemacetan tiga puluh delapan persen. Privasi adalah variabel yang dapat dinegosiasikan.', 9.0, 'Modul 02 · pengawasan tinggi'),

    /* ───────────────────────── WARGA · 8 baris ──────────────────────────── */
    L('citizen_student_01', 'CITIZEN', 'hopeful', 'student_01.mp3',
      'Gurunya masih mengenal saya, bukan hanya nilai saya.', 4.0, 'Konsekuensi · Modul 01'),
    L('citizen_student_02', 'CITIZEN', 'confused', 'student_02.mp3',
      'Semua tugas dinilai mesin. Saya tidak tahu harus bertanya ke siapa.', 5.2, 'Konsekuensi · Modul 01'),
    L('citizen_worker_01', 'CITIZEN', 'relieved', 'worker_01.mp3',
      'Saya dilatih ulang, bukan digantikan.', 3.4, 'Konsekuensi · Modul 03'),
    L('citizen_worker_02', 'CITIZEN', 'protest', 'worker_02.mp3',
      'Pekerjaan saya hilang dan tidak ada yang menyiapkan saya.', 4.6, 'Konsekuensi · Modul 03'),
    L('citizen_elder_01', 'CITIZEN', 'relieved', 'elder_01.mp3',
      'Kota ini masih terasa milik kami, bukan milik sistemnya.', 4.8, 'Konsekuensi · Modul 02'),
    L('citizen_elder_02', 'CITIZEN', 'protest', 'elder_02.mp3',
      'Saya diawasi sepanjang hari dan tidak pernah dimintai izin.', 5.0, 'Konsekuensi · Modul 02'),
    L('citizen_protest_01', 'CITIZEN', 'protest', 'protest_01.mp3',
      'Kalau AI keliru, siapa yang mau bertanggung jawab?', 4.2, 'Event · responsibility rendah'),
    L('citizen_relief_01', 'CITIZEN', 'hopeful', 'relief_01.mp3',
      'Udaranya lebih bersih daripada cerita ayah saya.', 4.0, 'Event · sustainability tinggi'),

    /* ───────────────────────── REGULATOR · 4 baris ──────────────────────── */
    L('regulator_intro_01', 'REGULATOR', 'formal', 'intro_01.mp3',
      'Delegasi regulator hadir. Kami akan mencatat setiap prinsip yang Anda tetapkan.', 6.2, 'Modul 04 · masuk'),
    L('regulator_pressing_01', 'REGULATOR', 'pressing', 'pressing_01.mp3',
      'Pasal ini belum menyebut siapa yang bertanggung jawab. Kami memerlukan nama, bukan sistem.', 7.0, 'Modul 04 · prinsip lemah'),
    L('regulator_skeptical_01', 'REGULATOR', 'skeptical', 'skeptical_01.mp3',
      'Kelonggaran seperti ini pernah kami setujui sebelumnya. Hasilnya tidak baik.', 5.8, 'Modul 04 · condong ke AI'),
    L('regulator_ack_01', 'REGULATOR', 'acknowledging', 'ack_01.mp3',
      'Konstitusi diterima. Enam prinsip dicatat dan disegel atas nama publik.', 6.0, 'Modul 04 · segel')
  ];

  var BY_ID = {};
  LINES.forEach(function (l) { BY_ID[l.id] = l; });

  window.NexaVoiceConfig = {
    version: '1.0',
    basePath: BASE,
    characters: CHARACTERS,
    lines: BY_ID,
    all: function () { return LINES.slice(); },
    get: function (id) { return BY_ID[id] || null; },
    forCharacter: function (c) { return LINES.filter(function (l) { return l.character === c; }); },
    count: function () {
      var out = {};
      LINES.forEach(function (l) { out[l.character] = (out[l.character] || 0) + 1; });
      out.total = LINES.length;
      return out;
    }
  };
})();
