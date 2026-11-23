"""BICARA BAHASA - pembina garis masa suntingan.

Membaca transkripsi (work/t1.json, t2.json), sari kata disemak (edit/subs.txt), data bibir (work/lips_*.json)
dan konfigurasi grafik di bawah, lalu menjana:
  remotion/src/timeline.json   - garis masa untuk Remotion (bingkai, 30 fps)
  edit/pieces.json             - senarai keratan rakaman untuk base.mp4 (dipakai oleh render_base.py)
  edit/audio_cues.json         - isyarat audio untuk mix.py
  output/Bicara_Bahasa_Rojak_atau_Rancu.srt
"""
import json, os, re, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(ROOT, 'work')
FPS = 30
fr = lambda s: int(round(s * FPS))

# ------------------------------------------------------------------ sumber
T = {n: json.load(open(os.path.join(W, f't{n}.json'))) for n in (1, 2)}
LIPS = {n: json.load(open(os.path.join(W, f'lips_{n}.json'))) for n in (1, 2)}
DUR = {1: 782.85, 2: 96.75}
AUD = {}
for n in (1, 2):
    w = wave.open(os.path.join(W, f'a{n}.wav'))
    AUD[n] = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

SUBS = {}
for line in open(os.path.join(ROOT, 'edit', 'subs.txt'), encoding='utf8'):
    line = line.rstrip('\n')
    if not line or line.startswith('#'):
        continue
    c, i, spk, txt = line.split('|', 3)
    SUBS[(int(c), int(i))] = (spk, txt)

# ------------------------------------------------------------------ struktur (masa sumber, saat)
# Bahagian yang dipotong kerana kesilapan rakaman (Adam mengulang jawapan contoh 1)
CUTS = {1: [(311.0, 325.15)]}
SECTIONS = [
    # nama, klip, mula, tamat
    ('intro', 1, 0.0, 101.0),
    ('seg1', 1, 101.1, 282.2),
    ('seg2', 1, 282.4, 604.2),
    ('seg3', 1, 604.4, 782.85),
    ('close', 2, 0.0, 90.45),
]
CHAPTERS = {
    'seg1': ('01', 'APA ITU KERANCUAN BAHASA?', 'Segmen 1'),
    'seg2': ('02', 'CABARAN ROJAK BETULKAN', 'Segmen 2'),
    'seg3': ('03', 'MEDIA SOSIAL DAN PENULISAN MURID', 'Segmen 3'),
    'close': ('—', 'PENUTUP DAN RUMUSAN', 'Rumusan'),
}
CHAP_DUR = 3.2  # saat
AD_AFTER = 'seg1'  # iklan 10 s selepas Segmen 1 (≈ minit ke-5)
AD_DUR = 10.0
AD_SONG_FROM = 71.6  # korus "Lima minit lagi" dalam lagu Suno
OPEN_DUR = 11.0
OPEN_BG = (1, 478.9)  # rakaman lebar (reaksi ketawa) untuk latar pembukaan 8–11 s
OUTRO_SRC = (2, 90.45, 96.72)  # "Waalaikumussalam" + wide shot penutup
OUTRO_DUR = 15.0

MAXGAP = 0.75  # jeda lebih panjang daripada ini dipendekkan
KEEPGAP = 0.42  # panjang jeda selepas dipendekkan


def words_in(n, a, b):
    out = []
    for s in T[n]:
        for w in s['words']:
            if w['s'] >= a - 0.05 and w['e'] <= b + 0.3:
                out.append((w['s'], w['e']))
    return out


def rms_db(n, a, b):
    x = AUD[n][int(a * 16000):int(b * 16000)]
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) if len(x) else -120


SPEECH_DB = {n: np.median([rms_db(n, s['start'], s['end']) for s in T[n]]) for n in (1, 2)}


