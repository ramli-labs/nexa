# Prompt TTS Voice Over NEXA

Panduan menghasilkan 45 baris voice over lewat layanan TTS eksternal (ElevenLabs / Google Cloud TTS / Azure Speech).
Teks dan nama file **dikunci** oleh `assets/js/voiceConfig.js` — jangan diubah, cukup ekspor sesuai kolom **File**.

**Output wajib:** mp3 80 kbps **mono** · -16 LUFS · true peak -1 dBFS · silence awal/akhir ≤ 150 ms
**Bahasa:** Indonesia. Angka **sudah** ditulis sebagai kata di naskah — jangan dinormalisasi ulang.
**Batch file:** `assets/audio/voice/_tts_batch.csv` (id, voice hint, output path, prosody, text) untuk generate massal.

Setelah file masuk ke foldernya, buka game dan jalankan `VoiceManager.audit()` di konsol untuk memverifikasi 45 baris.

---

## Cara pakai per layanan

**ElevenLabs** — pakai *Voice Design* dengan prompt karakter di bawah, simpan sebagai voice, lalu generate per baris memakai angka Stability / Similarity / Style / Speed yang tertera. Matikan "Speaker Boost" untuk WARGA.

**Google Cloud TTS** — pakai nama voice + speakingRate + pitch yang tertera. Kirim sebagai SSML:
```xml
<speak><prosody rate="0.95" pitch="-1st">Selamat datang di NEXA Simulation Lab.</prosody></speak>
```

**Azure Speech** — pakai voice + style + rate/pitch yang tertera:
```xml
<speak version="1.0" xml:lang="id-ID">
  <voice name="id-ID-ArdiNeural">
    <mstts:express-as style="newscast-casual">
      <prosody rate="-4%" pitch="-2%">Selamat datang di NEXA Simulation Lab.</prosody>
    </mstts:express-as>
  </voice>
</speak>
```

---

## NARA-01 (NEXA Core) — 20 baris
**Folder:** `assets/audio/voice/nexa/`

### Prompt voice design (ElevenLabs / voice cloning brief)
> A calm, precise, gender-neutral synthetic narrator. Mid-range timbre, neither clearly male nor female. Speaks Indonesian with clean articulation and even pacing, like a scientific instrument explaining itself. Intelligent and composed — never robotic, never monotone, never cheerful. Slight air, no vibrato, no emotional swell.

### Setelan
| Layanan | Setelan |
|---|---|
| ElevenLabs | Stability **0.62** · Similarity **0.85** · Style **0.15** · Speed **0.96** |
| Google Cloud TTS | id-ID-Wavenet-C (atau id-ID-Standard-C) · speakingRate 0.95 · pitch -1.0 |
| Azure Speech | id-ID-ArdiNeural · style: newscast-casual · rate -4% · pitch -2% |
| Post-processing | high-shelf +2 dB @ 6 kHz · plate reverb 8% · bitcrush sangat halus hanya di ekor kata terakhir |

