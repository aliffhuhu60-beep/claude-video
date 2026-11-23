"""Campuran audio akhir BICARA BAHASA (dialog + muzik asal + SFX + lagu iklan) -> output/mix.wav
Dialog sudah dibersihkan oleh ffmpeg (work/voice1.wav, voice2.wav). Muzik di-'duck' automatik ikut suara.
    python3 audio/mix.py
"""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
SPF = SR // 30  # sampel per bingkai
cues = json.load(open(os.path.join(ROOT, 'edit', 'audio_cues.json')))
N = cues['total'] * SPF


def load(path):
    w = wave.open(path)
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    ch = w.getnchannels()
    assert w.getframerate() == SR, path
    x = x.reshape(-1, ch)
    return x if ch == 2 else np.repeat(x, 2, 1)


def db(x):
    return 10 ** (x / 20)


def rms_active(x, thr=-45):
    m = x.mean(1)
    fr = m[: len(m) // 4800 * 4800].reshape(-1, 4800)
    r = np.sqrt((fr ** 2).mean(1))
    r = r[20 * np.log10(r + 1e-9) > thr]
    return 20 * np.log10(np.sqrt((r ** 2).mean()) + 1e-9)


def smooth(x, n):
    c = np.cumsum(np.concatenate([[0.0], x]))
    h = n // 2
    i0 = np.clip(np.arange(len(x)) - h, 0, len(x))
    i1 = np.clip(np.arange(len(x)) + h, 0, len(x))
    return (c[i1] - c[i0]) / np.maximum(i1 - i0, 1)


def place(buf, sig, at, gain=1.0):
    if at < 0:
        sig = sig[-at:]
        at = 0
    j = min(len(buf), at + len(sig))
    if j > at:
        buf[at:j] += sig[: j - at] * gain


def fades(x, fi=0.01, fo=0.01):
    x = x.copy()
    a, b = int(fi * SR), int(fo * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


A = lambda *p: os.path.join(ROOT, *p)

# ------------------------------------------------------------------ dialog
V = {n: load(A('work', f'voice{n}.wav')) for n in (1, 2)}
dlg = np.zeros((N, 2), np.float32)
for d in cues['dialogue']:
    s = int(round(d['a'] * SR))
    n = d['frames'] * SPF
    seg = V[d['clip']][s: s + n]
    seg = fades(seg, 0.012, d.get('fadeout', 0.012))
    place(dlg, seg, d['out'] * SPF)
g_dlg = db(-20 - rms_active(dlg))
dlg *= g_dlg

# sampul suara (untuk ducking)
env = np.abs(dlg.mean(1))
k = int(0.05 * SR)
env = np.sqrt(np.convolve(env[::480] ** 2, np.ones(k // 480) / (k // 480), 'same'))  # 100 Hz
act = (20 * np.log10(env + 1e-9) > -42).astype(np.float32)
# attack 0.15 s, release 0.9 s
g = np.zeros_like(act)
for i in range(1, len(act)):
    c = 0.5 if act[i] > g[i - 1] else 0.011
    g[i] = g[i - 1] + (act[i] - g[i - 1]) * c
speech = np.repeat(g, 480)[:N]
speech = np.pad(speech, (0, max(0, N - len(speech))))

# ------------------------------------------------------------------ muzik
intro = load(A('audio', 'music', 'intro_cinematic.wav'))
outro = load(A('audio', 'music', 'outro_uplifting.wav'))
bed1 = load(A('audio', 'music', 'bgm_lofi_porch.wav'))
open_end = int(11.0 * SR)
outro_at = cues['outro']['from'] * SPF

mus = np.zeros((N, 2), np.float32)
place(mus, intro, 0, db(-17 - rms_active(intro)))

# lapisan lo-fi: diulang dengan crossfade 2 s
L = outro_at + 2 * SR - int(10.2 * SR)
bed = np.zeros((L, 2), np.float32)
xf = 2 * SR
pos = 0
while pos < L:
    seg = bed1.copy()
    seg[:xf] *= np.linspace(0, 1, xf)[:, None]
    seg[-xf:] *= np.linspace(1, 0, xf)[:, None]
    place(bed, seg, pos)
    pos += len(bed1) - xf
bed *= db(-20 - rms_active(bed1))  # rujukan: sama paras dengan dialog sebelum ducking
# keluk gain: -25 dB semasa bercakap, -15 dB semasa jeda; naik semasa kad segmen; senyap semasa iklan
gain_db = -15 - 10 * speech[int(10.2 * SR): int(10.2 * SR) + L]
t0 = int(10.2 * SR)
for c in cues['chapters']:
    a, b = c['from'] * SPF - t0, (c['from'] + c['dur']) * SPF - t0
    ramp = np.zeros(L)
    ramp[max(0, a):max(0, b)] = 1
    ramp = smooth(ramp, int(0.4 * SR))
    gain_db = gain_db * (1 - ramp) + (-9) * ramp
for c in cues['ad']:
    a, b = c['from'] * SPF - t0, (c['from'] + c['dur']) * SPF - t0
    m = np.ones(L)
    m[max(0, a - int(0.3 * SR)):b + int(0.2 * SR)] = 0
    m = smooth(m, int(0.6 * SR))
    gain_db = np.where(m < 1, gain_db + 20 * np.log10(np.maximum(m, 1e-4)), gain_db)
fadein = np.clip(np.arange(L) / (1.5 * SR), 0, 1)
fadeout = np.clip((L - np.arange(L)) / (2.5 * SR), 0, 1)
bed *= (db(gain_db) * fadein * fadeout)[:, None]
place(mus, bed, t0)
place(mus, fades(outro, 0.05, 2.0), outro_at, db(-16 - rms_active(outro)))

# ------------------------------------------------------------------ lagu iklan (Suno: "Lima Mit Lagi")
song = load(A('music', 'suno.wav'))
sc = cues['song']
s = int(sc['songFrom'] * SR)
seg = fades(song[s: s + sc['frames'] * SPF], 0.25, 0.9)
place(mus, seg, sc['out'] * SPF, db(-20 - rms_active(song)))

# ------------------------------------------------------------------ SFX
SFXG = {'whoosh_soft': -16, 'whoosh_out': -18, 'impact_cinematic': -14, 'pop': -20, 'click': -22, 'swipe': -19,
        'riser': -18, 'bass_hit': -16, 'shimmer': -24, 'ad_sting': -15}
cache = {}
sfx = np.zeros((N, 2), np.float32)
for c in cues['sfx']:
    nm = c['name']
    if nm not in cache:
        cache[nm] = load(A('audio', 'sfx', nm + '.wav'))
    x = cache[nm]
    base = db(SFXG.get(nm, -20) - 20 * np.log10(np.max(np.abs(x)) + 1e-9) - 3)
    place(sfx, x, int(c['at'] * SPF), base * c.get('gain', 1.0))

mix = dlg + mus + sfx
# pengehad lembut
peak = np.max(np.abs(mix))
mix = np.tanh(mix * 1.1) / 1.1 if peak > 0.98 else mix
raw = A('work', 'mix_raw.wav')
with wave.open(raw, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
# muzik sahaja (aset) untuk rujukan
os.makedirs(A('output', 'audio'), exist_ok=True)

# loudnorm 2 laluan -> -16 LUFS, TP -1.5
o = subprocess.run(['ffmpeg', '-nostats', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
js = json.loads(o[o.rindex('{'): o.rindex('}') + 1])
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-c:a', 'pcm_s16le', A('output', 'audio', 'mix_final.wav')], check=True)
print('dialog gain', round(20 * np.log10(g_dlg), 1), 'dB | input', js['input_i'], 'LUFS -> -16')
