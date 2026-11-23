"""Audio PROMO 40 s (gaya blok voxel): muzik chiptune 8-bit ASAL 30 s (120 BPM) + SFX blok + iklan lagu "Lima Mit Lagi" 10 s.
    python3 audio/promo_music.py  ->  output/promo/promo_audio.wav
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BPM = 120
BT = 60 / BPM  # 0.5 s
FR = 1 / 30
TOTAL = 40.0
N = int(TOTAL * SR)
rng = np.random.default_rng(3)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def lp(x, f):
    return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)


def hp(x, f):
    return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)


def square(f, d, duty=0.5, vol=1.0, decay=None):
    t = tt(d)
    ph = (f * t) % 1
    s = np.where(ph < duty, 1.0, -1.0)
    env = np.ones_like(t)
    a = int(0.003 * SR)
    env[:a] = np.linspace(0, 1, a)
    if decay:
        env *= np.exp(-t / decay)
    r = int(0.01 * SR)
    env[-r:] *= np.linspace(1, 0, r)
    return s * env * vol


def tri(f, d, vol=1.0):
    t = tt(d)
    ph = (f * t) % 1
    s = 4 * np.abs(ph - 0.5) - 1
    r = int(0.01 * SR)
    s[-r:] *= np.linspace(1, 0, r)
    return s * vol


def noise(d, decay, vol=1.0, hpf=None):
    x = rng.uniform(-1, 1, int(d * SR))
    # gaya 8-bit: tahan sampel (sample-and-hold)
    x = np.repeat(x[::4], 4)[: int(d * SR)]
    if hpf:
        x = hp(x, hpf)
    return x * np.exp(-tt(d) / decay) * vol


def kick(vol=1.0):
    t = tt(0.25)
    f = 50 + 140 * np.exp(-t / 0.03)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5
    return s * np.exp(-t / 0.09) * vol


mus = np.zeros(N)
sfx = np.zeros(N)


def put(buf, x, at, g=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * g


# ------------------------------------------------------------------ muzik 30 s
# progresi (1 bar = 4 rentak = 2 s): Am F C G
CH = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
BASS = [45, 41, 36, 43]
# melodi utama (8 not 1/8 per bar), 2 bar berulang dengan variasi
MEL = [
    [69, 72, 76, 74, 72, 69, 72, 74],
    [72, 69, 65, 69, 72, 74, 72, 69],
    [67, 72, 76, 79, 76, 72, 74, 76],
    [74, 71, 67, 71, 74, 79, 78, 79],
]
MEL2 = [
    [76, 76, 74, 72, 74, 76, 79, 76],
    [77, 76, 72, 69, 72, 74, 76, 77],
    [79, 76, 72, 76, 79, 84, 81, 79],
    [78, 79, 81, 79, 74, 71, 74, 79],
]
for bar in range(15):
    t0 = bar * 4 * BT
    k = bar % 4
    intro = bar < 2
    # arpeggio 1/16
    for s in range(16):
        n = CH[k][s % 3] + 12 + (12 if s % 6 == 5 else 0)
        put(mus, square(mtof(n), BT / 4 * 0.9, 0.25, 0.10, decay=0.08), t0 + s * BT / 4)
    if intro:
        continue
    # bes segitiga 1/8 (oktaf berselang)
    for e in range(8):
        n = BASS[k] + (12 if e % 2 else 0)
        put(mus, tri(mtof(n), BT / 2 * 0.95, 0.42), t0 + e * BT / 2)
    # melodi
    mel = MEL2[k] if (bar >= 9 and bar < 13) else MEL[k]
    if bar >= 2:
        for e, n in enumerate(mel):
            put(mus, square(mtof(n), BT / 2 * 0.85, 0.5, 0.13, decay=0.35), t0 + e * BT / 2)
            put(mus, square(mtof(n) * 1.005, BT / 2 * 0.85, 0.125, 0.05, decay=0.35), t0 + e * BT / 2 + 0.06)  # gema
    # dram
    for b in range(4):
        put(mus, kick(0.75), t0 + b * BT)
        if b % 2:
            put(mus, noise(0.18, 0.06, 0.45, 1200), t0 + b * BT)
        for h in range(4):
            put(mus, noise(0.05, 0.012, 0.16 if h % 2 else 0.1, 6000), t0 + b * BT + h * BT / 4)
# intro: riser + kick membina (bar 0-1)
put(mus, hp(rng.uniform(-1, 1, int(4 * SR)), 3000) * np.linspace(0, 0.25, int(4 * SR)), 0)
for b in range(8):
    put(mus, kick(0.4 + 0.07 * b), b * BT)
# crash pada pertukaran babak (rentak 8, 18, 28, 44, 54)
for beat in (8, 18, 28, 44, 54):
    put(mus, noise(1.2, 0.45, 0.35, 3000), beat * BT)
    put(mus, kick(0.9), beat * BT)
# pengakhiran pada 30 s: kord besar + hentakan
end = 30.0
for n in (57, 64, 69, 72, 76):
    put(mus, square(mtof(n), 1.6, 0.5, 0.09, decay=0.6), end - 0.02)
put(mus, kick(1.0), end)
put(mus, noise(1.4, 0.5, 0.4, 2500), end)
mus[int(31.6 * SR):] = 0
mus = lp(mus, 9000)

# ------------------------------------------------------------------ SFX blok
def pop():
    t = tt(0.09)
    f = 600 + 900 * t / 0.09
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.04) * 0.5


def brk():
    n = noise(0.22, 0.06, 0.8, 300)
    t = tt(0.22)[: len(n)]
    return n + np.sign(np.sin(2 * np.pi * 110 * t)) * np.exp(-t / 0.05) * 0.3


def coin():
    a = square(mtof(83), 0.08, 0.5, 0.45)
    b = square(mtof(88), 0.3, 0.5, 0.45, decay=0.12)
    return np.concatenate([a, b])


def whoosh():
    d = 0.45
    x = rng.uniform(-1, 1, int(d * SR))
    out = np.zeros_like(x)
    nb = 30
    for i in range(nb):
        a, b = i * len(x) // nb, (i + 1) * len(x) // nb
        fc = 400 * (12 ** (i / nb))
        out[a:b] = sosfilt(butter(2, [fc * 0.6, min(fc * 1.6, 20000)], 'band', fs=SR, output='sos'), x[max(0, a - 2000):b])[-(b - a):]
    return out * np.sin(np.pi * np.arange(len(x)) / len(x)) ** 2 * 0.9


def boom():
    n = noise(0.8, 0.25, 0.6, 200)
    k = kick(1.0) * 1.2
    n[: len(k)] += k
    return n


F = lambda fr: fr * FR
# tajuk: huruf mendarat
k = 0
for ri in range(2):
    for i in range(6):
        put(sfx, pop(), F(4 + (ri * 6 + i) * 3 + 9), 0.5)
put(sfx, boom(), F(64), 0.9)
for c in (120, 270, 420, 660, 810, 900):
    put(sfx, whoosh(), F(c - 12), 0.5)
# beranda
for i in range(3):
    put(sfx, pop(), F(120 + 10 + i * 8 + 6), 0.6)
put(sfx, pop(), F(120 + 40), 0.6)
# kerancuan
for ci in range(2):
    for i in range(3):
        put(sfx, pop(), F(270 + 14 + i * 6 + ci * 3 + 8), 0.45)
put(sfx, whoosh(), F(270 + 62), 0.5)
put(sfx, brk(), F(270 + 90), 0.8)
put(sfx, boom(), F(270 + 92), 0.6)
put(sfx, pop(), F(270 + 104), 0.5)
# rojak betulkan: blok jatuh ikut kata Fadli, tukul ikut kata Adam
for d in (8, 38, 55, 70, 103):
    put(sfx, pop(), F(420 + d + 8), 0.4)
for h in (142, 150, 160, 180, 211):
    put(sfx, brk(), F(420 + h), 0.6)
put(sfx, coin(), F(420 + 228), 0.6)
# media sosial
for i in range(3):
    put(sfx, pop(), F(660 + 18 + i * 14 + 4), 0.45)
    put(sfx, whoosh(), F(660 + 60 + i * 8), 0.3)
    put(sfx, pop(), F(660 + 92 + i * 12 + 4), 0.45)
    put(sfx, coin(), F(660 + 92 + i * 12 + 14), 0.45)
# penutup
for i in range(3):
    put(sfx, pop(), F(810 + 22 + i * 6 + 4), 0.5)
# iklan
put(sfx, coin(), F(904), 0.6)

# ------------------------------------------------------------------ suara sebenar perbualan
# (klip, mula sumber, tamat sumber, masa promo)
VOX = [
    (1, 2.92, 5.15, 0.0),  # Naim: Selamat datang ke Bicara Bahasa.
    (1, 52.52, 54.35, 2.17),  # Naim: rojak atau rancu
    (1, 17.70, 20.95, 4.60),  # Naim: Saya Naim. Bersama saya, Fadli dan Adam.
    (1, 104.40, 107.62, 9.20),  # Naim: Apa sebenarnya ... kerancuan bahasa?
    (1, 113.40, 114.60, 12.45),  # Adam: bercampur aduk
    (1, 306.45, 310.80, 14.30),  # Fadli: Boleh tak you submit assignment tu before deadline?
    (1, 330.70, 334.30, 18.70),  # Adam: Bolehkah awak menghantar tugasan itu sebelum tarikh akhir?
    (1, 717.38, 720.70, 22.60),  # Fadli: Aku pernah juga hampir tulis BTW
    (1, 720.82, 721.36, 25.95),  # By the way.
    (2, 55.62, 58.50, 27.00),  # Fadli: Roti canai boleh rojak dengan kuah.
]
VOICE = {}
for n in (1, 2):
    w = wave.open(os.path.join(ROOT, 'work', f'voice{n}.wav'))
    VOICE[n] = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.zeros(N)
for n, a, b, at in VOX:
    x = VOICE[n][int(a * SR): int(b * SR)].copy()
    f1 = int(0.015 * SR)
    f2 = int(0.06 * SR)
    x[:f1] *= np.linspace(0, 1, f1)
    x[-f2:] *= np.linspace(1, 0, f2)
    put(voice, x, at)
act = voice != 0
# sampul ducking (perlahankan muzik & SFX ketika bercakap)
env = np.abs(voice)
k = int(0.12 * SR)
c = np.cumsum(np.concatenate([[0], env]))
idx = np.arange(N)
sm = (c[np.minimum(idx + k, N)] - c[np.maximum(idx - k, 0)]) / (2 * k)
speak = np.clip(sm / (np.percentile(sm[sm > 0], 60) + 1e-9), 0, 1)
k2 = int(0.25 * SR)
c2 = np.cumsum(np.concatenate([[0], speak]))
speak = (c2[np.minimum(idx + k2, N)] - c2[np.maximum(idx - k2, 0)]) / (2 * k2)
duck = 1 - 0.62 * np.clip(speak * 1.6, 0, 1)

# ------------------------------------------------------------------ lagu iklan (30-40 s)
w = wave.open(os.path.join(ROOT, 'music', 'suno.wav'))
song = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768
s0 = int(71.6 * SR)
seg = song[s0: s0 + 10 * SR].copy()
fi, fo = int(0.15 * SR), int(0.9 * SR)
seg[:fi] *= np.linspace(0, 1, fi)[:, None]
seg[-fo:] *= np.linspace(1, 0, fo)[:, None]


def rms(x):
    return np.sqrt(np.mean(x ** 2))


mix = np.zeros((N, 2), np.float32)
m = mus / (rms(mus[: 30 * SR]) + 1e-9) * 0.16
x = sfx / (np.max(np.abs(sfx)) + 1e-9) * 0.55
vrms = np.sqrt(np.mean(voice[act] ** 2)) if act.any() else 1
v = voice / (vrms + 1e-9) * 0.20
bed = m * duck + x * (1 - 0.35 * (1 - duck)) + v
mix += np.stack([bed, bed], 1)
seg = seg / (rms(seg) + 1e-9) * 0.17
put_at = 30 * SR
mix[put_at: put_at + len(seg)] += seg[: N - put_at]
mix = np.tanh(mix * 1.2) / 1.2
out_dir = os.path.join(ROOT, 'output', 'promo')
os.makedirs(out_dir, exist_ok=True)
raw = os.path.join(ROOT, 'work', 'promo_raw.wav')
with wave.open(raw, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
# simpan muzik chiptune sahaja sebagai aset
with wave.open(os.path.join(ROOT, 'audio', 'music', 'promo_chiptune_30s.wav'), 'wb') as wf:
    mm = np.clip(m[: 31 * SR] * 1.5, -1, 1)
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes((mm * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', '48000', '-c:a', 'pcm_s16le',
                os.path.join(out_dir, 'promo_audio.wav')], check=True)
print('ok')