import subprocess
SIL = {}
for _n in (1, 2):
    _o = subprocess.run(['ffmpeg', '-nostats', '-i', os.path.join(W, f'a{_n}.wav'), '-af', 'silencedetect=n=-42dB:d=0.9', '-f', 'null', '-'],
                        capture_output=True, text=True).stderr
    _s = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', _o)]
    _e = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', _o)]
    SIL[_n] = list(zip(_s, _e))


def keep_ranges(n, A, B):
    """Julat dikekalkan dalam [A,B]: jeda senyap > 0.9 s dipendekkan kepada ~0.5 s, potongan dibuang."""
    keep = []
    cur = A
    for s0, s1 in SIL[n]:
        if s0 < A + 0.3 or s1 > B - 0.3:
            continue
        if s1 - s0 > 0.9:
            keep.append([cur, s0 + 0.28])
            cur = s1 - 0.22
    keep.append([cur, B])
    for c0, c1 in CUTS.get(n, []):
        nk = []
        for a, b in keep:
            if b <= c0 or a >= c1:
                nk.append([a, b])
            else:
                if a < c0:
                    nk.append([a, c0])
                if b > c1:
                    nk.append([c1, b])
        keep = nk
    return [(round(a, 3), round(b, 3)) for a, b in keep if b - a > 0.2]


# ------------------------------------------------------------------ binaan garis masa
pieces = []  # keratan base.mp4: {clip, a, n(frames)}
base_f = 0


def add_piece(clip, a, nfr, hold=0):
    global base_f
    pieces.append({'clip': clip, 'a': a, 'frames': nfr, 'hold': hold, 'base': base_f})
    base_f += nfr + hold
    return base_f - nfr - hold


blocks = []
out_f = fr(OPEN_DUR)
SEGMAP = []  # (clip, srcA, srcB, outF0) bagi pemetaan masa sumber -> bingkai output
section_out = {}
audio_cues = {'dialogue': [], 'music': [], 'sfx': [], 'song': None}

for name, clip, A, B in SECTIONS:
    if name in CHAPTERS:
        n, title, eyebrow = CHAPTERS[name]
        blocks.append({'type': 'chapter', 'from': out_f, 'dur': fr(CHAP_DUR), 'n': n, 'title': title, 'eyebrow': eyebrow, 'base': None, '_sec': name})
        out_f += fr(CHAP_DUR)
    ks = keep_ranges(clip, A, B)
    sec_start = out_f
    blk = {'type': 'dialogue', 'from': out_f, 'dur': 0, 'base': base_f, 'sec': name}
    for a, b in ks:
        nfr = fr(b - a)
        bf = add_piece(clip, a, nfr)
        SEGMAP.append((clip, a, a + nfr / FPS, out_f))
        audio_cues['dialogue'].append({'clip': clip, 'a': a, 'frames': nfr, 'out': out_f})
        out_f += nfr
    blk['dur'] = out_f - blk['from']
    blocks.append(blk)
    section_out[name] = (sec_start, out_f)
    if name == AD_AFTER:
        blocks.append({'type': 'ad', 'from': out_f, 'dur': fr(AD_DUR)})
        audio_cues['song'] = {'out': out_f, 'frames': fr(AD_DUR), 'songFrom': AD_SONG_FROM}
        out_f += fr(AD_DUR)

# latar kad segmen = rakaman awal bahagian berikutnya (dikaburkan)
for b in blocks:
    if b['type'] == 'chapter':
        nxt = next(x for x in blocks if x['type'] == 'dialogue' and x['sec'] == b['_sec'])
        b['base'] = nxt['base']

# outro: rakaman wide terakhir + bingkai akhir dibekukan
oc, oa, ob = OUTRO_SRC
on = fr(ob - oa)
hold = fr(OUTRO_DUR) - on
ob_base = add_piece(oc, oa, on, hold=max(0, hold))
blocks.append({'type': 'outro', 'from': out_f, 'dur': fr(OUTRO_DUR), 'base': ob_base})
audio_cues['dialogue'].append({'clip': oc, 'a': oa, 'frames': on, 'out': out_f, 'fadeout': 1.0})
outro_from = out_f
out_f += fr(OUTRO_DUR)
TOTAL = out_f