### Baris
| # | ID · File | SSML prosody | Emotion | Text |
|---|---|---|---|---|
| 1 | `nexa_boot_01`<br>`nexa/boot_01.mp3` | `rate="0.95" pitch="-1st"` | calm | Sistem NEXA aktif. Menyiapkan Orbital Lab. |
| 2 | `nexa_intro_01`<br>`nexa/intro_01.mp3` | `rate="0.95" pitch="-1st"` | calm | Selamat datang di NEXA Simulation Lab. |
| 3 | `nexa_intro_02`<br>`nexa/intro_02.mp3` | `rate="0.95" pitch="-1st"` | calm | Di sini, kamu tidak hanya mempelajari masa depan. Kamu akan merancangnya. |
| 4 | `nexa_hub_01`<br>`nexa/hub_01.mp3` | `rate="0.95" pitch="-1st"` | informative | Empat simulasi telah disiapkan. Simulasi keempat terbuka setelah tiga lainnya selesai. |
| 5 | `nexa_hub_02`<br>`nexa/hub_02.mp3` | `rate="0.95" pitch="-1st"` | analytical | Setiap simulasi menunjukkan tantangan masa depan yang berbeda. Pilih satu untuk memulai. |
| 6 | `nexa_hub_progress_01`<br>`nexa/hub_progress_01.mp3` | `rate="0.95" pitch="-1st"` | analytical | Future Balance diperbarui. Masih ada simulasi yang menunggu sebelum Ruang Konstitusi terbuka. |
| 7 | `nexa_hub_complete_01`<br>`nexa/hub_complete_01.mp3` | `rate="0.95" pitch="-1st"` | affirming | Semua sistem telah dirancang. Buka profilmu untuk melihat dunia yang terbentuk. |
| 8 | `nexa_module_school_01`<br>`nexa/module_school_01.mp3` | `rate="0.95" pitch="-1st"` | informative | Modul satu. Smart School dua ribu empat puluh lima. Enam parameter menunggu keputusanmu. |
| 9 | `nexa_module_city_01`<br>`nexa/module_city_01.mp3` | `rate="0.95" pitch="-1st"` | informative | Modul dua. Kota ini dikelola oleh ORION. Dengarkan usulannya, tetapi keputusan tetap milikmu. |
| 10 | `nexa_module_work_01`<br>`nexa/module_work_01.mp3` | `rate="0.95" pitch="-1st"` | calm | Pekerjaan berubah. Kemampuan manusia juga harus berkembang. |
| 11 | `nexa_module_work_02`<br>`nexa/module_work_02.mp3` | `rate="0.95" pitch="-1st"` | analytical | Energi pengembangan terbatas: dua belas unit. Mana yang paling penting untuk dua ribu empat puluh lima? |
| 12 | `nexa_module_future_01`<br>`nexa/module_future_01.mp3` | `rate="0.95" pitch="-1st"` | calm | Tidak ada masa depan yang tercipta tanpa pilihan. Setiap prinsip akan membentuk segel. |
| 13 | `nexa_warning_01`<br>`nexa/warning_01.mp3` | `rate="0.95" pitch="-1st"` | warning | Peringatan. Indikator kemanusiaan turun di bawah ambang aman. Sistem efisien, tetapi warga mulai kehilangan tempat. |
| 14 | `nexa_warning_02`<br>`nexa/warning_02.mp3` | `rate="0.95" pitch="-1st"` | warning | Peringatan. Tanggung jawab tidak terdefinisi. Jika sistem ini salah, tidak ada yang dapat menjawab. |
| 15 | `nexa_warning_03`<br>`nexa/warning_03.mp3` | `rate="0.95" pitch="-1st"` | warning | Otomasi melampaui kapasitas pengawasan manusia. Kecepatan naik, kendali menurun. |
| 16 | `nexa_decision_01`<br>`nexa/decision_01.mp3` | `rate="0.95" pitch="-1st"` | analytical | Pilihanmu menciptakan konsekuensi. Tidak ada yang salah — hanya trade-off yang berbeda. |
| 17 | `nexa_decision_02`<br>`nexa/decision_02.mp3` | `rate="0.95" pitch="-1st"` | affirming | Desain terkunci. Menghitung dampaknya terhadap dua ribu empat puluh lima. |
| 18 | `nexa_decision_03`<br>`nexa/decision_03.mp3` | `rate="0.95" pitch="-1st"` | analytical | Menghitung ulang. Parameter berubah, proyeksi ikut bergeser. |
| 19 | `nexa_ending_01`<br>`nexa/ending_01.mp3` | `rate="0.95" pitch="-1st"` | affirming | Saya dapat menghitung kemungkinan masa depan. Kamu yang memutuskan masa depan mana yang layak dibangun. |
| 20 | `nexa_ending_02`<br>`nexa/ending_02.mp3` | `rate="0.95" pitch="-1st"` | calm | Simulasi selesai. Dunia ini hanya satu dari banyak kemungkinan — dan kamu yang memilihnya. |

