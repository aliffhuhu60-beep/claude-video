"""Muzik & kesan bunyi ASAL untuk BICARA BAHASA (disintesis sepenuhnya dengan numpy/scipy).
Tiada sampel atau lagu berhak cipta digunakan.

    python3 synth.py            -> menjana semua fail .wav ke audio/music dan audio/sfx
"""
import os, wave
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
RNG = np.random.default_rng(7)


# ---------------------------------------------------------------- utiliti
def t_(d):
    return np.arange(int(round(d * SR))) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, at, gain=1.0, pan=0.0):
    """Letak isyarat mono/stereo ke dalam penimbal stereo."""
    i = int(round(at * SR))
    if i >= len(buf):
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    j = min(len(buf), i + len(sig))
    if i < 0:
        sig = sig[-i:]
        i = 0
    buf[i:j] += gain * sig[: j - i]


def reverb(x, mix=0.25, size=1.0, seed=3):
    """Reverb ringkas: konvolusi dengan hingar bersampul eksponen (stereo)."""
    rng = np.random.default_rng(seed)
    n = int(SR * 1.8 * size)
    tt = np.arange(n) / SR
    env = np.exp(-tt / (0.45 * size))
    irl = lp(rng.standard_normal(n), 6000) * env
    irr = lp(rng.standard_normal(n), 6000) * env
    irl[: int(0.012 * SR)] = 0
    irr[: int(0.017 * SR)] = 0
    irl /= np.sqrt(np.sum(irl ** 2))
    irr /= np.sqrt(np.sum(irr ** 2))
    from scipy.signal import fftconvolve
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wl = fftconvolve(x[:, 0], irl)[: len(x)]
    wr = fftconvolve(x[:, 1], irr)[: len(x)]
    return x * (1 - mix) + np.stack([wl, wr], 1) * mix


def norm(x, peak=0.9):
    m = np.max(np.abs(x))
    return x if m == 0 else x / m * peak


def save(path, x, peak=0.89):
    x = norm(x, peak)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    print('  ', os.path.relpath(path, HERE), f'{len(x) / SR:.1f}s')


def fade(x, fin=0.0, fout=0.0):
    x = x.copy()
    if fin > 0:
        n = int(fin * SR)
        x[:n] *= np.linspace(0, 1, n)[:, None] if x.ndim == 2 else np.linspace(0, 1, n)
    if fout > 0:
        n = int(fout * SR)
        x[-n:] *= np.linspace(1, 0, n)[:, None] if x.ndim == 2 else np.linspace(1, 0, n)
    return x


# ---------------------------------------------------------------- instrumen
def epiano(freq, dur, vel=1.0):
    """Piano elektrik (gaya tine/Rhodes) - FM ringkas + loceng serangan."""
    tt = t_(dur + 1.2)
    dec = 1.6 * (220 / freq) ** 0.35
    env = np.exp(-tt / dec) * np.minimum(tt / 0.004, 1)
    rel = np.clip((dur + 1.2 - tt) / 1.2, 0, 1)
    idx = 1.4 * vel * np.exp(-tt / 0.25)
    mod = np.sin(2 * np.pi * freq * tt)
    body = np.sin(2 * np.pi * freq * tt + idx * mod)
    body += 0.18 * np.sin(2 * np.pi * 2 * freq * tt)
    tine = 0.22 * vel * np.sin(2 * np.pi * freq * 7.1 * tt) * np.exp(-tt / 0.05)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.6 * tt)
    return (body + tine) * env * rel * trem * vel * 0.35


def pad(freqs, dur, att=1.5, rel=2.0, bright=2500, detune=0.006):
    tt = t_(dur)
    sig = np.zeros_like(tt)
    for f in freqs:
        for d in (-detune, 0, detune):
            ph = RNG.uniform(0, 2 * np.pi)
            # gelombang gigi gergaji jalur terhad (beberapa harmonik)
            for k in range(1, 7):
                sig += np.sin(2 * np.pi * f * (1 + d) * k * tt + ph * k) / k / 3
    env = np.minimum(tt / att, 1) * np.clip((dur - tt) / rel, 0, 1)
    sig = lp(sig, bright) * env
    return sig / (len(freqs) * 3)