# latar pembukaan
open_base = add_piece(OPEN_BG[0], OPEN_BG[1], fr(3.9))


def src2out(clip, t, snap='near'):
    """Masa sumber -> bingkai output (None jika dalam bahagian dipotong)."""
    best = None
    for c, a, b, o in SEGMAP:
        if c != clip:
            continue
        if a - 1e-3 <= t <= b + 1e-3:
            return o + fr(t - a)
        d = a - t if t < a else t - b
        if best is None or d < best[0]:
            best = (d, o if t < a else o + fr(b - a))
    return None if snap is None else best[1]


# ------------------------------------------------------------------ sari kata
def word_list(c, i):
    return [(w['s'], w['e'], w['w']) for w in T[c][i]['words']]


subs = []
seg_spk = []  # (outA, outB, spk) bagi syot
for (c, i), (spk, txt) in sorted(SUBS.items()):
    if txt == '-':
        continue
    ws = word_list(c, i)
    s0 = ws[0][0] if ws else T[c][i]['start']
    s1 = T[c][i]['end']
    chunks = [x.strip() for x in txt.split(' / ') if x.strip()]
    plain = [re.sub(r'\*', '', x) for x in chunks]
    tot = sum(len(p) for p in plain)
    # sempadan ikut kedudukan perkataan (anggaran perkadaran aksara -> masa perkataan)
    acc = 0
    bounds = [s0]
    for p in plain[:-1]:
        acc += len(p)
        frac = acc / tot
        k = min(len(ws) - 1, max(0, int(round(frac * len(ws))))) if ws else 0
        bounds.append(ws[k][0] if ws else s0 + frac * (s1 - s0))
    bounds.append(s1)
    for k, ch in enumerate(chunks):
        a, b = bounds[k], bounds[k + 1]
        oa, ob = src2out(c, a, None), src2out(c, b - 0.01, None)
        if oa is None and ob is None:
            continue
        if oa is None:
            oa = src2out(c, a)
        if ob is None:
            ob = src2out(c, b)
        if ob - oa < 12:
            ob = oa + 12
        subs.append({'from': oa, 'to': ob, 'text': ch, 'seat': spk})
    oa, ob = src2out(c, s0), src2out(c, s1)
    seg_spk.append((oa, ob, spk, c, s0, s1))

subs.sort(key=lambda x: x['from'])
for k in range(len(subs) - 1):
    nx = subs[k + 1]['from']
    if subs[k]['to'] > nx:
        subs[k]['to'] = nx
    elif nx - subs[k]['to'] < 10:
        subs[k]['to'] = nx
# sari kata tidak dipaparkan semasa pembukaan/kad/iklan/outro grafik
def in_insert(f):
    return any(b['type'] in ('chapter', 'ad') and b['from'] <= f < b['from'] + b['dur'] for b in blocks)
subs = [s for s in subs if not in_insert(s['from'])]

# ------------------------------------------------------------------ wajah (purata posisi setiap penutur)
SEAT_DEFAULT = {'L': (680, 500), 'C': (1075, 480), 'R': (1590, 440)}


def face_at(clip, seat, a, b):
    L = LIPS[clip]
    rows = L['rows'][int(a * L['fps']):int(b * L['fps']) + 1]
    xs = [r[seat]['cx'] for r in rows if seat in r]
    ys = [r[seat]['cy'] for r in rows if seat in r]
    if len(xs) < 3:
        return SEAT_DEFAULT[seat]
    return float(np.median(xs)), float(np.median(ys))