---

## KAIA (Mentor) — 10 baris
**Folder:** `assets/audio/voice/mentor/`

### Prompt voice design (ElevenLabs / voice cloning brief)
> An Indonesian woman in her forties. Warm, professional, guiding — a teacher students actually trust. Natural chest resonance, audible gentle breath between clauses, unhurried. Never presentational, never advertising-bright, never condescending.

### Setelan
| Layanan | Setelan |
|---|---|
| ElevenLabs | Stability **0.5** · Similarity **0.8** · Style **0.35** · Speed **0.9** |
| Google Cloud TTS | id-ID-Wavenet-A · speakingRate 0.88 · pitch -0.5 |
| Azure Speech | id-ID-GadisNeural · style: gentle · rate -10% · pitch 0% |
| Post-processing | tanpa efek · kompresi lembut 3:1 · de-esser ringan |

### Baris
| # | ID · File | SSML prosody | Emotion | Text |
|---|---|---|---|---|
| 1 | `mentor_intro`<br>`mentor/intro.mp3` | `rate="0.88" pitch="0st"` | warm | Teknologi tidak cukup hanya canggih. Kita harus memastikan masa depan tetap manusiawi. |
| 2 | `mentor_explanation`<br>`mentor/explanation.mp3` | `rate="0.88" pitch="0st"` | explaining | AI dapat membantu belajar lebih personal. |
| 3 | `mentor_explanation_02`<br>`mentor/explanation_02.mp3` | `rate="0.88" pitch="0st"` | concerned | Tetapi sekolah bukan hanya tempat menerima informasi. Perhatikan garis interaksi saat kamu menggeser parameter. |
| 4 | `mentor_explanation_03`<br>`mentor/explanation_03.mp3` | `rate="0.88" pitch="0st"` | explaining | Setiap kenaikan di satu sisi biasanya menurunkan sisi lain. Itu bukan kegagalan — itu cara sistem bekerja. |
| 5 | `mentor_reflection`<br>`mentor/reflection.mp3` | `rate="0.88" pitch="0st"` | reflective | Ini bukan hanya soal aturan. Ini soal nilai seperti apa yang ingin kita jaga. |
| 6 | `mentor_reflection_02`<br>`mentor/reflection_02.mp3` | `rate="0.88" pitch="0st"` | encouraging | Bawa jawabanmu ke diskusi kelas. Masa depan dirancang bersama. |
| 7 | `mentor_unlock`<br>`mentor/unlock.mp3` | `rate="0.88" pitch="0st"` | reflective | Ruang Konstitusi telah terbuka. Ini saatnya menuliskan nilai yang ingin kita jaga. |
| 8 | `mentor_concern`<br>`mentor/concern.mp3` | `rate="0.88" pitch="0st"` | concerned | Coba lihat sekali lagi. Dunia yang kamu rancang efisien, tetapi apakah kamu ingin tinggal di dalamnya? |
| 9 | `mentor_praise`<br>`mentor/praise.mp3` | `rate="0.88" pitch="0st"` | proud | Kamu menimbang, bukan hanya memilih. Itu yang membedakan perancang dari pengguna. |
| 10 | `mentor_debrief`<br>`mentor/debrief.mp3` | `rate="0.88" pitch="0st"` | warm | Bandingkan hasilmu dengan temanmu. Dunia yang sama-sama berhasil bisa terlihat sangat berbeda. |

---

## ORION (City AI) — 3 baris
**Folder:** `assets/audio/voice/orion/`

### Prompt voice design (ElevenLabs / voice cloning brief)
> A low, masculine synthetic optimizer voice. Efficient, persuasive, faintly cold — utterly certain it is helping. Flat affect, fast delivery, clipped sentence ends. Polite corporate register in Indonesian. No menace in the performance; the menace is in the content.