def bass(freq, dur):
    tt = t_(dur)
    env = np.minimum(tt / 0.008, 1) * np.exp(-tt / 0.9) * np.clip((dur - tt) / 0.06, 0, 1)
    s = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * 2 * freq * tt) + 0.08 * np.sin(2 * np.pi * 3 * freq * tt)
    return lp(s * env, 900) * 0.55


def kick(v=1.0):
    tt = t_(0.45)
    f = 45 + 85 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-tt / 0.18)
    s += 0.25 * lp(RNG.standard_normal(len(tt)), 3000) * np.exp(-tt / 0.006)
    return s * v * 0.9


def snare(v=1.0, brush=True):
    tt = t_(0.35)
    n = bp(RNG.standard_normal(len(tt)), 1200, 7000)
    if brush:
        env = np.minimum(tt / 0.012, 1) * np.exp(-tt / 0.11)
    else:
        env = np.exp(-tt / 0.07)
    body = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.05) * 0.5
    return (n * env * 0.5 + body) * v * 0.6


def rim(v=1.0):
    tt = t_(0.12)
    s = bp(RNG.standard_normal(len(tt)), 1500, 5000) * np.exp(-tt / 0.012)
    s += np.sin(2 * np.pi * 820 * tt) * np.exp(-tt / 0.02) * 0.6
    return s * v * 0.45


def hat(v=1.0, open_=False):
    tt = t_(0.3 if open_ else 0.08)
    s = hp(RNG.standard_normal(len(tt)), 7000, 4)
    s *= np.exp(-tt / (0.12 if open_ else 0.022))
    return s * v * 0.3


def vinyl(dur, amt=1.0):
    n = int(dur * SR)
    hiss = lp(hp(RNG.standard_normal(n), 2000), 9000) * 0.012
    cr = np.zeros(n)
    k = RNG.integers(0, n, int(dur * 9))
    cr[k] = RNG.uniform(-1, 1, len(k)) * RNG.uniform(0.05, 0.35, len(k))
    cr = hp(cr, 1500)
    return (hiss + cr) * amt


# ---------------------------------------------------------------- muzik
BPM = 80
BEAT = 60 / BPM
BAR = 4 * BEAT
# Progresi jazz santai (nada MIDI); akar bes di elemen pertama
PROG = [
    (41, [57, 60, 64, 67]),  # Fmaj9  (F | A C E G)
    (45, [55, 60, 64, 67]),  # Am7    (A | G C E G -> Am7/G warna)
    (38, [57, 60, 64, 65]),  # Dm9
    (43, [53, 57, 59, 64]),  # G13
    (46, [57, 62, 65, 69]),  # Bbmaj7#11 warna
    (45, [55, 60, 64, 67]),  # Am7
    (43, [53, 58, 62, 65]),  # Gm9
    (36, [52, 55, 58, 62]),  # C7sus/9
]


