# BICARA BAHASA — *Rojak atau Rancu?*

Video podcast akademik BMMB3233 Sintaksis Bahasa Melayu (Tutorial M13).
Konsep **Porch Talk · Borak Beranda**. Rakaman sebenar di beranda rumah ialah bahan utama. Tiada visual AI dan tiada dialog baharu.

| | |
|---|---|
| Format | MP4 H.264, 1920×1080, 30 fps, AAC 48 kHz, −16 LUFS |
| Durasi | ±14:56 (pembukaan 11 s + perbualan + iklan 10 s + outro 15 s) |
| Penutur | **Naim** (kanan, hos) · **Fadli** (tengah, panel 1) · **Adam** (kiri, panel 2) |

## Struktur video (ikut rakaman sebenar)

| Masa | Bahagian | Sumber |
|---|---|---|
| 0:00 | Opening animation (11 s, tanpa teaser) | grafik + rakaman lebar |
| 0:11 | Pengenalan podcast | VID_1 0:00–1:41 |
| 1:50 | **01 — Apa itu Kerancuan Bahasa?** | VID_1 1:41–4:42 |
| 4:50 | **Iklan 10 s:** lagu *Lima Mit Lagi* (Suno, korus 1:11.6–1:21.6) | `music/suno.mp4` |
| 5:00 | **02 — Cabaran Rojak Betulkan** (5 contoh ayat) | VID_1 4:42–10:04 |
| 9:57 | **03 — Media Sosial dan Penulisan Murid** | VID_1 10:04–13:03 |
| 12:54 | **Penutup dan Rumusan** | VID_2 0:00–1:30 |
| 14:27 | Outro & kredit (15 s, fade to black) | VID_2 1:30–1:37 |

Rakaman tidak mengandungi Segmen 4 dan 5. Bahagian yang dibuang:
- Kesilapan rakaman di VID_1 5:11–5:25, iaitu jawapan contoh 1 yang diulang ("Ayat tadi silap").
- Jeda senyap lebih 0.9 s, dipendekkan kepada ±0.5 s.

## Kandungan folder

```
raw/                 rakaman asal (VID_1.mov, VID_2.mov) - tidak disimpan dalam git
work/                fail kerja: transkripsi Whisper (t1/t2.json), analisis bibir (lips_*.json), suara bersih
edit/
  subs.txt           SARI KATA DISEMAK + penutur setiap ayat (sunting di sini)
  build.py           pembina garis masa: potongan, syot kamera, sari kata, grafik, isyarat audio
  grade.txt          colour grading (ffmpeg)
  render_base.py     render rakaman asas (potong + grade) -> remotion/public/base.mp4
  pieces.json, audio_cues.json   (dijana)
audio/
  synth.py           muzik & SFX ASAL (disintesis, bebas royalti)
  music/             intro_cinematic.wav, bgm_lofi_porch.wav, outro_uplifting.wav
  sfx/               whoosh, impact, pop, swipe, click, riser, bass_hit, shimmer, ad_sting
  mix.py             campuran akhir + ducking + loudnorm -> output/audio/mix_final.wav
music/               lagu iklan Suno (suno.mp4 / suno.wav)
remotion/            projek Remotion (React + TypeScript)
  src/Opening.tsx    pembukaan sinematik
  src/Footage.tsx    kamera digital multicam (wide / medium 1.22× / close 1.34×) + split screen
  src/Overlays.tsx   sari kata, lower third, kad tajuk segmen, iklan, outro
  src/Graphics.tsx   word art + kad akademik (definisi, banding beza, Rojak Betulkan, infografik)
  src/theme.tsx      palet warna & tipografi
  src/timeline.json  (dijana oleh build.py)
output/
  Bicara_Bahasa_Rojak_atau_Rancu.mp4   video akhir
  Bicara_Bahasa_Rojak_atau_Rancu.srt   sari kata
  audio/mix_final.wav                  audio akhir
  graphics/                            aset grafik (PNG)
```

## Render semula

Keperluan: ffmpeg, Python 3 (`numpy scipy faster-whisper mediapipe opencv-python-headless`), Node 18+.

```bash
# 0. letak VID_1.mov & VID_2.mov dalam raw/ (sekali sahaja: transkripsi & analisis bibir)
cd work && python3 transcribe.py a1.wav t1.json && python3 lips.py ../raw/VID_1.mov lips_1.json   # (ulang untuk 2)

# 1. garis masa (selepas menyunting edit/subs.txt atau konfigurasi dalam build.py)
python3 edit/build.py

# 2. rakaman asas (potong + colour grade)
python3 edit/render_base.py

# 3. audio: muzik/SFX asal, kemudian campuran
python3 audio/synth.py 192 && python3 audio/mix.py

# 4. video (Remotion)
cd remotion && npm install && node render.mjs          # -> out/video_noaudio.mp4
#    pratonton bingkai: node stills.mjs 5 120 300

# 5. gabung video + audio
ffmpeg -i remotion/out/video_noaudio.mp4 -i output/audio/mix_final.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart output/Bicara_Bahasa_Rojak_atau_Rancu.mp4
```

## Konfigurasi penting (`edit/build.py`)

- `SECTIONS`, `CUTS`: julat setiap bahagian dan potongan kesilapan.
- `CHAPTERS`: tajuk kad segmen.
- `AD_AFTER`, `AD_DUR`, `AD_SONG_FROM`: kedudukan dan potongan lagu iklan.
- `EMPH` / `WIDE`: ayat yang diberi close-up (hujah penting/istilah) atau wide shot (reaksi/pertukaran topik).
- Blok `G(...)`: word art dan kad akademik. Masa ditulis dalam masa sumber dan dipetakan secara automatik.

## Audio

- Suara: `highpass 75 Hz → afftdn (NR 10 dB) → EQ (−2 dB @250 Hz, +2.5 dB @3.2 kHz, +1.5 dB shelf 9 kHz) → de-esser → compressor 3:1 → dynaudnorm`. Proses ini menyamakan aras ketiga-tiga penutur.
- Muzik latar lo-fi berada −25 dB di bawah suara ketika bercakap dan −15 dB ketika jeda. Ia naik semasa kad segmen dan senyap semasa iklan.
- Semua muzik dan SFX disintesis sendiri (`audio/synth.py`), jadi tiada isu hak cipta. Lagu iklan *Lima Mit Lagi* ialah lagu asal pemilik projek (Suno).

## Kredit

Naim (Hos / Moderator) · Fadli (Panel 1) · Adam (Panel 2). BMMB3233 Sintaksis Bahasa Melayu, Tutorial M13.