# ------------------------------------------------------------------ syot kamera (multicam digital)
# Penekanan (close-up + zoom licin) untuk hujah penting / istilah sintaksis / rumusan
EMPH = {(1, 18), (1, 23), (1, 28), (1, 30), (1, 34), (1, 51), (1, 57), (1, 68), (1, 83), (1, 89), (1, 92), (1, 96), (1, 99), (1, 105),
        (1, 115), (1, 128), (1, 138), (1, 142), (2, 1), (2, 3), (2, 4), (2, 6), (2, 10)}
# Syot lebar: permulaan perbualan, pertukaran topik, reaksi semua ahli, penutup
WIDE = {(1, 0), (1, 1), (1, 9), (1, 41), (1, 42), (1, 75), (1, 103), (1, 106), (1, 107), (1, 108), (1, 119), (1, 129), (1, 130), (1, 131), (2, 0), (2, 11),
        (2, 15), (2, 16), (1, 13), (1, 60), (1, 93), (1, 124)}

seg_meta = []
for (c, i), (spk, txt) in sorted(SUBS.items()):
    if txt == '-':
        continue
    s0 = T[c][i]['words'][0]['s'] if T[c][i]['words'] else T[c][i]['start']
    s1 = T[c][i]['end']
    seg_meta.append({'c': c, 'i': i, 'spk': spk, 's0': s0, 's1': s1, 'o0': src2out(c, s0), 'o1': src2out(c, s1)})

shots = []


def push_shot(f, kind, seat, c=None, a=None, b=None, push=0):
    if shots and shots[-1]['from'] == f:
        shots.pop()
    sh = {'from': f, 'kind': kind, 'seat': seat}
    if seat and c is not None:
        sh['fx'], sh['fy'] = face_at(c, seat, a, b)
    if push:
        sh['push'] = push
    shots.append(sh)


edit_points = sorted({o for c, a_, b_, o in SEGMAP} - {blk['from'] for blk in blocks if blk['type'] == 'dialogue'})
section_starts = sorted(blk['from'] for blk in blocks if blk['type'] == 'dialogue')
ALT = {'medium': 'close', 'close': 'medium', 'wide': 'medium'}

# 1) giliran (turn) penutur
turns = []
for m in seg_meta:
    if turns and turns[-1]['spk'] == m['spk'] and m['o0'] - turns[-1]['o1'] < 45:
        turns[-1]['segs'].append(m)
        turns[-1]['o1'] = m['o1']
    else:
        turns.append({'spk': m['spk'], 'o0': m['o0'], 'o1': m['o1'], 'segs': [m]})

for t in turns:
    seat = t['spk'] if t['spk'] in 'LCR' else None
    f0 = max(0, t['o0'] - 4)
    dur = t['o1'] - t['o0']
    m0 = t['segs'][0]
    key0 = (m0['c'], m0['i'])
    at_sec = any(0 <= f0 - s < 60 for s in section_starts)
    if seat is None or key0 in WIDE or at_sec or dur < 55:
        push_shot(f0, 'wide', None)
        cur = ('wide', None)
    else:
        k = 'close' if key0 in EMPH else 'medium'
        push_shot(f0, k, seat, m0['c'], m0['s0'], m0['s1'])
        cur = (k, seat)
    last_f = f0
    # dalam giliran: penekanan (zoom licin) & variasi
    for m in t['segs'][1:]:
        key = (m['c'], m['i'])
        f = m['o0'] - 3
        if seat is None:
            continue
        if key in WIDE and f - last_f > 75:
            push_shot(f, 'wide', None)
            cur = ('wide', None)
            last_f = f
        elif key in EMPH and cur != ('close', seat) and f - last_f > 90:
            push_shot(f, 'close', seat, m['c'], m['s0'], m['s1'], push=0 if any(abs(f - e) <= 6 for e in edit_points) else 26)
            cur = ('close', seat)
            last_f = f
        elif f - last_f > 300:
            nk = ALT[cur[0]]
            push_shot(f, nk, seat, m['c'], m['s0'], m['s1'])
            cur = (nk, seat)
            last_f = f