### Setelan
| Layanan | Setelan |
|---|---|
| ElevenLabs | Stability **0.75** · Similarity **0.85** · Style **0.1** · Speed **1.08** |
| Google Cloud TTS | id-ID-Wavenet-B · speakingRate 1.08 · pitch -3.0 |
| Azure Speech | id-ID-ArdiNeural · rate +8% · pitch -6% |
| Post-processing | pitch -2 semitone · chorus tipis · noise gate ketat |

### Baris
| # | ID · File | SSML prosody | Emotion | Text |
|---|---|---|---|---|
| 1 | `orion_offer_01`<br>`orion/offer_01.mp3` | `rate="1.08" pitch="-3st"` | persuasive | Sistem kota dapat menjadi lebih efisien. |
| 2 | `orion_offer_02`<br>`orion/offer_02.mp3` | `rate="1.08" pitch="-3st"` | calculating | Pertanyaannya: berapa banyak data yang akan Anda gunakan? |
| 3 | `orion_push_01`<br>`orion/push_01.mp3` | `rate="1.08" pitch="-3st"` | calculating | Dengan akses penuh, saya dapat mengurangi kemacetan tiga puluh delapan persen. Privasi adalah variabel yang dapat dinegosiasikan. |

---

## Warga 2045 — 8 baris
**Folder:** `assets/audio/voice/citizen/`

### Prompt voice design (ElevenLabs / voice cloning brief)
> Ordinary Indonesian people giving testimony, not acting: a teenager, a working adult, and an elderly person — three distinct voices. Unpolished, natural hesitation, sentences allowed to trail off. Recorded in a real room, close but not studio-clean.

### Setelan
| Layanan | Setelan |
|---|---|
| ElevenLabs | Stability **0.42** · Similarity **0.72** · Style **0.45** · Speed **0.95** |
| Google Cloud TTS | pelajar → id-ID-Wavenet-D (rate 1.0, pitch +2) · pekerja → id-ID-Wavenet-B (rate 0.95, pitch 0) · lansia → id-ID-Wavenet-A (rate 0.85, pitch -2) |
| Azure Speech | pelajar → id-ID-GadisNeural (rate +5%, pitch +6%) · pekerja → id-ID-ArdiNeural (rate 0%) · lansia → id-ID-ArdiNeural (rate -12%, pitch -8%) |
| Post-processing | tanpa efek — PERTAHANKAN room tone (kontras dengan suara AI yang bersih) |

### Baris
| # | ID · File | SSML prosody | Emotion | Text |
|---|---|---|---|---|
| 1 | `citizen_student_01`<br>`citizen/student_01.mp3` | `rate="1.00" pitch="+2st"` | hopeful | Gurunya masih mengenal saya, bukan hanya nilai saya. |
| 2 | `citizen_student_02`<br>`citizen/student_02.mp3` | `rate="0.95" pitch="+2st"` | confused | Semua tugas dinilai mesin. Saya tidak tahu harus bertanya ke siapa. |
| 3 | `citizen_worker_01`<br>`citizen/worker_01.mp3` | `rate="0.95" pitch="0st"` | relieved | Saya dilatih ulang, bukan digantikan. |
| 4 | `citizen_worker_02`<br>`citizen/worker_02.mp3` | `rate="1.02" pitch="0st"` | protest | Pekerjaan saya hilang dan tidak ada yang menyiapkan saya. |
| 5 | `citizen_elder_01`<br>`citizen/elder_01.mp3` | `rate="0.85" pitch="-2st"` | relieved | Kota ini masih terasa milik kami, bukan milik sistemnya. |
| 6 | `citizen_elder_02`<br>`citizen/elder_02.mp3` | `rate="0.85" pitch="-2st"` | protest | Saya diawasi sepanjang hari dan tidak pernah dimintai izin. |
| 7 | `citizen_protest_01`<br>`citizen/protest_01.mp3` | `rate="1.05" pitch="+1st"` | protest | Kalau AI keliru, siapa yang mau bertanggung jawab? |
| 8 | `citizen_relief_01`<br>`citizen/relief_01.mp3` | `rate="0.98" pitch="+2st"` | hopeful | Udaranya lebih bersih daripada cerita ayah saya. |