def lofi_bar(bar_i, chord, drums=True, density=1.0):
    root, notes = chord
    out = np.zeros((int(BAR * SR) + SR * 3, 2))
    sw = 0.10 * BEAT  # swing
    # komping piano: rentak 1 dan 'and' of 2 (dengan strum kecil)
    hits = [(0.0, 1.0, 1.7 * BEAT), (1.5 * BEAT + sw, 0.7, 1.2 * BEAT)]
    if bar_i % 2 == 1:
        hits.append((3.0 * BEAT, 0.55, 0.9 * BEAT))
    for at, v, d in hits:
        for k, m in enumerate(notes):
            place(out, epiano(mtof(m), d, v * RNG.uniform(0.85, 1.0)), at + k * 0.012, 0.9, pan=-0.25 + 0.15 * k)
    # melodi kecil sekali-sekala
    if density > 0.5 and bar_i % 4 == 3:
        mel = [notes[-1] + 12, notes[-2] + 12, notes[-1] + 10]
        for k, m in enumerate(mel):
            place(out, epiano(mtof(m), 0.5 * BEAT, 0.5), 2.0 * BEAT + k * 0.5 * BEAT + (sw if k % 2 else 0), 0.7, pan=0.3)
    # bes
    place(out, bass(mtof(root), 1.4 * BEAT), 0.0, 1.0)
    place(out, bass(mtof(root + (7 if bar_i % 2 else 12) - 12 * (bar_i % 2 == 0)), 0.9 * BEAT), 2.5 * BEAT + sw, 0.8)
    if drums:
        place(out, kick(1.0), 0.0)
        place(out, kick(0.6), 2.5 * BEAT + sw)
        if bar_i % 4 == 3:
            place(out, kick(0.45), 3.5 * BEAT + sw)
        place(out, snare(0.75), 1.0 * BEAT, pan=0.05)
        place(out, snare(0.8), 3.0 * BEAT, pan=0.05)
        for e in range(8):
            at = e * 0.5 * BEAT + (sw if e % 2 else 0)
            v = (0.55 if e % 2 == 0 else 0.35) * RNG.uniform(0.8, 1.1)
            place(out, hat(v, open_=(e == 7 and bar_i % 4 == 1)), at, pan=0.35)
    return out


def tape(x):
    """Warna lo-fi: tepu lembut + LPF + wow kecil."""
    x = np.tanh(x * 1.3) / 1.3
    return lp(x, 5200)


def lofi_bed(dur):
    """Muzik latar perbualan (lo-fi / chill jazz) sepanjang dur saat."""
    n_bars = int(np.ceil(dur / BAR)) + 1
    buf = np.zeros((int((n_bars + 2) * BAR * SR), 2))
    for b in range(n_bars):
        sect = (b // 8) % 4
        drums = not (sect == 2 and b % 8 < 4)  # rehat dram sekali-sekala
        place(buf, lofi_bar(b, PROG[b % 8], drums=drums, density=0.4 if sect == 2 else 1.0), b * BAR)
    buf = buf[: int(dur * SR)]
    buf = reverb(buf, 0.18, 0.8)
    buf = tape(buf)
    v = vinyl(dur)
    buf += np.stack([v, np.roll(v, 300)], 1)
    return fade(buf, 2.0, 3.0)


def whoosh(dur=0.9, amp=1.0, up=True, seed=1, lo=300, hi=6000):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    x = rng.standard_normal(n)
    tt = np.arange(n) / n
    # tapis jalur berubah (dilaksana sebagai blok)
    out = np.zeros(n)
    blocks = 48
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        p = b / blocks
        fc = lo * (hi / lo) ** (p if up else 1 - p)
        seg = bp(x[max(0, a - 2000):z], max(60, fc * 0.6), min(20000, fc * 1.6))[-(z - a):]
        out[a:z] = seg
    env = np.sin(np.pi * tt ** (0.7 if up else 1.3)) ** 2
    out = out * env
    st = np.stack([out * (1 - 0.4 * tt), out * (0.6 + 0.4 * tt)], 1)
    return reverb(norm(st, amp), 0.3, 0.7)


def impact(amp=1.0, deep=True):
    tt = t_(3.0)
    f = 38 + 70 * np.exp(-tt / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (0.9 if deep else 0.4))
    noise = lp(RNG.standard_normal(len(tt)), 2500) * np.exp(-tt / 0.25) * 0.5
    thump = lp(RNG.standard_normal(len(tt)), 400) * np.exp(-tt / 0.03)
    s = sub + noise + thump
    return reverb(norm(s, amp), 0.35, 1.4)


def riser(dur=2.0, amp=1.0):
    tt = t_(dur)
    p = tt / dur
    f = 180 * 2 ** (3 * p ** 1.5)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12
    n = whoosh(dur, 1.0, True, seed=11, lo=400, hi=9000)[: len(tt)]
    s = np.stack([tone, tone], 1) * (p ** 2)[:, None] + n * 0.7
    return norm(s, amp)


def pop(amp=1.0):
    tt = t_(0.18)
    f = 900 * np.exp(-tt / 0.03) + 350
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.035)
    return reverb(norm(s, amp), 0.15, 0.4)