shots.sort(key=lambda s: s['from'])
ded = []
for s in shots:
    if ded and ded[-1]['from'] == s['from']:
        ded[-1] = s
    elif ded and ded[-1]['kind'] == s['kind'] and ded[-1]['seat'] == s['seat']:
        continue
    else:
        ded.append(s)
shots = ded


def durs():
    for k, s in enumerate(shots):
        s['dur'] = (shots[k + 1]['from'] if k + 1 < len(shots) else TOTAL) - s['from']


# 2) buang syot terlalu pendek (< 2 s)
changed = True
while changed:
    changed = False
    durs()
    for k in range(1, len(shots)):
        if shots[k]['dur'] < 60 and k + 1 < len(shots):
            del shots[k]
            changed = True
            break
    # gabung yang sama selepas pembuangan
    for k in range(1, len(shots)):
        if shots[k]['kind'] == shots[k - 1]['kind'] and shots[k]['seat'] == shots[k - 1]['seat']:
            del shots[k]
            changed = True
            break


# 3) setiap titik suntingan (jeda dipendekkan) mesti bertukar sudut -> sorok jump cut
def speaker_at(f):
    m = next((m for m in seg_meta if m['o0'] - 4 <= f <= m['o1'] + 6 and m['spk'] in 'LCR'), None)
    if m is None:
        m = next((m for m in seg_meta if m['o0'] >= f and m['spk'] in 'LCR'), None)
    return m


for e in edit_points:
    near = [s for s in shots if s['from'] > 0 and abs(e - s['from']) <= 36]
    if near:
        s = min(near, key=lambda x: abs(e - x['from']))
        s['from'] = e
        s.pop('push', None)
        shots.sort(key=lambda x: x['from'])
        continue
    prev = [s for s in shots if s['from'] < e][-1]
    m = speaker_at(e)
    if prev['kind'] == 'wide':
        if m:
            nk, seat = 'medium', m['spk']
        else:
            nk, seat = 'medium', 'C'
    else:
        nk = 'wide' if prev['kind'] == 'close' else 'close'
        seat = None if nk == 'wide' else prev['seat']
    sh = {'from': e, 'kind': nk, 'seat': seat}
    if seat and m:
        sh['fx'], sh['fy'] = face_at(m['c'], seat, m['s0'], m['s1'])
    elif seat:
        sh['fx'], sh['fy'] = prev.get('fx', SEAT_DEFAULT[seat][0]), prev.get('fy', SEAT_DEFAULT[seat][1])
    shots.append(sh)
    shots.sort(key=lambda s: s['from'])

# syot lebar untuk blok sisipan & outro
for b in blocks:
    if b['type'] in ('chapter', 'ad', 'outro'):
        shots.append({'from': b['from'], 'kind': 'wide', 'seat': None})
shots.append({'from': 0, 'kind': 'wide', 'seat': None})
shots.sort(key=lambda s: s['from'])
ded = []
for s in shots:
    if ded and ded[-1]['from'] == s['from']:
        ded[-1] = s
    else:
        ded.append(s)
shots = ded
durs()
EP = set(edit_points)
changed = True
while changed:
    changed = False
    for k in range(1, len(shots) - 1):
        if shots[k]['dur'] < 40:
            # buang syot pendek; jika ia di titik suntingan, pindahkan syot seterusnya ke situ
            if shots[k]['from'] in EP and shots[k + 1]['from'] not in EP:
                shots[k + 1]['from'] = shots[k]['from']
            del shots[k]
            durs()
            changed = True
            break

# ------------------------------------------------------------------ grafik (masa sumber -> output)
def O(c, t):
    return src2out(c, t)


gfx = []


def G(kind, c, t0, t1, data=None, sfx='pop'):
    a, b = O(c, t0), O(c, t1)
    gfx.append({'from': a, 'dur': max(30, b - a), 'kind': kind, 'data': data or {}})
    if sfx:
        audio_cues['sfx'].append({'at': a, 'name': sfx})


