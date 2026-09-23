# Audio NEXA — suara, naskah, dan cara membuat ulang

Status per 23 September 2026. **Semua 78 baris suara sudah punya audio** dan semuanya terpakai di gim. Cek ulang kapan saja:

```bash
python3 tools/cek-audio.py
```

Musik latar (`js/bgm.js`) dan SFX tidak berupa berkas. Keduanya dibangkitkan di browser (Web Audio). Lihat [Musik latar](#musik-latar).

---

## Suara per tokoh

| Tokoh | Baris | Sumber | Setelan |
|---|---|---|---|
| NARA-01 | 31 | edge-tts `id-ID-ArdiNeural` | tempo +10%; highpass 90 Hz, high-shelf +2 dB, plate tipis ("rasa AI") |
| KAIA | 8 | **ElevenLabs, rekaman asli** | tidak diubah |
| ORION | 2 | **ElevenLabs, rekaman asli** | tidak diubah |
| Warga: Pelajar | 10 | edge-tts `id-ID-GadisNeural` | tempo +10%, nada +20 Hz (lebih muda) |
| Warga: Pekerja | 10 | edge-tts `su-ID-JajangNeural` | normal |
| Warga: Warga senior | 10 | edge-tts `su-ID-TutiNeural` | tempo −12%, nada −15 Hz (lebih tua) |
| Delegasi Regulator | 7 | edge-tts `su-ID-JajangNeural` | tempo −8%, nada −12 Hz, gema aula (formal) |

Emosi tiap baris (protes, bingung, lega, dan seterusnya) diberi geseran kecil tempo/nada di atas setelan tokoh. Detailnya ada di `EMOTION` pada `tools/buat-suara.py`.

## Kapan suara diputar

| Bagian | Cara diputar |
|---|---|
| Kotak dialog (NARA-01, KAIA, ORION) | otomatis per baris; tombol ↻ untuk mengulang |
| Tutorial (4 langkah) | otomatis setiap pindah langkah, maju maupun mundur |
| Pop-up peristiwa (13) | otomatis saat pop-up muncul. Pop-up tetap terbuka sampai narasi selesai (minimal 7 detik); tombol × ikut menghentikan narasinya |
| Kartu warga di Konsekuensi (24) dan Ringkasan Akhir (6) | tombol **▶** di tiap kartu. Sengaja tidak otomatis supaya tidak bertabrakan dengan dialog di layar yang sama |
| Delegasi Regulator (Modul 04) | otomatis setiap kali jumlah prinsip bertambah (mengganti pilihan tidak memicu suara); tombol **▶** untuk mengulang kalimat saat ini |

Kalau suara sampingan (kartu, regulator, peristiwa, tutorial) memotong baris dialog, teks dialog itu tetap ditampilkan utuh. Pindah layar menghentikan suara sampingan.

Layar **Opening** sengaja tanpa narasi. Browser memblokir suara sebelum pemain mengklik, dan klik pertama (MULAI) langsung pindah layar.

---

## Musik latar

`js/bgm.js` (`window.NexaBGM`) menggantikan BGM lama pada 23 September 2026. BGM lama bermasalah karena:

- **Terlalu keras:** −12,6 LUFS pada volume bawaan, sekitar 10 dB lebih keras daripada suara tokoh (−22 LUFS), sehingga dialog tenggelam.
- **Satu akor ditahan terus** selama pemain berada di layar itu, jadi terdengar seperti dengung.
- **Arpeggio 4 nada diulang tanpa henti**, di Future Work memakai gelombang square setiap 0,4 detik.
- **Gelombang kasar:** sawtooth di AI City, square di Future Work.

Mesin baru:

- **Pad lembut** (sine + triangle) dengan **progresi 4 akor** yang berganti setiap 8–12 detik, crossfade panjang, lowpass, dan reverb.
- **Suasana per layar:**

| Suasana | Layar | Akor |
|---|---|---|
| intro | Opening, Tujuan, Tutorial | Cmaj7 – Am7 – Fmaj7 – G6 |
| lab | Orbital Lab, Konsekuensi | Dmaj7 – Bm7 – Gmaj7 – A |
| school | Modul 01 | Fmaj7 – G6 – Am7 – Em7 |
| city | Modul 02 | Am7 – Fmaj7 – Dm7 – Em |
| work | Modul 03 | Em9 – Cmaj7 – G – D |
| civ | Modul 04 | Dm – B♭maj7 – F – C |
| ending | Profil, Ringkasan, Refleksi | C – G – Am – F |

- **Gaya** (`DEFAULT_STYLE` di `js/bgm.js`):
  - `lembut`: pad saja.
  - `lonceng` (bawaan): pad + lonceng dari nada akor dengan jarak acak, rata-rata sekali per ±6 detik.
  - `mengalir`: pad + petikan akor pelan yang selalu berubah.
- **Level:** ±−35 LUFS pada volume musik bawaan (40%), sekitar 13 dB di bawah suara tokoh. Slider Musik di pengaturan tetap berfungsi.
- **Pergantian layar:** crossfade 3–4 detik. Osilator dijadwalkan pada jam audio dan dilepas begitu selesai, jadi sesi panjang tidak menumpuk node.

---

## Pemilihan suara

Rekaman lama dibuat dengan ElevenLabs (terbaca dari manifest C2PA di berkasnya). Suara buatan sendiri dipilih lewat dua ukuran objektif:

1. **Kemiripan suara:** speaker embedding (resemblyzer), dibandingkan dengan rekaman asli.
2. **Kejelasan ucapan:** Whisper mentranskripsi berkas, lalu hasilnya dibandingkan dengan naskah (CER = persentase huruf yang salah).

**Suara lama tidak bisa ditiru.** Dari 20 suara edge-tts yang bisa berbahasa Indonesia, yang paling mirip NARA-01 hanya mencapai 0,79. Padahal rekaman NARA-01 asli saling mirip di 0,92–0,97, dan 0,79 sama dengan jarak antara NARA-01 dan Regulator lama, dua tokoh yang memang orang berbeda. Menggeser nada malah menurunkan kemiripan. Karena itu:

- **NARA-01 dibuat ulang seluruhnya** (14 baris lama + 17 baris baru), supaya satu tokoh tidak terdengar seperti dua orang.
- **KAIA dan ORION tetap memakai rekaman ElevenLabs**, karena tidak butuh baris baru.

**Suara yang ditolak:**

| Suara | Alasan |
|---|---|
| `jv-ID` (Dimas, Siti) | vokal bergeser logat Jawa: "saya" → "soyo", "mereka" → "mereko" |
| `ms-MY` (Osman, Yasmin) | logat Malaysia: "macetnya" → "meseknya" |
| suara *multilingual* (Andrew, Remy, dan lain-lain) | berlogat asing: "konstitusi" → "konstituci", "disegel" → "di segle" |

**Hasil QA (68 berkas buatan):**

| Ukuran | Hasil |
|---|---|
| CER rata-rata | 1,2% (median 0%). Rekaman ElevenLabs asli: 0,9% |
| Kemiripan antar tokoh (termasuk KAIA & ORION) | 0,51–0,82; pasangan termirip NARA-01 vs Pekerja (0,82). Tokoh ElevenLabs asli saling berbeda di 0,52–0,91, jadi pemeran baru sama mudahnya dibedakan |
| Kekerasan | −22,6 s/d −22,3 LUFS. KAIA/ORION asli: −22,9 s/d −20,5 |

**Catatan kecil yang dibiarkan:** logat Sunda Jajang/Tuti sedikit terdengar ("segel" mendekati "segal"), dan beberapa kata menyambung secara alami ("harus izin", "dimintai izin").

### Kamus ucapan

Teks subtitle tidak diubah. Untuk TTS, beberapa kata dieja ulang (`UCAPAN` di `tools/buat-suara.py`):

| Teks | Dibacakan sebagai | Alasan |
|---|---|---|
| AI | é-ai | apa adanya terdengar "ai" menyatu seperti "pantai" |
| Simulation Lab | Simulésyen Lab | apa adanya terdengar "Simulator Online" |
| #DataKami | tagar Data Kami | |
| trade-off | tred-of | |

---

## Spesifikasi berkas

- mp3 96 kbps mono 44,1 kHz, tanpa metadata.
- Hening di awal dipangkas ke ±0,12 s, di akhir ke ±0,08 s.
- Kekerasan −22 LUFS (dua tahap: ukur, lalu sesuaikan), dengan limiter. Level ini sengaja disamakan dengan rekaman ElevenLabs yang tetap dipakai.
- Lokasi: `assets/audio/voice/<folder tokoh>/<berkas>`, sesuai kolom berkas di `js/voice-config.js`.
- Kalau berkas hilang atau gagal dimuat, gim tetap berjalan: subtitle tampil per kata memakai `duration`.

## Membuat ulang atau menambah suara

Butuh `ffmpeg` dan `pip install edge-tts`. Generator mengirim teks naskah ke layanan TTS Microsoft Edge, jadi perlu internet.

```bash
python3 tools/buat-suara.py                     # buat berkas yang belum ada
python3 tools/buat-suara.py --id nexa_event_s1  # buat ulang baris tertentu
python3 tools/buat-suara.py --semua             # buat ulang semua NARA-01, warga, regulator
python3 tools/cek-audio.py                      # harus OK
```

Generator membaca naskah langsung dari `js/voice-config.js`, lalu menulis durasi berkas yang sebenarnya kembali ke sana. KAIA dan ORION tidak punya preset, jadi tidak akan pernah tertimpa.

Menambah baris baru:

1. Tambahkan `L('id', 'TOKOH', 'emosi', 'berkas.mp3', 'teks', 0, 'kapan')` di `js/voice-config.js`.
2. Jalankan `python3 tools/buat-suara.py`.
3. Panggil dari `index.html`: `nara('id')`, `kaia('id')`, atau `orion('id')` untuk kotak dialog, atau `this.sayAside('id')` untuk suara sampingan.
4. Jalankan `python3 tools/cek-audio.py`.

Rekaman ElevenLabs lama (14 baris NARA-01 dan 21 baris yang dulu tidak terpakai) masih ada di riwayat git, commit `12d0f51`, misalnya:

```bash
git show 12d0f51:assets/audio/voice/nexa/hub_01.mp3 > hub_01_elevenlabs.mp3
```

---

## Naskah lengkap (78 baris)

Dibuat dari `js/voice-config.js`. Durasi = durasi berkas sebenarnya.

### NARA-01 (31)

| ID | Berkas | Kapan | Durasi | Teks |
|---|---|---|---|---|
| `nexa_intro_01` | `nexa/intro_01.mp3` | Tujuan Pembelajaran | 2,0 s | Selamat datang di NEXA Simulation Lab. |
| `nexa_intro_02` | `nexa/intro_02.mp3` | Tujuan Pembelajaran | 4,7 s | Di sini, kamu tidak hanya mempelajari masa depan. Kamu akan merancangnya. |
| `nexa_hub_01` | `nexa/hub_01.mp3` | Orbital Lab · kunjungan pertama | 5,0 s | Empat simulasi telah disiapkan. Simulasi keempat terbuka setelah tiga lainnya selesai. |
| `nexa_hub_02` | `nexa/hub_02.mp3` | Orbital Lab · kunjungan pertama | 5,0 s | Setiap simulasi menunjukkan tantangan masa depan yang berbeda. Pilih satu untuk memulai. |
| `nexa_hub_progress_01` | `nexa/hub_progress_01.mp3` | Orbital Lab · 1–2 modul selesai | 5,3 s | Future Balance diperbarui. Masih ada simulasi yang menunggu sebelum Ruang Konstitusi terbuka. |
| `nexa_hub_complete_01` | `nexa/hub_complete_01.mp3` | Orbital Lab · semua modul selesai | 4,5 s | Semua sistem telah dirancang. Buka profilmu untuk melihat dunia yang terbentuk. |
| `nexa_module_school_01` | `nexa/module_school_01.mp3` | Modul 01 · masuk | 6,1 s | Modul satu. Smart School dua ribu empat puluh lima. Enam parameter menunggu keputusanmu. |
| `nexa_module_city_01` | `nexa/module_city_01.mp3` | Modul 02 · masuk | 6,9 s | Modul dua. Kota ini dikelola oleh ORION. Dengarkan usulannya, tetapi keputusan tetap milikmu. |
| `nexa_module_work_01` | `nexa/module_work_01.mp3` | Modul 03 · masuk | 3,9 s | Pekerjaan berubah. Kemampuan manusia juga harus berkembang. |
| `nexa_module_work_02` | `nexa/module_work_02.mp3` | Modul 03 · alokasi | 5,5 s | Energi pengembangan terbatas: dua belas unit. Mana yang paling penting untuk dua ribu empat puluh lima? |
| `nexa_module_future_01` | `nexa/module_future_01.mp3` | Modul 04 · Konstitusi | 4,9 s | Tidak ada masa depan yang tercipta tanpa pilihan. Setiap prinsip akan membentuk segel. |
| `nexa_decision_01` | `nexa/decision_01.mp3` | Layar Konsekuensi | 5,3 s | Pilihanmu menciptakan konsekuensi. Tidak ada yang salah — hanya trade-off yang berbeda. |
| `nexa_ending_01` | `nexa/ending_01.mp3` | Future Profile | 5,5 s | Saya dapat menghitung kemungkinan masa depan. Kamu yang memutuskan masa depan mana yang layak dibangun. |
| `nexa_ending_02` | `nexa/ending_02.mp3` | Hasil Akhir | 5,4 s | Simulasi selesai. Dunia ini hanya satu dari banyak kemungkinan — dan kamu yang memilihnya. |
| `nexa_event_s1` | `nexa/event_s1.mp3` | Peristiwa · Modul 01 | 10,2 s | Server AI sekolah padam dua hari. Model memproyeksikan sebagian besar siswa kesulitan menyelesaikan tugas tanpa bantuan AI. Guru mengusulkan kembali ke kelas diskusi. |
| `nexa_event_s2` | `nexa/event_s2.mp3` | Peristiwa · Modul 01 | 9,2 s | Survei kesejahteraan siswa. Dalam simulasi ini siswa melaporkan merasa kesepian di sekolah yang serba otomatis: capaian akademik naik, kebahagiaan turun. |
| `nexa_event_s3` | `nexa/event_s3.mp3` | Peristiwa · Modul 01 | 7,9 s | Karya siswa menang festival nasional. Proyek gabungan siswa–AI dinilai orisinal: AI membantu, siswa yang mengarahkan. |
| `nexa_event_s4` | `nexa/event_s4.mp3` | Peristiwa · Modul 01 | 7,6 s | Kurikulum selesai lebih cepat. Efisiensi tertinggi sejauh ini — tetapi model memperkirakan klub dan kegiatan sosial makin sepi peminat. |
| `nexa_event_c1` | `nexa/event_c1.mp3` | Peristiwa · Modul 02 | 8,4 s | Protes warga #DataKami. Warga menuntut tahu data apa yang dipakai ORION. Model memproyeksikan kepercayaan publik turun tajam. |
| `nexa_event_c2` | `nexa/event_c2.mp3` | Peristiwa · Modul 02 | 8,8 s | Emisi kota turun tajam. Jaringan energi cerdas membuat kota jadi contoh nasional dalam proyeksi ini. Beban biaya energi warga ikut turun. |
| `nexa_event_c3` | `nexa/event_c3.mp3` | Peristiwa · Modul 02 | 8,9 s | Banjir bandang: respons lambat. Sistem darurat kekurangan data dan otomasi. Model memproyeksikan evakuasi tertunda cukup lama. |
| `nexa_event_c4` | `nexa/event_c4.mp3` | Peristiwa · Modul 02 | 8,0 s | Waktu tempuh turun drastis. ORION mengoptimalkan lalu lintas kota. Pertanyaan baru: siapa yang mengaudit keputusannya? |
| `nexa_event_c5` | `nexa/event_c5.mp3` | Peristiwa · Modul 02 | 8,8 s | Portal transparansi ORION dibuka. Warga bisa melihat alasan setiap kebijakan otomatis. Dalam simulasi ini partisipasi publik meningkat. |
| `nexa_event_w1` | `nexa/event_w1.mp3` | Peristiwa · Modul 03 | 8,1 s | Sulit mencari pemimpin tim. Model memproyeksikan keahlian teknis melimpah, tetapi kolaborasi dan empati langka — proyek besar tersendat. |
| `nexa_event_w2` | `nexa/event_w2.mp3` | Peristiwa · Modul 03 | 9,1 s | Gelombang otomatisasi baru — pekerja beradaptasi. Karena budaya belajar seumur hidup, proyeksi menunjukkan mayoritas pekerja berpindah peran dalam waktu singkat. |
| `nexa_event_w3` | `nexa/event_w3.mp3` | Peristiwa · Modul 03 | 8,4 s | Jurang keterampilan melebar. Yang punya akses pelatihan teknologi melesat; yang tidak, tertinggal. Proyeksi ketimpangan meningkat. |
| `nexa_event_w4` | `nexa/event_w4.mp3` | Peristiwa · Modul 03 | 8,6 s | Lonjakan inovasi produk. Inovasi melaju cepat. Tetapi banyak keputusan produk diserahkan penuh ke AI tanpa tinjauan kritis manusia. |
| `nexa_tutorial_1` | `nexa/tutorial_1.mp3` | Tutorial · langkah 1 | 12,0 s | Geser parameter, dunia berubah. Setiap modul punya panel parameter. Saat kamu menggeser, simulasi berubah saat itu juga — dan chip di bawah memperlihatkan akibatnya pada Future Balance sebelum kamu mengunci. |
| `nexa_tutorial_2` | `nexa/tutorial_2.mp3` | Tutorial · langkah 2 | 9,7 s | Sumber daya selalu terbatas. Di Future Work kamu membagi 12 unit energi ke 7 keterampilan. Tidak cukup untuk semua — memilih berarti melepaskan sesuatu. |
| `nexa_tutorial_3` | `nexa/tutorial_3.mp3` | Tutorial · langkah 3 | 9,5 s | Keputusan punya sudut pandang. Di Ruang Konstitusi kamu memilih posisi pada enam prinsip. Tidak ada pilihan yang salah — setiap posisi membentuk dunia yang berbeda. |
| `nexa_tutorial_4` | `nexa/tutorial_4.mp3` | Tutorial · langkah 4 | 10,3 s | Future Balance adalah rapormu. Empat dimensi ini bergerak setiap kali kamu mengunci sebuah desain. Tujuannya bukan angka tertinggi, tetapi keseimbangan yang bisa kamu pertanggungjawabkan. |

### KAIA (8), rekaman asli ElevenLabs

| ID | Berkas | Kapan | Durasi | Teks |
|---|---|---|---|---|
| `mentor_intro` | `mentor/intro.mp3` | Tujuan Pembelajaran | 6,4 s | Teknologi tidak cukup hanya canggih. Kita harus memastikan masa depan tetap manusiawi. |
| `mentor_explanation` | `mentor/explanation.mp3` | Modul 01 · masuk | 3,2 s | AI dapat membantu belajar lebih personal. |
| `mentor_explanation_02` | `mentor/explanation_02.mp3` | Modul 01 · parameter | 8,2 s | Tetapi sekolah bukan hanya tempat menerima informasi. Perhatikan garis interaksi saat kamu menggeser parameter. |
| `mentor_explanation_03` | `mentor/explanation_03.mp3` | Layar Konsekuensi | 7,8 s | Setiap kenaikan di satu sisi biasanya menurunkan sisi lain. Itu bukan kegagalan — itu cara sistem bekerja. |
| `mentor_reflection` | `mentor/reflection.mp3` | Modul 04 · Konstitusi | 6,0 s | Ini bukan hanya soal aturan. Ini soal nilai seperti apa yang ingin kita jaga. |
| `mentor_reflection_02` | `mentor/reflection_02.mp3` | Refleksi & Diskusi | 5,0 s | Bawa jawabanmu ke diskusi kelas. Masa depan dirancang bersama. |
| `mentor_unlock` | `mentor/unlock.mp3` | Orbital Lab · 3 modul selesai | 6,2 s | Ruang Konstitusi telah terbuka. Ini saatnya menuliskan nilai yang ingin kita jaga. |
| `mentor_debrief` | `mentor/debrief.mp3` | Hasil Akhir · debrief | 7,0 s | Bandingkan hasilmu dengan temanmu. Dunia yang sama-sama berhasil bisa terlihat sangat berbeda. |

### ORION (2), rekaman asli ElevenLabs

| ID | Berkas | Kapan | Durasi | Teks |
|---|---|---|---|---|
| `orion_offer_01` | `orion/offer_01.mp3` | Modul 02 · masuk | 3,2 s | Sistem kota dapat menjadi lebih efisien. |
| `orion_offer_02` | `orion/offer_02.mp3` | Modul 02 · permintaan data | 4,4 s | Pertanyaannya: berapa banyak data yang akan Anda gunakan? |

### Warga (30)

| ID | Berkas | Kapan | Durasi | Teks |
|---|---|---|---|---|
| `citizen_school_student_hi` | `citizen/school_student_hi.mp3` | Konsekuensi · Modul 01 · Pelajar | 3,8 s | Gurunya masih mengenal saya, bukan hanya nilai saya. |
| `citizen_school_student_lo` | `citizen/school_student_lo.mp3` | Konsekuensi · Modul 01 · Pelajar | 5,9 s | Semua tugas dinilai mesin. Saya tidak tahu harus bertanya ke siapa. |
| `citizen_school_worker_hi` | `citizen/school_worker_hi.mp3` | Konsekuensi · Modul 01 · Pekerja | 3,6 s | Anak saya belajar hal yang tidak saya dapatkan dulu. |
| `citizen_school_worker_lo` | `citizen/school_worker_lo.mp3` | Konsekuensi · Modul 01 · Pekerja | 3,3 s | Sekolahnya aman, tapi rasanya jalan di tempat. |
| `citizen_school_elder_hi` | `citizen/school_elder_hi.mp3` | Konsekuensi · Modul 01 · Warga senior | 4,2 s | Saya bisa melihat alasan di balik tiap penilaian. |
| `citizen_school_elder_lo` | `citizen/school_elder_lo.mp3` | Konsekuensi · Modul 01 · Warga senior | 4,7 s | Kami tidak pernah diberi tahu data anak kami dipakai untuk apa. |
| `citizen_city_elder_hi` | `citizen/city_elder_hi.mp3` | Konsekuensi · Modul 02 · Warga senior | 4,8 s | Kota ini masih terasa milik kami, bukan milik sistemnya. |
| `citizen_city_elder_lo` | `citizen/city_elder_lo.mp3` | Konsekuensi · Modul 02 · Warga senior | 4,4 s | Saya diawasi sepanjang hari dan tidak pernah dimintai izin. |
| `citizen_city_worker_hi` | `citizen/city_worker_hi.mp3` | Konsekuensi · Modul 02 · Pekerja | 3,2 s | Perjalanan ke kerja lebih pendek empat puluh menit. |
| `citizen_city_worker_lo` | `citizen/city_worker_lo.mp3` | Konsekuensi · Modul 02 · Pekerja | 3,7 s | Macetnya sama saja, hanya sensornya yang bertambah. |
| `citizen_city_student_hi` | `citizen/city_student_hi.mp3` | Konsekuensi · Modul 02 · Pelajar | 3,1 s | Udaranya lebih bersih daripada cerita ayah saya. |
| `citizen_city_student_lo` | `citizen/city_student_lo.mp3` | Konsekuensi · Modul 02 · Pelajar | 3,6 s | Hemat sekarang, tapi siapa yang membayar sepuluh tahun lagi? |
| `citizen_work_worker_hi` | `citizen/work_worker_hi.mp3` | Konsekuensi · Modul 03 · Pekerja | 2,8 s | Saya dilatih ulang, bukan digantikan. |
| `citizen_work_worker_lo` | `citizen/work_worker_lo.mp3` | Konsekuensi · Modul 03 · Pekerja | 3,4 s | Pekerjaan saya hilang dan tidak ada yang menyiapkan saya. |
| `citizen_work_student_hi` | `citizen/work_student_hi.mp3` | Konsekuensi · Modul 03 · Pelajar | 3,6 s | Keterampilan yang saya pelajari masih dibutuhkan tahun ini. |
| `citizen_work_student_lo` | `citizen/work_student_lo.mp3` | Konsekuensi · Modul 03 · Pelajar | 3,5 s | Saya tidak tahu harus belajar apa untuk bertahan. |
| `citizen_work_elder_hi` | `citizen/work_elder_hi.mp3` | Konsekuensi · Modul 03 · Warga senior | 5,0 s | Keputusan siapa yang dirumahkan masih ditandatangani manusia. |
| `citizen_work_elder_lo` | `citizen/work_elder_lo.mp3` | Konsekuensi · Modul 03 · Warga senior | 5,7 s | Algoritma memutuskan, dan tidak ada yang bisa saya ajak bicara. |
| `citizen_civ_student_hi` | `citizen/civ_student_hi.mp3` | Konsekuensi · Modul 04 · Pelajar | 3,3 s | Ada aturan yang bisa saya pakai kalau sistemnya salah. |
| `citizen_civ_student_lo` | `citizen/civ_student_lo.mp3` | Konsekuensi · Modul 04 · Pelajar | 3,4 s | Kalau AI keliru, tidak ada yang mau bertanggung jawab. |
| `citizen_civ_elder_hi` | `citizen/civ_elder_hi.mp3` | Konsekuensi · Modul 04 · Warga senior | 3,5 s | Hal-hal penting masih diputuskan oleh orang. |
| `citizen_civ_elder_lo` | `citizen/civ_elder_lo.mp3` | Konsekuensi · Modul 04 · Warga senior | 4,2 s | Hidup saya diatur aturan yang tidak saya mengerti. |
| `citizen_civ_worker_hi` | `citizen/civ_worker_hi.mp3` | Konsekuensi · Modul 04 · Pekerja | 3,5 s | Aturannya jelas, jadi kami berani mencoba hal baru. |
| `citizen_civ_worker_lo` | `citizen/civ_worker_lo.mp3` | Konsekuensi · Modul 04 · Pekerja | 4,0 s | Semua harus izin dulu. Tidak ada yang bergerak. |
| `citizen_ending_student_hi` | `citizen/ending_student_hi.mp3` | Future Profile · Pelajar | 5,0 s | Di duniamu saya masih belajar jadi manusia, bukan hanya pengguna sistem. |
| `citizen_ending_student_lo` | `citizen/ending_student_lo.mp3` | Future Profile · Pelajar | 4,7 s | Semua serba cepat di sini, tapi tidak ada yang menanyakan pendapat saya. |
| `citizen_ending_worker_hi` | `citizen/ending_worker_hi.mp3` | Future Profile · Pekerja | 3,4 s | Teknologinya maju dan saya ikut naik bersamanya. |
| `citizen_ending_worker_lo` | `citizen/ending_worker_lo.mp3` | Future Profile · Pekerja | 3,3 s | Kami diminta bertahan tanpa alat dan pelatihan baru. |
| `citizen_ending_elder_hi` | `citizen/ending_elder_hi.mp3` | Future Profile · Warga senior | 4,5 s | Kalau sistemnya salah, saya tahu harus mengadu ke siapa. |
| `citizen_ending_elder_lo` | `citizen/ending_elder_lo.mp3` | Future Profile · Warga senior | 4,0 s | Tidak ada yang mau bertanggung jawab atas keputusan mesin. |

### Delegasi Regulator (7)

| ID | Berkas | Kapan | Durasi | Teks |
|---|---|---|---|---|
| `regulator_wait` | `regulator/wait.mp3` | Modul 04 · 0 prinsip | 6,0 s | Delegasi menunggu. Setiap prinsip yang kamu putuskan akan mereka catat. |
| `regulator_count_1` | `regulator/count_1.mp3` | Modul 04 · 1 prinsip | 6,5 s | Delegasi mencatat satu prinsip. Mereka masih menunggu lima keputusan lagi. |
| `regulator_count_2` | `regulator/count_2.mp3` | Modul 04 · 2 prinsip | 6,5 s | Delegasi mencatat dua prinsip. Mereka masih menunggu empat keputusan lagi. |
| `regulator_count_3` | `regulator/count_3.mp3` | Modul 04 · 3 prinsip | 6,5 s | Delegasi mencatat tiga prinsip. Mereka masih menunggu tiga keputusan lagi. |
| `regulator_count_4` | `regulator/count_4.mp3` | Modul 04 · 4 prinsip | 6,1 s | Delegasi mencatat empat prinsip. Mereka masih menunggu dua keputusan lagi. |
| `regulator_count_5` | `regulator/count_5.mp3` | Modul 04 · 5 prinsip | 6,0 s | Delegasi mencatat lima prinsip. Mereka masih menunggu satu keputusan lagi. |
| `regulator_ready` | `regulator/ready.mp3` | Modul 04 · 6 prinsip | 5,2 s | Delegasi menerima naskah. Konstitusi siap disegel. |
