# VOICE_SCRIPT.md — Naskah Voice Over NEXA

Naskah rekaman resmi. Satu baris = satu file audio.
ID di dokumen ini **identik** dengan ID di `assets/js/voiceConfig.js` — jangan diubah sebelah pihak.

**Spesifikasi teknis rekaman**
- Format: `mp3` 80 kbps **mono** (atau `.webm` Opus 80 kbps)
- Loudness: -16 LUFS, true peak -1 dBFS
- Bersih: tanpa musik, tanpa klik mulut, head/tail silence ≤ 150 ms
- Bahasa: Indonesia baku-percakapan. Angka dibaca sebagai kata ("dua ribu empat puluh lima")
- Nama file & folder persis seperti kolom **File** di tabel tiap karakter

**Total: 45 baris** — NEXA 20 · MENTOR 10 · ORION 3 · WARGA 8 · REGULATOR 4

---

## 1. NEXA / NARA-01 — 20 baris

**Folder:** `assets/audio/voice/nexa/`
**Gender:** neutral AI (boleh aktor perempuan atau laki-laki dengan timbre netral)
**Karakter:** tenang, cerdas, presisi. **Bukan** robot kaku — tidak ada monoton mekanis.
**Pace:** sedang, jeda jelas antar klausa.
**Post-processing:** high-shelf +2 dB @ 6 kHz, plate reverb 8%, bitcrush sangat halus hanya pada ekor kata terakhir.
**Jangan:** menaikkan intonasi di akhir kalimat (NEXA tidak pernah memohon).

| ID | Scene | Emotion | Direction | Text |
|---|---|---|---|---|
| `nexa_boot_01` | Opening | calm | Pelan, seperti sistem yang baru terbangun. Jeda 300 ms setelah "aktif". | "Sistem NEXA aktif. Menyiapkan Orbital Lab." |
| `nexa_intro_01` | Tujuan Pembelajaran | calm | Menyambut, bukan promosi. Ramah tapi netral. | "Selamat datang di NEXA Simulation Lab." |
| `nexa_intro_02` | Tujuan Pembelajaran | calm | Tekankan "merancangnya". Jeda penuh di titik pertama. | "Di sini, kamu tidak hanya mempelajari masa depan. Kamu akan merancangnya." |
| `nexa_hub_01` | Orbital Lab · kunjungan pertama | informative | Menjelaskan aturan, datar tapi jelas. | "Empat simulasi telah disiapkan. Simulasi keempat terbuka setelah tiga lainnya selesai." |
| `nexa_hub_02` | Orbital Lab · kunjungan pertama | analytical | Kalimat kedua sedikit lebih ringan — mengajak memilih. | "Setiap simulasi menunjukkan tantangan masa depan yang berbeda. Pilih satu untuk memulai." |
| `nexa_hub_progress_01` | Orbital Lab · 1–2 modul selesai | analytical | Seperti melaporkan status. Tanpa pujian. | "Future Balance diperbarui. Masih ada simulasi yang menunggu sebelum Ruang Konstitusi terbuka." |
| `nexa_hub_complete_01` | Orbital Lab · semua modul selesai | affirming | Sedikit lebih hangat dari baris lain — ini penutup babak. | "Semua sistem telah dirancang. Buka profilmu untuk melihat dunia yang terbentuk." |
| `nexa_module_school_01` | Modul 01 · masuk | informative | "Modul satu" diucapkan tegas, lalu turun. | "Modul satu. Smart School dua ribu empat puluh lima. Enam parameter menunggu keputusanmu." |
| `nexa_module_city_01` | Modul 02 · masuk | informative | Ada peringatan halus di "keputusan tetap milikmu". | "Modul dua. Kota ini dikelola oleh ORION. Dengarkan usulannya, tetapi keputusan tetap milikmu." |
| `nexa_module_work_01` | Modul 03 · masuk | calm | Dua kalimat pendek, beri jeda di antaranya. | "Pekerjaan berubah. Kemampuan manusia juga harus berkembang." |
| `nexa_module_work_02` | Modul 03 · alokasi | analytical | "dua belas unit" dibaca jelas — ini angka mekanik. | "Energi pengembangan terbatas: dua belas unit. Mana yang paling penting untuk dua ribu empat puluh lima?" |
| `nexa_module_future_01` | Modul 04 · Konstitusi | calm | Paling berbobot dari semua baris NEXA. Lambat. | "Tidak ada masa depan yang tercipta tanpa pilihan. Setiap prinsip akan membentuk segel." |
| `nexa_warning_01` | Event · human rendah | warning | Naikkan urgensi, jangan panik. Tegas di "Peringatan". | "Peringatan. Indikator kemanusiaan turun di bawah ambang aman. Sistem efisien, tetapi warga mulai kehilangan tempat." |
| `nexa_warning_02` | Event · responsibility rendah | warning | Kalimat terakhir hampir berbisik — ini ancaman, bukan data. | "Peringatan. Tanggung jawab tidak terdefinisi. Jika sistem ini salah, tidak ada yang dapat menjawab." |
| `nexa_warning_03` | Event · otomasi ekstrem | warning | Dua klausa berlawanan — beri kontras dinamika. | "Otomasi melampaui kapasitas pengawasan manusia. Kecepatan naik, kendali menurun." |
| `nexa_decision_01` | Layar Konsekuensi | analytical | Netral penuh. Tidak menghakimi pilihan pemain. | "Pilihanmu menciptakan konsekuensi. Tidak ada yang salah — hanya trade-off yang berbeda." |
| `nexa_decision_02` | Kunci modul | affirming | Ada rasa "klik" — keputusan final. | "Desain terkunci. Menghitung dampaknya terhadap dua ribu empat puluh lima." |
| `nexa_decision_03` | Parameter diubah setelah lock | analytical | Cepat, prosedural. | "Menghitung ulang. Parameter berubah, proyeksi ikut bergeser." |
| `nexa_ending_01` | Future Profile | affirming | Puncak emosional NEXA. Tekankan "Kamu yang memutuskan". | "Saya dapat menghitung kemungkinan masa depan. Kamu yang memutuskan masa depan mana yang layak dibangun." |
| `nexa_ending_02` | Hasil Akhir | calm | Menutup, melepaskan. Turun di akhir. | "Simulasi selesai. Dunia ini hanya satu dari banyak kemungkinan — dan kamu yang memilihnya." |