def rel(c, t0, t):
    return O(c, t) - O(c, t0)


# --- Pengenalan
G('rojak', 1, 28.4, 33.6, {'pos': 'TL'})
G('sintaksis', 1, 41.0, 45.6, {'pos': 'TR'}, sfx='click')
G('kerancuan', 1, 53.2, 57.2, {'pos': 'TL'})
G('medsos', 1, 63.4, 67.2, {'pos': 'TL'})
# --- Segmen 1
G('kerancuan', 1, 103.8, 108.0, {'pos': 'TL'})
G('definition', 1, 108.0, 125.2, {'layout': 'splitL', 'lines': [
    'Penggunaan bahasa yang *bercampur aduk* atau *tidak mematuhi sistem bahasa*',
    'sehingga menjejaskan *ketepatan*, *kejelasan* dan *kesesuaian* penyampaian.'], 'step': rel(1, 108.0, 118.4) - 30}, sfx='swipe')
G('compare', 1, 170.0, 212.6, {'layout': 'splitL', 'items': [
    {'title': 'BAHASA ROJAK', 'body': 'Pencampuran dua bahasa atau lebih dalam satu ujaran.', 'ex': 'Nanti kita *meeting* selepas kelas.', 'at': rel(1, 170.0, 179.4)},
    {'title': 'BAHASA PASAR', 'body': 'Ragam bahasa tidak formal yang digunakan dalam situasi komunikasi tertentu.', 'at': rel(1, 170.0, 191.7)},
]}, sfx='swipe')
G('baku', 1, 229.0, 234.5, {'pos': 'TR'}, sfx='click')
# --- Segmen 2: lima contoh
EX = [
    (303.4, 306.5, 330.8, 364.8, "Boleh tak *you* *submit* *assignment* tu *before deadline*?",
     "*Bolehkah* *awak* *menghantar* *tugasan* itu *sebelum tarikh akhir*?", 'Bina semula ayat — bukan terjemah *satu perkataan*.', 357.5),
    (377.8, 378.6, 390.7, 416.2, "Dia *adalah* seorang pelajar yang rajin.",
     "Dia *ialah* seorang pelajar yang rajin.", '*ialah* digunakan di hadapan *frasa nama*.', 397.4),
    (433.1, 434.7, 439.7, 467.0, "*Banyak* *pelajar-pelajar* datang ke majlis itu.",
     "*Ramai* *pelajar* datang ke majlis itu.", 'Kata bilangan + kata ganda = bentuk *lewah*.', 461.4),
    (482.9, 482.9, 488.6, 515.6, "Kerja rumah itu telah *dibuat oleh saya*.",
     "Kerja rumah itu telah *saya buat*.", 'Ayat pasif diri pertama/kedua: *pelaku + kata kerja dasar*.', 495.1),
    (534.4, 534.4, 543.7, 571.8, "*Meeting* itu kena *postpone* sebab ada *urgent matter*.",
     "*Mesyuarat* itu *terpaksa ditangguhkan* kerana terdapat *perkara yang mendesak*.", 'Pilih bentuk yang teratur untuk *urusan rasmi*.', 563.9),
]
for k, (t0, ta, tfix, t1, asal, baku, note, tnote) in enumerate(EX):
    G('example', 1, t0, t1, {'layout': 'splitL', 'i': k + 1, 'n': 5, 'asal': asal, 'baku': baku, 'fixAt': rel(1, t0, tfix), 'note': note, 'noteAt': rel(1, t0, tnote)}, sfx='swipe')
    audio_cues['sfx'].append({'at': O(1, tfix), 'name': 'shimmer'})
G('chips', 1, 576.0, 592.4, {'layout': 'splitL', 'title': 'Jenis isu dikenal pasti', 'items': [
    ['Pemilihan kata', rel(1, 576.0, 577.6)], ['Kata pemeri', rel(1, 576.0, 579.4)], ['Unsur lewah', rel(1, 576.0, 581.2)], ['Binaan ayat pasif', rel(1, 576.0, 582.4)]]}, sfx='swipe')