def click(amp=1.0):
    tt = t_(0.06)
    s = bp(RNG.standard_normal(len(tt)), 2000, 9000) * np.exp(-tt / 0.004)
    s += np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt / 0.008) * 0.5
    return norm(s, amp)


def swipe(amp=1.0):
    return whoosh(0.45, amp, True, seed=5, lo=1200, hi=11000)


def bass_hit(amp=1.0):
    tt = t_(1.6)
    f = 42 + 40 * np.exp(-tt / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.5)
    return reverb(norm(s, amp), 0.2, 1.0)


def shimmer(amp=1.0):
    """Bunyi 'light sweep' - kilauan nada tinggi."""
    tt = t_(1.4)
    s = np.zeros_like(tt)
    for k, m in enumerate([84, 88, 91, 96]):
        d = np.clip(tt - k * 0.06, 0, None)
        s += np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-d / 0.35) * (tt > k * 0.06)
    return reverb(norm(s, amp), 0.5, 1.2)


# ---------------------------------------------------------------- intro / outro
def intro_music(T=11.0):
    """Muzik pembukaan sinematik 11 s, diselaraskan dengan animasi pembukaan:
    0.4 garisan+impak halus | 2.0 BICARA BAHASA | 5.0 ROJAK ATAU RANCU? | 8.0 subtajuk | 10.2 masuk rakaman."""
    b = np.zeros((int((T + 3) * SR), 2))
    # ambien gelap
    amb = lp(RNG.standard_normal(len(b)), 500) * 0.05
    b += np.stack([amb, np.roll(amb, 500)], 1) * np.minimum(np.arange(len(b)) / SR / 1.5, 1)[:, None]
    place(b, pad([mtof(29), mtof(41)], T + 2, att=1.0, rel=2.5, bright=600), 0, 0.8)
    place(b, impact(0.55, deep=False), 0.4)
    place(b, riser(1.6, 0.5), 0.45)
    # 2.0: tajuk rancangan
    place(b, whoosh(0.8, 0.6, True, seed=21), 1.45)
    place(b, impact(0.6), 2.0)
    place(b, shimmer(0.25), 2.3)
    place(b, pad([mtof(m) for m in (53, 57, 60, 64)], T - 2.0 + 2, att=0.6, rel=2.5, bright=3200), 2.0, 0.9)
    # nadi arpeggio membina
    arp = [65, 69, 72, 76, 72, 69]
    k = 0
    at = 2.0
    while at < 9.9:
        v = 0.25 + 0.35 * (at - 2) / 8
        place(b, epiano(mtof(arp[k % len(arp)] + (5 if at >= 5 else 0)), 0.18, v), at, 0.6, pan=0.4 * np.sin(k))
        k += 1
        at += BEAT / 2
    for at in np.arange(5.0, 9.9, BEAT):
        place(b, kick(0.35), at)
        place(b, hat(0.25), at + BEAT / 2, pan=0.3)
    # 5.0: tajuk utama
    place(b, riser(1.2, 0.45), 3.8)
    place(b, whoosh(0.9, 0.7, True, seed=31), 4.3)
    place(b, impact(0.9), 5.0)
    place(b, bass_hit(0.7), 5.0)
    place(b, pad([mtof(m) for m in (50, 57, 62, 65, 69)], 6.5, att=0.3, rel=2.5, bright=4000), 5.0, 0.6)
    # 8.0: subtajuk
    place(b, swipe(0.4), 7.85)
    place(b, shimmer(0.2), 8.1)
    # 10.2: peralihan ke rakaman
    place(b, whoosh(1.1, 0.55, False, seed=41), 9.7)
    place(b, impact(0.35, deep=False), 10.25)
    b = b[: int(T * SR)]
    return fade(b, 0.3, 1.2)