---

## 2. MENTOR / KAIA — 10 baris

**Folder:** `assets/audio/voice/mentor/`
**Gender:** perempuan Indonesia, usia 40-an
**Karakter:** hangat, profesional, membimbing — guru yang dipercaya, bukan presenter.
**Pace:** lebih lambat dari NEXA. Napas terdengar wajar.
**Post-processing:** natural, tanpa efek. Kompresi lembut 3:1, de-esser ringan.
**Jangan:** nada menggurui atau nada "iklan edukasi".

| ID | Scene | Emotion | Direction | Text |
|---|---|---|---|---|
| `mentor_intro` | Tujuan Pembelajaran | warm | Kalimat kedua adalah inti pesan game. Perlambat. | "Teknologi tidak cukup hanya canggih. Kita harus memastikan masa depan tetap manusiawi." |
| `mentor_explanation` | Modul 01 · masuk | explaining | Ringan, membuka topik. | "AI dapat membantu belajar lebih personal." |
| `mentor_explanation_02` | Modul 01 · parameter | concerned | "Tetapi" dibaca sebagai koreksi lembut, bukan bantahan. | "Tetapi sekolah bukan hanya tempat menerima informasi. Perhatikan garis interaksi saat kamu menggeser parameter." |
| `mentor_explanation_03` | Layar Konsekuensi | explaining | Menenangkan — pemain mungkin merasa gagal. | "Setiap kenaikan di satu sisi biasanya menurunkan sisi lain. Itu bukan kegagalan — itu cara sistem bekerja." |
| `mentor_reflection` | Modul 04 · Konstitusi | reflective | Hampir seperti bicara pada diri sendiri. | "Ini bukan hanya soal aturan. Ini soal nilai seperti apa yang ingin kita jaga." |
| `mentor_reflection_02` | Refleksi & Diskusi | encouraging | Mendorong, menutup sesi kelas. | "Bawa jawabanmu ke diskusi kelas. Masa depan dirancang bersama." |
| `mentor_unlock` | Orbital Lab · 3 modul selesai | reflective | Ada rasa upacara — sesuatu terbuka. | "Ruang Konstitusi telah terbuka. Ini saatnya menuliskan nilai yang ingin kita jaga." |
| `mentor_concern` | Event · balance ekstrem | concerned | Pertanyaan akhir tulus, bukan sindiran. | "Coba lihat sekali lagi. Dunia yang kamu rancang efisien, tetapi apakah kamu ingin tinggal di dalamnya?" |
| `mentor_praise` | Hasil seimbang | proud | Bangga tapi terkendali. Jangan berlebihan. | "Kamu menimbang, bukan hanya memilih. Itu yang membedakan perancang dari pengguna." |
| `mentor_debrief` | Hasil Akhir · debrief | warm | Ditujukan ke kelas, bukan ke satu orang. | "Bandingkan hasilmu dengan temanmu. Dunia yang sama-sama berhasil bisa terlihat sangat berbeda." |

---

## 3. ORION — 3 baris

**Folder:** `assets/audio/voice/orion/`
**Gender:** maskulin sintetis, register rendah
**Karakter:** efisien, persuasif, sedikit dingin — optimizer yang sangat sopan.
**Pace:** cepat dan datar. Tidak pernah ragu.
**Post-processing:** pitch -2 semitone, chorus tipis, noise gate ketat.
**Jangan:** terdengar jahat. ORION yakin dirinya menolong.