# --- Segmen 3
G('flow', 1, 604.8, 612.6, {'layout': 'splitL', 'steps': [
    {'t': 'PERBUALAN HARIAN', 'ic': 'talk', 'at': 8}, {'t': 'MEDIA SOSIAL', 'ic': 'phone', 'at': 40}, {'t': 'PENULISAN MURID', 'ic': 'pen', 'at': 72}]}, sfx='swipe')
G('illus', 1, 612.6, 653.4, {'layout': 'splitL', 'label': 'Karangan murid', 'asal': 'Pada hari cuti, saya pergi *shopping* dengan *keluarga saya* dan kami makan *kat* restoran.',
                             'baku': 'Pada hari cuti, saya pergi *membeli-belah* bersama *keluarga* dan kami makan *di* restoran.', 'fixAt': rel(1, 612.6, 635.0)}, sfx='swipe')
audio_cues['sfx'].append({'at': O(1, 635.0), 'name': 'shimmer'})
G('flow', 1, 653.7, 661.6, {'layout': 'splitL', 'steps': [
    {'t': 'PERBUALAN HARIAN', 'ic': 'talk', 'at': 4}, {'t': 'MEDIA SOSIAL', 'ic': 'phone', 'at': 22}, {'t': 'PENULISAN MURID', 'ic': 'pen', 'at': 40}]}, sfx='swipe')
G('medsos', 1, 683.6, 689.0, {'pos': 'TL'})
G('illus', 1, 745.6, 762.4, {'layout': 'splitL', 'label': 'Terjemahan langsung', 'asal': 'Mengambil tindakan *ke atas* pelajar.',
                             'baku': 'Mengambil tindakan *terhadap* pelajar.', 'fixAt': rel(1, 745.6, 750.5)}, sfx='swipe')
audio_cues['sfx'].append({'at': O(1, 750.5), 'name': 'shimmer'})
# --- Penutup
G('points', 2, 0.3, 35.4, {'layout': 'splitL', 'title': 'Tiga rumusan', 'items': [
    ['Kerancuan bahasa bukan sekadar *percampuran perkataan* — turut melibatkan pengaruh bahasa asing terhadap *struktur ayat*.', rel(2, 0.3, 5.7)],
    ['Bahasa rojak dan ragam tidak formal dinilai berdasarkan *konteks*, *tujuan* dan *kesesuaian*.', rel(2, 0.3, 15.4)],
    ['Guru membimbing murid menguasai *bahasa baku* tanpa merendahkan variasi bahasa harian.', rel(2, 0.3, 22.8)]]}, sfx='swipe')
G('sintaksis', 2, 36.0, 42.0, {'pos': 'TR'}, sfx='click')
G('rojak', 2, 55.7, 60.5, {'pos': 'TL'})

# lower thirds ketika diperkenalkan
LT = [('R', 'NAIM', 'HOST / MODERATOR', 1, 17.8), ('C', 'FADLI', 'PANEL 1', 1, 22.8), ('L', 'ADAM', 'PANEL 2', 1, 36.1)]
lower = []
for seat, name, role, c, t in LT:
    a = O(c, t)
    lower.append({'from': a, 'dur': 135, 'seat': seat, 'name': name, 'role': role})
    audio_cues['sfx'].append({'at': a, 'name': 'swipe'})
    audio_cues['sfx'].append({'at': a + 9, 'name': 'pop'})

# shot lebar semasa pengenalan nama supaya lower third berada di bawah penutur yang betul
for lt in lower:
    inside = [x for x in shots if lt['from'] - 40 <= x['from'] < lt['from'] + lt['dur']]
    after = inside[-1] if inside else None
    shots = [x for x in shots if x not in inside]
    shots.append({'from': lt['from'] - 2, 'kind': 'wide', 'seat': None})
    if after and after['kind'] != 'wide':
        a2 = dict(after); a2['from'] = lt['from'] + lt['dur']; a2.pop('push', None)
        shots.append(a2)
