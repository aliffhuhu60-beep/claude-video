# Video Penerangan: Kata Bilangan & Penjodoh Bilangan

Video pendidikan Bahasa Melayu, **30.0 saat**, 1920×1080 (16:9), 30 fps, MP4 (H.264 + AAC).
Gaya: animasi dunia voxel 3D (ala Minecraft) + grafik gerakan + tipografi dinamik.
Tiada nama individu atau pengenalan diri.

Fail akhir: `kata-bilangan.mp4` · sarikata berasingan: `sarikata.srt` (sarikata juga dibakar ke dalam video).

## Kod warna

| Warna | Maksud |
|---|---|
| 🟧 Kuning-jingga `#F2B33D` | **Kata bilangan** (dua, tiga, beberapa, semua, se-) |
| 🟦 Hijau-biru `#3EC1B3` | **Penjodoh bilangan** (batang, helai, ekor, buah) |
| ⬜ Putih | Kata nama (pensel, buku, kertas, kucing…) |

## Skrip suara latar & susunan visual (garis masa)

Suara: Bahasa Melayu baku (suara neural `ms-MY-YasminNeural`). Masa di bawah ialah masa sebenar dalam video.

| Masa (s) | Babak | Suara latar | Visual |
|---|---|---|---|
| 0.0 – 3.5 | **1. Pembukaan** | “Jom kita belajar kata bilangan dan penjodoh bilangan!” | Kamera sinematik terbang masuk ke dunia voxel (pokok, bukit, bunga, awan). Murid melambai, bola melantun, kucing, epal, pensel/buku/kertas terapung. Tajuk **KATA BILANGAN** (kuning) **&** **PENJODOH BILANGAN** (hijau-biru) muncul *pop-up* tepat ketika disebut. |
| 3.5 | peralihan | — | Peralihan blok (jubin rumput berputar menutup & membuka skrin). |
| 3.5 – 12.8 | **2. Kata bilangan** | “Kata bilangan ialah perkataan yang menunjukkan jumlah atau bilangan sesuatu.” | Pil bab *KATA BILANGAN*; kad definisi dengan **jumlah** / **bilangan** ditonjolkan. Empat pentas papan kayu. |
| 7.7 | | “Dua batang pensel.” | Dua pensel jatuh & melantun; label **DUA** batang pensel muncul, perkataan *DUA* berdenyut. |
| 9.1 | | “Tiga buah buku.” | Tiga buku (merah, biru, hijau) muncul; **TIGA** ditonjolkan. |
| 10.3 | | “Beberapa orang murid.” | Beberapa watak murid muncul & melambai; **BEBERAPA** ditonjolkan. |
| 11.6 | | “Semua pemain.” | Pasukan pemain berjersi muncul & melompat serentak, bola melantun; **SEMUA** ditonjolkan. Kamera beralih perlahan mengikut contoh. |
| 12.8 | peralihan | — | Peralihan blok (jubin papan kayu). |
| 12.8 – 22.5 | **3. Penjodoh bilangan** | “Penjodoh bilangan digunakan bersama kata bilangan untuk menerangkan unit atau bentuk benda.” | Pil bab *PENJODOH BILANGAN*; kad definisi (**unit** / **bentuk**). Empat tapak batu. Petunjuk warna di penjuru kanan. |
| 17.4 | | “Sebatang pensel.” | Pensel muncul (kepulan blok) di atas tapak; label **SE**+**BATANG** pensel — *BATANG* berdenyut. |
| 18.7 | | “Sehelai kertas.” | Sehelai kertas bergaris terapung; **SE**+**HELAI**. |
| 20.0 | | “Seekor kucing.” | Kucing voxel duduk di atas tapak, ekor bergoyang; **SE**+**EKOR**. |
| 21.3 | | “Sebuah buku.” | Buku muncul; **SE**+**BUAH**. |
| 22.5 | peralihan | — | Peralihan blok (jubin batu). |
| 22.5 – 26.5 | **4. Perbandingan** | “Kata bilangan menunjukkan jumlah, penjodoh bilangan menunjukkan unit.” | Dua panel bersebelahan: **KATA BILANGAN**: DUA · TIGA · BEBERAPA (“menunjukkan jumlah”) dan **PENJODOH BILANGAN**: BATANG · HELAI · EKOR · BUAH (“menunjukkan unit atau bentuk”). Panel bercahaya ketika disebut. |
| 26.3 – 30.0 | **Rumusan & penutup** | “Gunakan kata bilangan dan penjodoh bilangan dengan betul!” | Contoh lengkap **DUA** (kata bilangan) **BATANG** (penjodoh bilangan) **PENSEL** (kata nama). Mesej penutup muncul; semua watak bersorak, konfeti blok jatuh, akord penutup, pudar ke hitam pada 30.0 s. |

Nota sarikata: ayat penutup tidak diulang dalam jalur sarikata kerana ia sudah dipaparkan sebagai mesej penutup pada skrin (ia tetap ada dalam `sarikata.srt`).

## Semakan tatabahasa contoh

- dua **batang** pensel · tiga **buah** buku · beberapa **orang** murid · semua pemain
- se**batang** pensel · se**helai** kertas · se**ekor** kucing · se**buah** buku
- *se-* = satu (kata bilangan); *batang/helai/ekor/buah* = penjodoh bilangan.

## Cara bina semula

```bash
./build.sh
```

Langkah: `audio/tts.py` (suara + masa setiap perkataan) → `audio/timeline.py` (kedudukan klip) →
`render.mjs` (Chromium tanpa kepala menangkap 900 bingkai daripada `index.html` / `main.js`, Three.js) →
`audio/mix.py` (suara + muzik sintesis + kesan bunyi, *ducking* muzik di bawah suara) → ffmpeg.

Semua grafik (tekstur piksel, watak, objek) dan muzik dijana secara prosedural dalam kod — tiada aset luar berhak cipta.
Pratonton interaktif: jalankan pelayan statik dalam folder ini dan buka `index.html` (atau `index.html?t=12.3` untuk satu bingkai).