| ID | Scene | Emotion | Direction | Text |
|---|---|---|---|---|
| `orion_offer_01` | Modul 02 · masuk | persuasive | Menawarkan, bukan meminta. | "Sistem kota dapat menjadi lebih efisien." |
| `orion_offer_02` | Modul 02 · permintaan data | calculating | "Anda" — ORION selalu formal ke pemain. | "Pertanyaannya: berapa banyak data yang akan Anda gunakan?" |
| `orion_push_01` | Modul 02 · pengawasan tinggi | calculating | Kalimat terakhir datar sempurna — di situ letak ngerinya. | "Dengan akses penuh, saya dapat mengurangi kemacetan tiga puluh delapan persen. Privasi adalah variabel yang dapat dinegosiasikan." |

---

## 4. WARGA 2045 — 8 baris

**Folder:** `assets/audio/voice/citizen/`
**Casting:** 3 aktor berbeda — pelajar (remaja), pekerja (dewasa), lansia.
**Karakter:** suara manusia natural. Ini kesaksian, bukan akting panggung.
**Pace:** natural. Ragu, tarik napas, dan kalimat menggantung diizinkan.
**Post-processing:** tanpa efek. **Pertahankan room tone** — kontras dengan suara AI yang bersih.

| ID | Scene | Emotion | Direction | Text |
|---|---|---|---|---|
| `citizen_student_01` | Konsekuensi · Modul 01 | hopeful | Remaja, lega dan sedikit malu. | "Gurunya masih mengenal saya, bukan hanya nilai saya." |
| `citizen_student_02` | Konsekuensi · Modul 01 | confused | Remaja, bingung tanpa marah. Akhir menggantung. | "Semua tugas dinilai mesin. Saya tidak tahu harus bertanya ke siapa." |
| `citizen_worker_01` | Konsekuensi · Modul 03 | relieved | Dewasa, napas lega di awal. | "Saya dilatih ulang, bukan digantikan." |
| `citizen_worker_02` | Konsekuensi · Modul 03 | protest | Dewasa, marah tertahan — bukan berteriak. | "Pekerjaan saya hilang dan tidak ada yang menyiapkan saya." |
| `citizen_elder_01` | Konsekuensi · Modul 02 | relieved | Lansia, hangat, sedikit bangga pada kotanya. | "Kota ini masih terasa milik kami, bukan milik sistemnya." |
| `citizen_elder_02` | Konsekuensi · Modul 02 | protest | Lansia, tegas dan letih. Tekankan "tidak pernah dimintai izin". | "Saya diawasi sepanjang hari dan tidak pernah dimintai izin." |
| `citizen_protest_01` | Event · responsibility rendah | protest | Suara kerumunan tunggal — direkam sedikit lebih jauh dari mik. | "Kalau AI keliru, siapa yang mau bertanggung jawab?" |
| `citizen_relief_01` | Event · sustainability tinggi | hopeful | Remaja, kagum sederhana. | "Udaranya lebih bersih daripada cerita ayah saya." |

---

## 5. REGULATOR — 4 baris

**Folder:** `assets/audio/voice/regulator/`
**Gender:** dewasa, netral-formal
**Karakter:** formal, tegas, institusional — bicara atas nama lembaga, bukan dirinya.
**Pace:** mantap, setiap titik penuh.
**Post-processing:** reverb hall 12% (kesan ruang sidang).
**Jangan:** emosi personal. Tidak ada simpati maupun ancaman pribadi.

| ID | Scene | Emotion | Direction | Text |
|---|---|---|---|---|
| `regulator_intro_01` | Modul 04 · masuk | formal | Memperkenalkan lembaga. Berjarak, sopan. | "Delegasi regulator hadir. Kami akan mencatat setiap prinsip yang Anda tetapkan." |
| `regulator_pressing_01` | Modul 04 · prinsip lemah | pressing | Tekan "nama, bukan sistem". | "Pasal ini belum menyebut siapa yang bertanggung jawab. Kami memerlukan nama, bukan sistem." |
| `regulator_skeptical_01` | Modul 04 · condong ke AI | skeptical | Ada sejarah di balik kalimat ini. Pelan di akhir. | "Kelonggaran seperti ini pernah kami setujui sebelumnya. Hasilnya tidak baik." |
| `regulator_ack_01` | Modul 04 · segel | acknowledging | Resmi, final, seperti ketukan palu. | "Konstitusi diterima. Enam prinsip dicatat dan disegel atas nama publik." |

---

## Alur produksi

1. Rekam per karakter dalam satu sesi (konsistensi timbre & room).
2. Ekspor sesuai nama file di kolom **ID** → lihat `assets/audio/voice/<folder>/README.md` untuk daftar nama file.
3. Letakkan file di folder karakternya. **Tidak ada perubahan kode.**
4. Buka game, jalankan `VoiceManager.audit()` di konsol untuk melihat baris mana yang sudah/belum terisi.
5. Baris yang belum ada file tetap berjalan sebagai subtitle + animasi per kata + SFX.
