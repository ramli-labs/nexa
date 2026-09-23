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

  /* arahan suara per karakter — dipakai docs/audio.md. `source` = asal rekaman.
     Setelan edge-tts yang tepat ada di tools/buat-suara.py (PRESETS). */
  var CHARACTERS = {
    NEXA: {
      label: 'NARA-01 (NEXA Core)',
      folder: 'nexa',
      source: 'edge-tts id-ID-ArdiNeural, tempo +10%',
      gender: 'laki-laki, AI netral',
      persona: 'tenang, cerdas, presisi — bukan robot kaku',
      processing: 'highpass 90 Hz, high-shelf +2 dB, plate tipis',
      pace: 'sedang, jeda jelas antar klausa'
    },
    MENTOR: {
      label: 'KAIA (Mentor)',
      folder: 'mentor',
      source: 'ElevenLabs (rekaman asli, jangan dibuat ulang)',
      gender: 'perempuan Indonesia, 40-an',
      persona: 'hangat, profesional, membimbing — seperti guru yang dipercaya',
      processing: 'natural, tanpa efek. Kompresi lembut 3:1',
      pace: 'lebih lambat dari NEXA, ada napas'
    },
    ORION: {
      label: 'ORION (City AI)',
      folder: 'orion',
      source: 'ElevenLabs (rekaman asli, jangan dibuat ulang)',
      gender: 'maskulin sintetis, rendah',
      persona: 'efisien, persuasif, sedikit dingin — optimizer yang sopan',
      processing: 'pitch -2 semitone, chorus tipis, gerbang noise ketat',
      pace: 'cepat dan datar'
    },
    CITIZEN: {
      label: 'Warga 2045',
      folder: 'citizen',
      source: 'edge-tts: pelajar id-ID-GadisNeural, pekerja su-ID-JajangNeural, warga senior su-ID-TutiNeural',
      gender: 'pelajar perempuan muda, pekerja laki-laki dewasa, warga senior perempuan',
      persona: 'suara manusia natural, tidak teatrikal',
      processing: 'tanpa efek (highpass saja)',
      pace: 'pelajar cepat, pekerja normal, warga senior lambat'
    },
    REGULATOR: {
      label: 'Delegasi Regulator',
      folder: 'regulator',
      source: 'edge-tts su-ID-JajangNeural, tempo -8%, nada -12 Hz',
      gender: 'dewasa, netral-formal',
      persona: 'formal, tegas, institusional — mewakili lembaga, bukan diri sendiri',
      processing: 'ruang aula (gema pendek)',
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
    /* ───────────────────────── NEXA / NARA-01 · 31 baris ───────────────── */
    L('nexa_intro_01', 'NEXA', 'calm', 'intro_01.mp3',
      'Selamat datang di NEXA Simulation Lab.', 2.0, 'Tujuan Pembelajaran'),
    L('nexa_intro_02', 'NEXA', 'calm', 'intro_02.mp3',
      'Di sini, kamu tidak hanya mempelajari masa depan. Kamu akan merancangnya.', 4.7, 'Tujuan Pembelajaran'),
    L('nexa_hub_01', 'NEXA', 'informative', 'hub_01.mp3',
      'Empat simulasi telah disiapkan. Simulasi keempat terbuka setelah tiga lainnya selesai.', 5.0, 'Orbital Lab · kunjungan pertama'),
    L('nexa_hub_02', 'NEXA', 'analytical', 'hub_02.mp3',
      'Setiap simulasi menunjukkan tantangan masa depan yang berbeda. Pilih satu untuk memulai.', 5.0, 'Orbital Lab · kunjungan pertama'),
    L('nexa_hub_progress_01', 'NEXA', 'analytical', 'hub_progress_01.mp3',
      'Future Balance diperbarui. Masih ada simulasi yang menunggu sebelum Ruang Konstitusi terbuka.', 5.3, 'Orbital Lab · 1–2 modul selesai'),
    L('nexa_hub_complete_01', 'NEXA', 'affirming', 'hub_complete_01.mp3',
      'Semua sistem telah dirancang. Buka profilmu untuk melihat dunia yang terbentuk.', 4.5, 'Orbital Lab · semua modul selesai'),
    L('nexa_module_school_01', 'NEXA', 'informative', 'module_school_01.mp3',
      'Modul satu. Smart School dua ribu empat puluh lima. Enam parameter menunggu keputusanmu.', 6.1, 'Modul 01 · masuk'),
    L('nexa_module_city_01', 'NEXA', 'informative', 'module_city_01.mp3',
      'Modul dua. Kota ini dikelola oleh ORION. Dengarkan usulannya, tetapi keputusan tetap milikmu.', 6.9, 'Modul 02 · masuk'),
    L('nexa_module_work_01', 'NEXA', 'calm', 'module_work_01.mp3',
      'Pekerjaan berubah. Kemampuan manusia juga harus berkembang.', 3.9, 'Modul 03 · masuk'),
    L('nexa_module_work_02', 'NEXA', 'analytical', 'module_work_02.mp3',
      'Energi pengembangan terbatas: dua belas unit. Mana yang paling penting untuk dua ribu empat puluh lima?', 5.5, 'Modul 03 · alokasi'),
    L('nexa_module_future_01', 'NEXA', 'calm', 'module_future_01.mp3',
      'Tidak ada masa depan yang tercipta tanpa pilihan. Setiap prinsip akan membentuk segel.', 4.9, 'Modul 04 · Konstitusi'),
    L('nexa_decision_01', 'NEXA', 'analytical', 'decision_01.mp3',
      'Pilihanmu menciptakan konsekuensi. Tidak ada yang salah — hanya trade-off yang berbeda.', 5.3, 'Layar Konsekuensi'),
    L('nexa_ending_01', 'NEXA', 'affirming', 'ending_01.mp3',
      'Saya dapat menghitung kemungkinan masa depan. Kamu yang memutuskan masa depan mana yang layak dibangun.', 5.5, 'Future Profile'),
    L('nexa_ending_02', 'NEXA', 'calm', 'ending_02.mp3',
      'Simulasi selesai. Dunia ini hanya satu dari banyak kemungkinan — dan kamu yang memilihnya.', 5.4, 'Hasil Akhir'),
    // peristiwa (pop-up) & tutorial
    L('nexa_event_s1', 'NEXA', 'warning', 'event_s1.mp3',
      'Server AI sekolah padam dua hari. Model memproyeksikan sebagian besar siswa kesulitan menyelesaikan tugas tanpa bantuan AI. Guru mengusulkan kembali ke kelas diskusi.', 10.2, 'Peristiwa · Modul 01'),
    L('nexa_event_s2', 'NEXA', 'warning', 'event_s2.mp3',
      'Survei kesejahteraan siswa. Dalam simulasi ini siswa melaporkan merasa kesepian di sekolah yang serba otomatis: capaian akademik naik, kebahagiaan turun.', 9.2, 'Peristiwa · Modul 01'),
    L('nexa_event_s3', 'NEXA', 'warning', 'event_s3.mp3',
      'Karya siswa menang festival nasional. Proyek gabungan siswa–AI dinilai orisinal: AI membantu, siswa yang mengarahkan.', 7.9, 'Peristiwa · Modul 01'),
    L('nexa_event_s4', 'NEXA', 'warning', 'event_s4.mp3',
      'Kurikulum selesai lebih cepat. Efisiensi tertinggi sejauh ini — tetapi model memperkirakan klub dan kegiatan sosial makin sepi peminat.', 7.6, 'Peristiwa · Modul 01'),
    L('nexa_event_c1', 'NEXA', 'warning', 'event_c1.mp3',
      'Protes warga #DataKami. Warga menuntut tahu data apa yang dipakai ORION. Model memproyeksikan kepercayaan publik turun tajam.', 8.4, 'Peristiwa · Modul 02'),
    L('nexa_event_c2', 'NEXA', 'warning', 'event_c2.mp3',
      'Emisi kota turun tajam. Jaringan energi cerdas membuat kota jadi contoh nasional dalam proyeksi ini. Beban biaya energi warga ikut turun.', 8.8, 'Peristiwa · Modul 02'),
    L('nexa_event_c3', 'NEXA', 'warning', 'event_c3.mp3',
      'Banjir bandang: respons lambat. Sistem darurat kekurangan data dan otomasi. Model memproyeksikan evakuasi tertunda cukup lama.', 8.9, 'Peristiwa · Modul 02'),
    L('nexa_event_c4', 'NEXA', 'warning', 'event_c4.mp3',
      'Waktu tempuh turun drastis. ORION mengoptimalkan lalu lintas kota. Pertanyaan baru: siapa yang mengaudit keputusannya?', 8.0, 'Peristiwa · Modul 02'),
    L('nexa_event_c5', 'NEXA', 'warning', 'event_c5.mp3',
      'Portal transparansi ORION dibuka. Warga bisa melihat alasan setiap kebijakan otomatis. Dalam simulasi ini partisipasi publik meningkat.', 8.8, 'Peristiwa · Modul 02'),
    L('nexa_event_w1', 'NEXA', 'warning', 'event_w1.mp3',
      'Sulit mencari pemimpin tim. Model memproyeksikan keahlian teknis melimpah, tetapi kolaborasi dan empati langka — proyek besar tersendat.', 8.1, 'Peristiwa · Modul 03'),
    L('nexa_event_w2', 'NEXA', 'warning', 'event_w2.mp3',
      'Gelombang otomatisasi baru — pekerja beradaptasi. Karena budaya belajar seumur hidup, proyeksi menunjukkan mayoritas pekerja berpindah peran dalam waktu singkat.', 9.1, 'Peristiwa · Modul 03'),
    L('nexa_event_w3', 'NEXA', 'warning', 'event_w3.mp3',
      'Jurang keterampilan melebar. Yang punya akses pelatihan teknologi melesat; yang tidak, tertinggal. Proyeksi ketimpangan meningkat.', 8.4, 'Peristiwa · Modul 03'),
    L('nexa_event_w4', 'NEXA', 'warning', 'event_w4.mp3',
      'Lonjakan inovasi produk. Inovasi melaju cepat. Tetapi banyak keputusan produk diserahkan penuh ke AI tanpa tinjauan kritis manusia.', 8.6, 'Peristiwa · Modul 03'),
    L('nexa_tutorial_1', 'NEXA', 'informative', 'tutorial_1.mp3',
      'Geser parameter, dunia berubah. Setiap modul punya panel parameter. Saat kamu menggeser, simulasi berubah saat itu juga — dan chip di bawah memperlihatkan akibatnya pada Future Balance sebelum kamu mengunci.', 12.0, 'Tutorial · langkah 1'),
    L('nexa_tutorial_2', 'NEXA', 'informative', 'tutorial_2.mp3',
      'Sumber daya selalu terbatas. Di Future Work kamu membagi 12 unit energi ke 7 keterampilan. Tidak cukup untuk semua — memilih berarti melepaskan sesuatu.', 9.7, 'Tutorial · langkah 2'),
    L('nexa_tutorial_3', 'NEXA', 'informative', 'tutorial_3.mp3',
      'Keputusan punya sudut pandang. Di Ruang Konstitusi kamu memilih posisi pada enam prinsip. Tidak ada pilihan yang salah — setiap posisi membentuk dunia yang berbeda.', 9.5, 'Tutorial · langkah 3'),
    L('nexa_tutorial_4', 'NEXA', 'informative', 'tutorial_4.mp3',
      'Future Balance adalah rapormu. Empat dimensi ini bergerak setiap kali kamu mengunci sebuah desain. Tujuannya bukan angka tertinggi, tetapi keseimbangan yang bisa kamu pertanggungjawabkan.', 10.3, 'Tutorial · langkah 4'),

    /* ───────────────────────── MENTOR / KAIA · 8 baris ─────────────────── */
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
    L('mentor_debrief', 'MENTOR', 'warm', 'debrief.mp3',
      'Bandingkan hasilmu dengan temanmu. Dunia yang sama-sama berhasil bisa terlihat sangat berbeda.', 7.0, 'Hasil Akhir · debrief'),

    /* ───────────────────────── ORION · 2 baris ──────────────────────────── */
    L('orion_offer_01', 'ORION', 'persuasive', 'offer_01.mp3',
      'Sistem kota dapat menjadi lebih efisien.', 3.2, 'Modul 02 · masuk'),
    L('orion_offer_02', 'ORION', 'calculating', 'offer_02.mp3',
      'Pertanyaannya: berapa banyak data yang akan Anda gunakan?', 4.4, 'Modul 02 · permintaan data'),

    /* ───────────────────────── WARGA · 30 baris (kartu Konsekuensi & Profil) ── */
    L('citizen_school_student_hi', 'CITIZEN', 'hopeful', 'school_student_hi.mp3',
      'Gurunya masih mengenal saya, bukan hanya nilai saya.', 3.8, 'Konsekuensi · Modul 01 · Pelajar'),
    L('citizen_school_student_lo', 'CITIZEN', 'confused', 'school_student_lo.mp3',
      'Semua tugas dinilai mesin. Saya tidak tahu harus bertanya ke siapa.', 5.9, 'Konsekuensi · Modul 01 · Pelajar'),
    L('citizen_school_worker_hi', 'CITIZEN', 'relieved', 'school_worker_hi.mp3',
      'Anak saya belajar hal yang tidak saya dapatkan dulu.', 3.6, 'Konsekuensi · Modul 01 · Pekerja'),
    L('citizen_school_worker_lo', 'CITIZEN', 'confused', 'school_worker_lo.mp3',
      'Sekolahnya aman, tapi rasanya jalan di tempat.', 3.3, 'Konsekuensi · Modul 01 · Pekerja'),
    L('citizen_school_elder_hi', 'CITIZEN', 'relieved', 'school_elder_hi.mp3',
      'Saya bisa melihat alasan di balik tiap penilaian.', 4.2, 'Konsekuensi · Modul 01 · Warga senior'),
    L('citizen_school_elder_lo', 'CITIZEN', 'protest', 'school_elder_lo.mp3',
      'Kami tidak pernah diberi tahu data anak kami dipakai untuk apa.', 4.7, 'Konsekuensi · Modul 01 · Warga senior'),
    L('citizen_city_elder_hi', 'CITIZEN', 'relieved', 'city_elder_hi.mp3',
      'Kota ini masih terasa milik kami, bukan milik sistemnya.', 4.8, 'Konsekuensi · Modul 02 · Warga senior'),
    L('citizen_city_elder_lo', 'CITIZEN', 'protest', 'city_elder_lo.mp3',
      'Saya diawasi sepanjang hari dan tidak pernah dimintai izin.', 4.4, 'Konsekuensi · Modul 02 · Warga senior'),
    L('citizen_city_worker_hi', 'CITIZEN', 'hopeful', 'city_worker_hi.mp3',
      'Perjalanan ke kerja lebih pendek empat puluh menit.', 3.2, 'Konsekuensi · Modul 02 · Pekerja'),
    L('citizen_city_worker_lo', 'CITIZEN', 'confused', 'city_worker_lo.mp3',
      'Macetnya sama saja, hanya sensornya yang bertambah.', 3.7, 'Konsekuensi · Modul 02 · Pekerja'),
    L('citizen_city_student_hi', 'CITIZEN', 'hopeful', 'city_student_hi.mp3',
      'Udaranya lebih bersih daripada cerita ayah saya.', 3.1, 'Konsekuensi · Modul 02 · Pelajar'),
    L('citizen_city_student_lo', 'CITIZEN', 'protest', 'city_student_lo.mp3',
      'Hemat sekarang, tapi siapa yang membayar sepuluh tahun lagi?', 3.6, 'Konsekuensi · Modul 02 · Pelajar'),
    L('citizen_work_worker_hi', 'CITIZEN', 'relieved', 'work_worker_hi.mp3',
      'Saya dilatih ulang, bukan digantikan.', 2.8, 'Konsekuensi · Modul 03 · Pekerja'),
    L('citizen_work_worker_lo', 'CITIZEN', 'protest', 'work_worker_lo.mp3',
      'Pekerjaan saya hilang dan tidak ada yang menyiapkan saya.', 3.4, 'Konsekuensi · Modul 03 · Pekerja'),
    L('citizen_work_student_hi', 'CITIZEN', 'hopeful', 'work_student_hi.mp3',
      'Keterampilan yang saya pelajari masih dibutuhkan tahun ini.', 3.6, 'Konsekuensi · Modul 03 · Pelajar'),
    L('citizen_work_student_lo', 'CITIZEN', 'confused', 'work_student_lo.mp3',
      'Saya tidak tahu harus belajar apa untuk bertahan.', 3.5, 'Konsekuensi · Modul 03 · Pelajar'),
    L('citizen_work_elder_hi', 'CITIZEN', 'relieved', 'work_elder_hi.mp3',
      'Keputusan siapa yang dirumahkan masih ditandatangani manusia.', 5.0, 'Konsekuensi · Modul 03 · Warga senior'),
    L('citizen_work_elder_lo', 'CITIZEN', 'confused', 'work_elder_lo.mp3',
      'Algoritma memutuskan, dan tidak ada yang bisa saya ajak bicara.', 5.7, 'Konsekuensi · Modul 03 · Warga senior'),
    L('citizen_civ_student_hi', 'CITIZEN', 'hopeful', 'civ_student_hi.mp3',
      'Ada aturan yang bisa saya pakai kalau sistemnya salah.', 3.3, 'Konsekuensi · Modul 04 · Pelajar'),
    L('citizen_civ_student_lo', 'CITIZEN', 'protest', 'civ_student_lo.mp3',
      'Kalau AI keliru, tidak ada yang mau bertanggung jawab.', 3.4, 'Konsekuensi · Modul 04 · Pelajar'),
    L('citizen_civ_elder_hi', 'CITIZEN', 'relieved', 'civ_elder_hi.mp3',
      'Hal-hal penting masih diputuskan oleh orang.', 3.5, 'Konsekuensi · Modul 04 · Warga senior'),
    L('citizen_civ_elder_lo', 'CITIZEN', 'confused', 'civ_elder_lo.mp3',
      'Hidup saya diatur aturan yang tidak saya mengerti.', 4.2, 'Konsekuensi · Modul 04 · Warga senior'),
    L('citizen_civ_worker_hi', 'CITIZEN', 'hopeful', 'civ_worker_hi.mp3',
      'Aturannya jelas, jadi kami berani mencoba hal baru.', 3.5, 'Konsekuensi · Modul 04 · Pekerja'),
    L('citizen_civ_worker_lo', 'CITIZEN', 'confused', 'civ_worker_lo.mp3',
      'Semua harus izin dulu. Tidak ada yang bergerak.', 4.0, 'Konsekuensi · Modul 04 · Pekerja'),
    L('citizen_ending_student_hi', 'CITIZEN', 'hopeful', 'ending_student_hi.mp3',
      'Di duniamu saya masih belajar jadi manusia, bukan hanya pengguna sistem.', 5.0, 'Future Profile · Pelajar'),
    L('citizen_ending_student_lo', 'CITIZEN', 'confused', 'ending_student_lo.mp3',
      'Semua serba cepat di sini, tapi tidak ada yang menanyakan pendapat saya.', 4.7, 'Future Profile · Pelajar'),
    L('citizen_ending_worker_hi', 'CITIZEN', 'relieved', 'ending_worker_hi.mp3',
      'Teknologinya maju dan saya ikut naik bersamanya.', 3.4, 'Future Profile · Pekerja'),
    L('citizen_ending_worker_lo', 'CITIZEN', 'protest', 'ending_worker_lo.mp3',
      'Kami diminta bertahan tanpa alat dan pelatihan baru.', 3.3, 'Future Profile · Pekerja'),
    L('citizen_ending_elder_hi', 'CITIZEN', 'relieved', 'ending_elder_hi.mp3',
      'Kalau sistemnya salah, saya tahu harus mengadu ke siapa.', 4.5, 'Future Profile · Warga senior'),
    L('citizen_ending_elder_lo', 'CITIZEN', 'protest', 'ending_elder_lo.mp3',
      'Tidak ada yang mau bertanggung jawab atas keputusan mesin.', 4.0, 'Future Profile · Warga senior'),

    /* ───────────────────────── REGULATOR · 7 baris (Modul 04) ─────────────── */
    L('regulator_wait', 'REGULATOR', 'formal', 'wait.mp3',
      'Delegasi menunggu. Setiap prinsip yang kamu putuskan akan mereka catat.', 6.0, 'Modul 04 · 0 prinsip'),
    L('regulator_count_1', 'REGULATOR', 'skeptical', 'count_1.mp3',
      'Delegasi mencatat satu prinsip. Mereka masih menunggu lima keputusan lagi.', 6.5, 'Modul 04 · 1 prinsip'),
    L('regulator_count_2', 'REGULATOR', 'skeptical', 'count_2.mp3',
      'Delegasi mencatat dua prinsip. Mereka masih menunggu empat keputusan lagi.', 6.5, 'Modul 04 · 2 prinsip'),
    L('regulator_count_3', 'REGULATOR', 'skeptical', 'count_3.mp3',
      'Delegasi mencatat tiga prinsip. Mereka masih menunggu tiga keputusan lagi.', 6.5, 'Modul 04 · 3 prinsip'),
    L('regulator_count_4', 'REGULATOR', 'pressing', 'count_4.mp3',
      'Delegasi mencatat empat prinsip. Mereka masih menunggu dua keputusan lagi.', 6.1, 'Modul 04 · 4 prinsip'),
    L('regulator_count_5', 'REGULATOR', 'pressing', 'count_5.mp3',
      'Delegasi mencatat lima prinsip. Mereka masih menunggu satu keputusan lagi.', 6.0, 'Modul 04 · 5 prinsip'),
    L('regulator_ready', 'REGULATOR', 'acknowledging', 'ready.mp3',
      'Delegasi menerima naskah. Konstitusi siap disegel.', 5.2, 'Modul 04 · 6 prinsip')
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