def outro_music(T=15.0):
    """Muzik penutup lebih ceria (F - C/E - Dm7 - Bb - C), 15 s dengan fade akhir."""
    b = np.zeros((int((T + 3) * SR), 2))
    prog = [(41, [60, 65, 69, 72]), (40, [60, 64, 67, 72]), (38, [62, 65, 69, 72]), (46, [62, 65, 70, 74]),
            (48, [64, 67, 70, 72]), (41, [60, 65, 69, 76])]
    bar = 2.4
    place(b, whoosh(1.0, 0.5, True, seed=51), -0.3)
    place(b, impact(0.45, deep=False), 0.5)
    for i, (r, ns) in enumerate(prog):
        at = 0.5 + i * bar
        place(b, pad([mtof(m) for m in ns], bar + 1.5, att=0.4, rel=1.4, bright=4200), at, 0.55)
        place(b, bass(mtof(r), bar * 0.9), at, 1.0)
        for k, m in enumerate(ns + [ns[2] + 12, ns[1] + 12]):
            place(b, epiano(mtof(m + 12), 0.2, 0.45), at + k * bar / 6, 0.6, pan=-0.4 + 0.15 * k)
        if i >= 1:
            place(b, kick(0.5), at)
            place(b, kick(0.35), at + bar / 2)
            place(b, snare(0.45), at + bar / 4)
            place(b, snare(0.5), at + 3 * bar / 4)
            for e in range(8):
                place(b, hat(0.3 if e % 2 else 0.45), at + e * bar / 8, pan=0.3)
    place(b, shimmer(0.3), 0.5 + 5 * bar)
    b = b[: int(T * SR)]
    b = reverb(b, 0.2, 1.0)
    return fade(b, 0.2, 3.5)


def ad_sting(up=True):
    """Bumper 'IKLAN' masuk/keluar."""
    b = np.zeros((int(1.6 * SR), 2))
    place(b, swipe(0.6), 0.0)
    place(b, pop(0.5), 0.35)
    return b


if __name__ == '__main__':
    import sys
    print('Menjana bunyi...')
    M = os.path.join(HERE, 'music')
    X = os.path.join(HERE, 'sfx')
    bed_len = float(sys.argv[1]) if len(sys.argv) > 1 else 960.0
    save(os.path.join(M, 'intro_cinematic.wav'), intro_music())
    save(os.path.join(M, 'outro_uplifting.wav'), outro_music())
    save(os.path.join(M, 'bgm_lofi_porch.wav'), lofi_bed(bed_len), 0.8)
    save(os.path.join(X, 'whoosh_soft.wav'), whoosh(0.8, 1.0, True, seed=61))
    save(os.path.join(X, 'whoosh_out.wav'), whoosh(0.9, 1.0, False, seed=62))
    save(os.path.join(X, 'impact_cinematic.wav'), impact(1.0))
    save(os.path.join(X, 'pop.wav'), pop(1.0))
    save(os.path.join(X, 'swipe.wav'), swipe(1.0))
    save(os.path.join(X, 'click.wav'), click(1.0))
    save(os.path.join(X, 'riser.wav'), riser(1.5, 1.0))
    save(os.path.join(X, 'bass_hit.wav'), bass_hit(1.0))
    save(os.path.join(X, 'shimmer.wav'), shimmer(1.0))
    save(os.path.join(X, 'ad_sting.wav'), ad_sting())