---

## Delegasi Regulator — 4 baris
**Folder:** `assets/audio/voice/regulator/`

### Prompt voice design (ElevenLabs / voice cloning brief)
> An adult institutional voice reading an official record in Indonesian. Formal, firm, impersonal — speaking on behalf of a body, not a self. Full stops fully landed, steady tempo, no sympathy and no personal threat.

### Setelan
| Layanan | Setelan |
|---|---|
| ElevenLabs | Stability **0.78** · Similarity **0.88** · Style **0.05** · Speed **0.92** |
| Google Cloud TTS | id-ID-Wavenet-B · speakingRate 0.9 · pitch -1.5 |
| Azure Speech | id-ID-ArdiNeural · style: serious · rate -8% · pitch -3% |
| Post-processing | reverb hall 12% (kesan ruang sidang) |

### Baris
| # | ID · File | SSML prosody | Emotion | Text |
|---|---|---|---|---|
| 1 | `regulator_intro_01`<br>`regulator/intro_01.mp3` | `rate="0.90" pitch="-1st"` | formal | Delegasi regulator hadir. Kami akan mencatat setiap prinsip yang Anda tetapkan. |
| 2 | `regulator_pressing_01`<br>`regulator/pressing_01.mp3` | `rate="0.90" pitch="-1st"` | pressing | Pasal ini belum menyebut siapa yang bertanggung jawab. Kami memerlukan nama, bukan sistem. |
| 3 | `regulator_skeptical_01`<br>`regulator/skeptical_01.mp3` | `rate="0.90" pitch="-1st"` | skeptical | Kelonggaran seperti ini pernah kami setujui sebelumnya. Hasilnya tidak baik. |
| 4 | `regulator_ack_01`<br>`regulator/ack_01.mp3` | `rate="0.90" pitch="-1st"` | acknowledging | Konstitusi diterima. Enam prinsip dicatat dan disegel atas nama publik. |

---

## Contoh generate massal (Google Cloud TTS, Python)

```python
import csv, re, html
from google.cloud import texttospeech

client = texttospeech.TextToSpeechClient()
cfg = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3,
    sample_rate_hertz=24000)

with open('assets/audio/voice/_tts_batch.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        rate  = float(re.search(r'rate="([\d.]+)"',  row['ssml_prosody']).group(1))
        pitch = float(re.search(r'pitch="(-?[\d.]+)st"', row['ssml_prosody']).group(1))
        name  = row['voice_hint'].split(' ')[0]          # mis. id-ID-Wavenet-C
        ssml  = f"<speak>{html.escape(row['text'])}</speak>"
        res = client.synthesize_speech(
            input=texttospeech.SynthesisInput(ssml=ssml),
            voice=texttospeech.VoiceSelectionParams(language_code='id-ID', name=name),
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=rate, pitch=pitch))
        open(row['output_path'], 'wb').write(res.audio_content)
        print('ok', row['id'])
```

Normalisasi loudness setelah generate (opsional, ffmpeg):
```bash
for f in assets/audio/voice/*/*.mp3; do
  ffmpeg -y -i "$f" -af loudnorm=I=-16:TP=-1:LRA=11 -ac 1 -b:a 80k "${f%.mp3}_n.mp3" \
  && mv "${f%.mp3}_n.mp3" "$f"
done
```

## Checklist sebelum submit
- [ ] 45 file ada di folder karakternya, nama persis seperti kolom **File**
- [ ] `VoiceManager.audit()` melaporkan `ok: true` untuk semua id
- [ ] Badge di kotak dialog berubah dari **TEKS+SFX** menjadi **VO**
- [ ] Bundle ulang `index.html` agar audio ter-embed