shots.sort(key=lambda s: s['from'])
ded = []
for x in shots:
    if ded and ded[-1]['kind'] == x['kind'] and ded[-1]['seat'] == x['seat']:
        continue
    ded.append(x)
shots = ded
durs()

# semasa split screen, kamera pada penutur (tiada wide) - kekal; semasa grafik word art tiada perubahan

# SFX blok
for b in blocks:
    if b['type'] == 'chapter':
        audio_cues['sfx'] += [{'at': b['from'] - 8, 'name': 'whoosh_soft'}, {'at': b['from'] + 12, 'name': 'impact_cinematic', 'gain': 0.5},
                              {'at': b['from'] + 22, 'name': 'click'}, {'at': b['from'] + b['dur'] - 16, 'name': 'whoosh_out'}]
    if b['type'] == 'ad':
        audio_cues['sfx'] += [{'at': b['from'] - 6, 'name': 'ad_sting'}, {'at': b['from'] + b['dur'] - 14, 'name': 'whoosh_out'}]
audio_cues['outro'] = {'from': outro_from}
audio_cues['total'] = TOTAL
audio_cues['chapters'] = [{'from': b['from'], 'dur': b['dur']} for b in blocks if b['type'] == 'chapter']
audio_cues['ad'] = [{'from': b['from'], 'dur': b['dur']} for b in blocks if b['type'] == 'ad']

# ------------------------------------------------------------------ tulis
faces = {k: {'x': v[0], 'y': v[1]} for k, v in SEAT_DEFAULT.items()}
TLJ = {
    'fps': FPS, 'total': TOTAL,
    'opening': {'dur': fr(OPEN_DUR), 'bgFrom': open_base},
    'ad': {'songFrom': fr(AD_SONG_FROM)},
    'blocks': [{k: v for k, v in b.items() if not k.startswith('_')} for b in blocks],
    'shots': shots, 'subs': subs, 'lowerThirds': lower, 'gfx': sorted(gfx, key=lambda g: g['from']), 'faces': faces,
}
json.dump(TLJ, open(os.path.join(ROOT, 'remotion', 'src', 'timeline.json'), 'w'), ensure_ascii=False)
json.dump({'pieces': pieces, 'total_frames': base_f}, open(os.path.join(ROOT, 'edit', 'pieces.json'), 'w'), indent=1)
json.dump(audio_cues, open(os.path.join(ROOT, 'edit', 'audio_cues.json'), 'w'), indent=1)


def srt_t(f):
    s = f / FPS
    return f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round((s % 1) * 1000)) % 1000:03d}"


os.makedirs(os.path.join(ROOT, 'output'), exist_ok=True)
with open(os.path.join(ROOT, 'output', 'Bicara_Bahasa_Rojak_atau_Rancu.srt'), 'w', encoding='utf8') as fh:
    for k, s in enumerate(subs):
        fh.write(f"{k + 1}\n{srt_t(s['from'])} --> {srt_t(s['to'])}\n{s['text'].replace('*', '')}\n\n")

secs = {k: (v[0] / FPS, v[1] / FPS) for k, v in section_out.items()}
print(f"Jumlah: {TOTAL / FPS / 60:.2f} min | keratan: {len(pieces)} | syot: {len(shots)} | sari kata: {len(subs)} | grafik: {len(gfx)}")
for k, (a, b) in secs.items():
    print(f"  {k:6s} {int(a // 60)}:{a % 60:04.1f} – {int(b // 60)}:{b % 60:04.1f}")
for b in blocks:
    if b['type'] in ('ad', 'outro', 'chapter'):
        print(f"  {b['type']:8s} @ {int(b['from'] / FPS // 60)}:{b['from'] / FPS % 60:04.1f}")
