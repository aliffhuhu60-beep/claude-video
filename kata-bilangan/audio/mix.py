"""Campuran audio akhir (30.000 s, 48 kHz stereo):
suara latar (edge-tts) + muzik latar sintesis (tiada bahan berhak cipta) + kesan bunyi
diselaraskan dengan peristiwa visual (build/sfx.json yang dieksport oleh main.js)."""
import json, subprocess, wave
import numpy as np

SR, DUR = 48000, 30.0
N = int(SR * DUR)
TL = json.load(open("build/timeline.json"))
SFX = json.load(open("build/sfx.json"))
rng = np.random.default_rng(7)
tt = lambda d: np.arange(int(d * SR)) / SR

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def place(buf, sig, at):
    i = int(round(at * SR));
    if i < 0: sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i]

# ---------------- suara ----------------
voice = np.zeros(N)
for c in TL["clips"]:
    place(voice, decode(f"build/vo/{c['id']}.mp3"), c["at"] - c["offset"])
voice *= 0.89 / np.max(np.abs(voice))

# sampul suara untuk 'ducking' muzik
env = np.abs(voice); k = int(0.04 * SR)
env = np.convolve(env, np.ones(k) / k, "same")
act = (env > 0.02).astype(float)
rel = int(0.35 * SR); act = np.convolve(act, np.ones(rel) / rel, "full")[:N]; act = np.clip(act * 3, 0, 1)

# ---------------- muzik ----------------
BPM = 120; B = 60 / BPM
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=0.45, a=1.0):
    t = tt(d); e = np.exp(-t / 0.16) * np.minimum(t / 0.004, 1)
    return a * e * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.04) + 0.15 * np.sin(2 * np.pi * 2 * f * t))
def bass(f, d=0.5, a=1.0):
    t = tt(d); e = np.exp(-t / 0.25) * np.minimum(t / 0.01, 1)
    return a * e * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t))
def kick(a=1.0):
    t = tt(0.18); f = 50 + 70 * np.exp(-t / 0.03)
    return a * np.exp(-t / 0.06) * np.sin(2 * np.pi * np.cumsum(f) / SR)
def hat(a=1.0):
    t = tt(0.05); x = rng.standard_normal(len(t)); x = np.diff(x, prepend=0)
    return a * 0.25 * x * np.exp(-t / 0.012)
def snap(a=1.0):
    t = tt(0.14); x = rng.standard_normal(len(t))
    x = np.convolve(x, np.ones(6) / 6, "same")
    return a * 0.5 * x * np.exp(-t / 0.035)
def pad(fs, d, a=1.0):
    t = tt(d); e = np.minimum(t / 0.3, 1) * np.minimum((d - t) / 0.3, 1).clip(0)
    return a * e * sum(np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.3 * t)) for f in fs) / len(fs)

music = np.zeros(N)
# I – vi – IV – V (C, Am, F, G)
CH = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]
ARP = [0, 1, 2, 1, 0, 2, 1, 2]
bars = int(DUR / (4 * B)) + 1
for b in range(bars):
    ch = CH[b % 4]; t0 = b * 4 * B
    if t0 > 29.2: break
    place(music, pad([mtof(n) for n in ch], 4 * B + 0.2, 0.10), t0)
    for i in range(8):
        n = ch[ARP[i]] + 12 + (12 if i in (3,) else 0)
        place(music, pluck(mtof(n), a=0.16 if i % 2 == 0 else 0.11), t0 + i * B / 2)
    for i in range(4):
        place(music, bass(mtof(ch[0] - 24), a=0.38 if i % 2 == 0 else 0.26), t0 + i * B)
        if i % 2 == 0: place(music, kick(0.32), t0 + i * B)
        else: place(music, snap(0.16), t0 + i * B)
        place(music, hat(0.5), t0 + i * B + B / 2)
# akhir: akord penutup
place(music, pad([mtof(n) for n in (48, 60, 64, 67, 72)], 1.6, 0.22), 28.95)
for i, n in enumerate((72, 76, 79, 84)): place(music, pluck(mtof(n), d=1.2, a=0.18), 28.95 + i * 0.07)
fade = np.ones(N); fi = int(28.9 * SR); fade[fi:] = np.linspace(1, 0.35, N - fi)
music *= fade
music *= 1 - 0.55 * act  # ducking di bawah suara

# ---------------- kesan bunyi ----------------
def pop(a):
    t = tt(0.11); f = 480 + 900 * (t / 0.11)
    return a * np.exp(-t / 0.035) * np.sin(2 * np.pi * np.cumsum(f) / SR)
def ding(a):
    t = tt(0.45); return a * np.exp(-t / 0.13) * (np.sin(2 * np.pi * 1568 * t) + 0.4 * np.sin(2 * np.pi * 3136 * t))
def tick(a):
    t = tt(0.04); return a * np.exp(-t / 0.008) * np.sin(2 * np.pi * 2100 * t)
def drop(a):
    t = tt(0.16); f = 60 + 110 * np.exp(-t / 0.025)
    x = np.exp(-t / 0.05) * np.sin(2 * np.pi * np.cumsum(f) / SR)
    n = rng.standard_normal(len(t)) * np.exp(-t / 0.01) * 0.3
    return a * (x + n)
def whoosh(a):
    d = 0.6; t = tt(d); x = rng.standard_normal(len(t))
    out = np.zeros_like(x); lp = 0.0
    for i in range(len(x)):  # tapis lulus rendah bergerak
        c = 0.02 + 0.25 * (np.sin(np.pi * t[i] / d) ** 2); lp += c * (x[i] - lp); out[i] = lp
    return a * 0.9 * out * np.sin(np.pi * t / d) ** 2
def sparkle(a):
    s = np.zeros(int(0.7 * SR))
    for i, f in enumerate((2093, 2637, 3136, 4186)):
        t = tt(0.4); place(s, 0.5 * np.exp(-t / 0.1) * np.sin(2 * np.pi * f * t), i * 0.055)
    return a * s
GEN = dict(pop=pop, ding=ding, tick=tick, drop=drop, whoosh=whoosh, sparkle=sparkle)
LVL = dict(pop=0.20, ding=0.10, tick=0.10, drop=0.35, whoosh=0.30, sparkle=0.12)
sfx = np.zeros(N)
for e in SFX:
    place(sfx, GEN[e["type"]](LVL[e["type"]] * e["v"]), e["t"])
sfx *= 1 - 0.35 * act

# ---------------- campuran ----------------
L = voice + 0.5 * music + sfx
R = voice + 0.5 * music + sfx
# sedikit kelebaran stereo untuk muzik
d = int(0.012 * SR); R[d:] += 0.08 * music[:-d]; L += 0.0
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)       # pengehad lembut
fo = int(0.3 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
fi = int(0.05 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix *= 0.93 / np.max(np.abs(mix))
with wave.open("build/audio.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("audio.wav", len(mix) / SR, "s")
