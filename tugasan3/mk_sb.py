import base64, html, re
def img(n): return 'data:image/jpeg;base64,'+base64.b64encode(open(f'sb/{n}.jpg','rb').read()).decode()
subs=[l.rstrip('\n').split('|',1) for l in open('subs.txt',encoding='utf8') if '|' in l]
def hl(s): return re.sub(r'\*(.+?)\*', r'<b class="k">\1</b>', html.escape(s).replace('&quot;','"'))
subtxt=''.join(f'<li>{hl(s)}</li>' for i,s in subs if s!='-')

scenes=[
 ('Pembukaan','0:00 – 1:12',[('00138','0:10','Wajah penuh dan kad nama ketika salam dan pengenalan diri.')],
  'Salam, pengenalan diri, tajuk syarahan, penghargaan.'),
 ('Bahagian 1 · Pengenalan & hubungan falsafah','1:12 – 3:43',[('00780','1:15','Slaid Peta syarahan, anda di panel kanan.'),('02235','3:40','Slaid Isu pilihan, soalan utama ditonjolkan.')],
  'Peta syarahan, imbasan Tugasan 2 (lima tradisi + FPK), isu pilihan dan persoalan utama.'),
 ('Bahagian 2 · Analisis kritis isu semasa','3:43 – 13:48',[('02415','3:44','Slaid Konsep masyarakat majmuk.'),('02585','4:01','Petikan Furnivall.'),('03860','5:57','Carta IPNas.'),('04575','7:09','Bukti belia 43% → 58%.'),('05355','8:19','Carta 3R MCMC.'),('08135','12:50','Slaid Membaca bukti secara kritis.')],
  'Masyarakat majmuk, tiga lapisan isu, bukti (IPNas, Merdeka Center, 3R, enrolmen, ISIS), Allport, naratif mudah, had bukti, lensa konsep insan.'),
 ('Bahagian 3 · Cadangan penyelesaian: kerangka BINA','13:48 – 19:55',[('08780','13:50','Slaid Kerangka BINA.'),('08895','14:01','Kerangka BINA, huruf ditonjolkan dalam sarikata.'),('10725','16:57','Slaid N · Protokol SEMAK.')],
  'B, I, N, A satu per satu, pelan pelaksanaan, petunjuk kejayaan, tiga prinsip etika.'),
 ('Bahagian 4 · Rumusan & penutup','19:55 – 21:36',[('12695','19:57','Slaid Rumusan.'),('13325','21:00','Petikan pendirian.')],
  'Rumusan, pendirian, penutup.'),
]
sc=''
for t,rng,frames,desc in scenes:
    fr=''.join(f'<figure><img src="{img(n)}" alt="Bingkai {tc}" loading="lazy"><figcaption><span class="tc">{tc}</span>{html.escape(c)}</figcaption></figure>' for n,tc,c in frames)
    sc+=f'<section class="scene"><header><h3>{html.escape(t)}</h3><span class="rng">{rng}</span></header><p>{html.escape(desc)}</p><div class="frames">{fr}</div></section>'

cuts=[
 ('0:00','0:03','3 s','Diam sebelum mula bercakap','ok'),
 ('3:46','4:00','14 s','Perbualan di belakang tabir: "Ok dah dah dah… berapa minit?… atas lagi, okey" dan tukar lokasi','ok'),
 ('6:00','6:11','11 s','Ayat tersangkut: "marilah kita lihat apalah, apa yang dikatakan oleh… dikatakan oleh bukti". Ayat peralihan sahaja, isi tidak hilang','ok'),
 ('7:53','7:54','1.6 s','Jeda panjang di tengah ayat ("dengan … ketiadaan jiran")','ok'),
 ('8:47','8:53','6 s','Ulangan: "8,540 kandungan telah diturunkan" disebut dua kali, simpan yang kedua','ok'),
 ('10:18','10:25','7 s','Tukar lokasi (anda membetulkan kamera)','ok'),
 ('14:31','14:36','5 s','Tukar lokasi','ok'),
 ('17:41','17:49','7 s','SEMAK tersangkut: "SEMAK, S, Sumber, kenal pasti…" sebelum diulang semula','check'),
 ('20:16','20:20','4 s','Jeda panjang sebelum "penurunan insiden buli"','ok'),
 ('20:54','21:08','14 s','Lif kosong sebelum anda masuk ke bingkai','ok'),
 ('22:49','22:52','3 s','Logo CapCut di hujung video','ok'),
]
ct=''.join(f'<tr class="{"flag" if s=="check" else ""}"><td class="num">{a}</td><td class="num">{b}</td><td class="num">{d}</td><td>{html.escape(r)}{" <span class=pill>Sila sahkan</span>" if s=="check" else ""}</td></tr>' for a,b,d,r,s in cuts)

