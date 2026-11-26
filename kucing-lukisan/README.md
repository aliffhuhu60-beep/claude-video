# Kucing & Lukisan Kejuruteraan (animasi 30 saat)

Animasi interaktif HTML5 Canvas, tanpa pustaka luar. Buka `index.html` terus dalam pelayar (Chrome/Edge/Firefox).

Lukisan diambil daripada jawapan **Soalan 4** (unjuran ortografik sudut ketiga) dan **Soalan 5** (isometri arah A).
**Nilai ukuran tidak dipaparkan.** Hanya dua garisan dimensi kosong (tanpa nombor) dipaparkan supaya kucing kelabu ada sesuatu untuk ditolak.
Untuk membuangnya, tetapkan `CONFIG.showDimensionLines = false`.

## Garis masa
| Masa | Babak |
|---|---|
| 0 – 8 s | Grid, bingkai dan blok tajuk muncul. Kemudian garisan lipatan, miter 45° dan garisan unjuran dilukis, diikuti paksi isometri 30° dan kotak binaan. Oyen dan Abu melompat masuk. |
| 8 – 20 s | Oyen kejar pensel yang menjejak garisan unjuran sepanjang miter 45°. Abu tolak dua garisan dimensi ke tempatnya. Pensel menakat pandangan sisi, hadapan, atas dan lukisan isometri. Oyen mencakar garisan isometri sampai ia bergetar. |
| 20 – 30 s | Garisan binaan dipudarkan, label dan blok tajuk ditaip, kemudian setem **SIAP!** muncul. Kedua-dua kucing berbaring tidur di penjuru kiri bawah (Zzz). |

## Kawalan
- **Space**: main atau jeda. **R**: ulang dari awal. **← / →**: lompat 1 saat. Peluncur boleh digunakan untuk scrub.
- **Klik kucing**: kucing melompat dengan bunyi "ngiau" dan keluar hati.
- **⏺ Rakam WebM**: merakam 30 saat penuh lalu memuat turun fail `.webm`.

## Cara ubah suai (`animasi.js`)
- `CONFIG`: warna, saiz, skala dan kedudukan lukisan (`ortho`, `iso`) serta kelajuan pensel (`inkSpeed`).
- `PHASES`: teks kapsyen setiap babak.
- `SOALAN4` / `SOALAN5`: koordinat garisan dalam unit pt, diambil terus daripada PDF jawapan.
- `buildScript()`: masa mula dan tamat setiap garisan binaan, serta urutan pensel.
- `buildDims()`: garisan dimensi yang ditolak, termasuk masa tolakan dan anjakan.
- `buildCats()`: jalan cerita kucing (segmen `jump`, `move`, `idle`, `push` dan `sleep` mengikut masa).
- `drawCat()` / `drawHead()`: rupa kucing. Warna setiap kucing ada dalam `CONFIG.cats`.

Semua keadaan babak ialah fungsi masa `t`, jadi mengubah satu nombor masa tidak merosakkan babak lain.

## Video MP4
`kucing-lukisan-kejuruteraan.mp4`: 1920×1080, 30 fps, 30 saat, tanpa audio.
Untuk menjana semula selepas mengubah kod (memerlukan Node, Playwright dan ffmpeg):
```
node eksport-video.js kucing-lukisan-kejuruteraan.mp4
```