page=f'''<title>Storyboard Video Tugasan 3</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Source+Sans+3:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Layout: single reading column, scenes as frame strips, edit list as a timecode table */
:root{{--bg:#f6f7f4;--surface:#ffffff;--fg:#1d2420;--muted:#5d6862;--line:#dde2dc;--accent:#1f5f8b;--key:#b08400;--keybg:#fff3c4;--warn:#9a3b12;--warnbg:#fde8dc;
--display:"Fraunces",Georgia,serif;--body:"Source Sans 3",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#141815;--surface:#1c211e;--fg:#e8ece8;--muted:#9aa59f;--line:#2e3631;--accent:#7cb6de;--key:#ffd23f;--keybg:#3a3110;--warn:#ffb08a;--warnbg:#3b2117;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#141815;--surface:#1c211e;--fg:#e8ece8;--muted:#9aa59f;--line:#2e3631;--accent:#7cb6de;--key:#ffd23f;--keybg:#3a3110;--warn:#ffb08a;--warnbg:#3b2117;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:17px/1.55 var(--body)}}
.wrap{{max-width:1040px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:40px 64px;display:grid;gap:44px}}
h1,h2,h3{{font-family:var(--display);font-weight:600;text-wrap:balance;margin:0;line-height:1.2}}
h1{{font-size:2.1rem}} h2{{font-size:1.45rem;margin-bottom:14px}} h3{{font-size:1.1rem}}
p{{margin:0;max-width:68ch}}
.eyebrow{{font:500 .78rem var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}}
.intro{{display:grid;gap:12px}}
.facts{{display:flex;flex-wrap:wrap;gap:10px 28px;margin-top:6px}}
.facts div{{display:grid}} .facts dt{{font-size:.8rem;color:var(--muted)}} .facts dd{{margin:0;font:500 1.05rem var(--mono)}}
.style-list{{display:grid;gap:10px;padding:0;margin:0;list-style:none}}
.style-list li{{display:grid;grid-template-columns:150px 1fr;gap:14px;border-top:1px solid var(--line);padding-top:10px}}
.style-list li span:first-child{{font-weight:700}}
@media (max-width:560px){{.style-list li{{grid-template-columns:1fr;gap:2px}}}}
.k{{color:var(--key);font-weight:700}}
.scene{{display:grid;gap:10px;padding-block:20px;border-top:1px solid var(--line)}}
.scene header{{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;align-items:baseline}}
.rng,.tc,.num{{font-family:var(--mono);font-variant-numeric:tabular-nums}}
.rng{{color:var(--accent)}}
.scene>p{{color:var(--muted)}}
.frames{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}}
figure{{margin:0;display:grid;gap:6px;min-width:0}}
figure img{{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px;display:block}}
figcaption{{font-size:.9rem;color:var(--muted)}} .tc{{color:var(--fg);margin-right:8px}}
.tbl{{overflow-x:auto}}
.sls{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}}
.sl{{display:grid;gap:6px;font-size:.9rem;min-width:0}}
.sl img,.sl .ph{{width:100%;aspect-ratio:16/9;border-radius:3px;border:1px solid var(--line);display:block}}
.sl .ph{{display:grid;place-items:center;background:var(--surface);color:var(--muted);font-weight:600}}
table{{border-collapse:collapse;width:100%;min-width:560px;font-size:.95rem}}
th,td{{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}}
th{{font-size:.8rem;color:var(--muted);font-weight:600}}
tr.flag td{{background:var(--warnbg)}}
.pill{{display:inline-block;font:600 .72rem var(--body);letter-spacing:.04em;color:var(--warn);border:1px solid currentColor;border-radius:99px;padding:1px 8px;margin-left:6px}}
.qs{{display:grid;gap:14px;padding:0;margin:0;list-style:none;counter-reset:q}}
.qs li{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:14px 16px;display:grid;gap:4px}}
.qs b{{font-weight:700}}
details{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:12px 16px}}
summary{{cursor:pointer;font-weight:700}}
summary:focus-visible{{outline:2px solid var(--accent);outline-offset:3px}}
details ol{{margin:12px 0 0;padding-left:2.4em;display:grid;gap:4px;font-size:.95rem}}
details ol li::marker{{color:var(--muted);font:.8rem var(--mono)}}
</style>
<div class="wrap">
<div class="intro">
<span class="eyebrow">Storyboard · untuk semakan sebelum render akhir</span>
<h1>Video syarahan Tugasan 3 MPU3152</h1>
<p>Slaid daripada Bahan Visual Video dimasukkan mengikut apa yang anda sebut, supaya video memenuhi kehendak format visual tugasan (slaid, carta, rajah, bukan sekadar wajah bercakap). Selebihnya kekal ringkas: sarikata, keypoint ditonjolkan, tiada muzik dan tiada animasi.</p>
<dl class="facts"><div><dt>Tempoh asal</dt><dd>22:52</dd></div><div><dt>Selepas suntingan</dt><dd>21:43</dd></div><div><dt>Slaid dimasukkan</dt><dd>33 paparan</dd></div><div><dt>Resolusi output</dt><dd>1920×1080 MP4</dd></div><div><dt>Sarikata</dt><dd>325 baris</dd></div></dl>
</div>

<section><h2>Gaya</h2>
<ul class="style-list">
<li><span>Sarikata</span><span>Putih, tebal sederhana, garis hitam nipis, di tengah bawah. Maksimum 2 baris.</span></li>
<li><span>Keypoint</span><span>Ditebalkan dan berwarna <b class="k">kuning</b>: angka bukti, konsep teras, huruf BINA dan SEMAK, pendirian.</span></li>
<li><span>Susun atur</span><span>Slaid di kiri, anda di panel kanan, sarikata di jalur bawah supaya tidak menutup isi slaid. Wajah penuh hanya pada 17 saat pertama (salam dan kad nama).</span></li>
<li><span>Kad nama</span><span>Sekali sahaja di awal (6 saat), kiri bawah.</span></li>
<li><span>Rujukan</span><span>Halaman Rujukan dipaparkan 7 saat di hujung video.</span></li>
<li><span>Audio</span><span>Kelantangan diseragamkan ke tahap standard YouTube. Tiada muzik latar.</span></li>
<li><span>Peralihan</span><span>Potongan terus. Fade masuk di awal dan fade keluar di akhir sahaja.</span></li>
</ul></section>

<section><h2>Storyboard</h2><p style="margin-bottom:6px">Masa pada bingkai ialah masa dalam video selepas suntingan.</p>{sc}</section>

<section><h2>Slaid dalam video</h2><p style="margin-bottom:12px">Masa ialah masa dalam video akhir. Halaman pemisah bahagian (Bahagian 1–4) tidak digunakan, mengikut permintaan anda.</p><div class="sls">{open('slrows.html').read()}</div></section>

<section><h2>Bahagian yang dipotong</h2>
<p style="margin-bottom:12px">Masa di bawah ialah masa dalam video asal.</p>
<div class="tbl"><table><thead><tr><th>Dari</th><th>Hingga</th><th>Tempoh</th><th>Sebab</th></tr></thead><tbody>{ct}</tbody></table></div>
</section>

<section><h2>Perlu keputusan anda</h2>
<ul class="qs">
<li><b>1. Potongan SEMAK (17:41 asal)</b><span>Rakaman berbunyi seperti tersangkut lalu diulang. Saya cadang potong cubaan pertama. Jika sebenarnya tiada kesilapan, saya kekalkan.</span></li>
<li><b>2. Tempoh 21:43</b><span>Panduan tugasan menyasarkan 19:30–20:30. Saya boleh rapatkan semua jeda lebih 1 saat (jimat kira-kira 30 saat), tetapi ia masih melebihi 20:30. Memotong isi syarahan ialah keputusan anda, jadi saya tidak buat tanpa arahan.</span></li>
<li><b>3. Ejaan sarikata</b><span>Saya betulkan ejaan berdasarkan slaid anda (cth. IPNas, Furnivall, Allport, RIMUP, sosiogram). Satu perkataan kurang jelas dalam rakaman: "agar sekolah <i>menyediakan</i> ruang dialog yang selamat" (17:27 dalam video baharu). Sila semak senarai penuh di bawah.</span></li>
</ul></section>

<details><summary>Teks penuh sarikata (keypoint berwarna)</summary><ol>{subtxt}</ol></details>
</div>
'''
open('storyboard.html','w',encoding='utf8').write(page)
print(len(page)//1024,'KB')
