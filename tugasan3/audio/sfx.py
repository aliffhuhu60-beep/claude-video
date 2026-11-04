"""Jana bunyi latar pembukaan dan penutup (sintesis, tiada bahan berhak cipta)."""
import numpy as np, wave, sys
SR = 48000
def tone(f, dur, amp, attack=0.01, decay=1.5, partials=((1,1.0),(2,0.35),(3,0.12),(4.2,0.05))):
    t = np.arange(int(dur*SR))/SR
    env = np.minimum(t/attack, 1) * np.exp(-t/decay)
    return amp*env*sum(a*np.sin(2*np.pi*f*k*t) for k,a in partials)
def pad(freqs, dur, amp, att=1.2, rel=2.0):
    t = np.arange(int(dur*SR))/SR
    env = np.minimum(t/att,1)*np.clip((dur-t)/rel,0,1)
    sig = sum(np.sin(2*np.pi*f*t + 0.3*np.sin(2*np.pi*0.2*t)) + 0.5*np.sin(2*np.pi*f*1.003*t) for f in freqs)
    return amp*env*sig/len(freqs)
def whoosh(dur, amp, seed=1):
    rng = np.random.default_rng(seed); n=int(dur*SR); x = rng.standard_normal(n)
    # tapis lulus rendah ringkas berubah (purata bergerak) + sampul
    k = 60; x = np.convolve(x, np.ones(k)/k, 'same')
    t = np.arange(n)/n; env = np.sin(np.pi*t)**2
    return amp*env*x/np.max(np.abs(x))
def place(buf, sig, at):
    i = int(at*SR); j = min(len(buf), i+len(sig)); buf[i:j] += sig[:j-i]
def reverb(x):
    out = x.copy()
    for d,g in ((0.043,0.32),(0.071,0.26),(0.113,0.2),(0.167,0.15),(0.241,0.1),(0.337,0.07)):
        n=int(d*SR); out[n:] += g*x[:-n]
    return out
def save(name, x, total):
    x = reverb(x); fade = int(0.4*SR); x[-fade:] *= np.linspace(1,0,fade)
    x = x/np.max(np.abs(x))*0.5
    st = np.stack([x, np.roll(x, 240)], 1)  # sedikit lebar stereo
    with wave.open(name,'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st*32767).astype('<i2').tobytes())
C4,D4,E4,G4,A4,C5,D5,E5,G5,A5 = 261.63,293.66,329.63,392.0,440.0,523.25,587.33,659.25,783.99,880.0
# Pembukaan: 13.5 s
T=13.5; b=np.zeros(int(T*SR))
place(b, pad([C4/2, G4/2, E4, D5], T, 0.5, att=1.5, rel=2.5), 0)
for i,f in enumerate([G4, C5, E5, G5, D5]): place(b, tone(f, 3.5, 0.16, decay=1.6), 0.6+i*0.16)
for at in (4.4, 4.4+4.2): place(b, whoosh(0.9, 0.13, seed=int(at*10)), at)
save(sys.argv[1], b, T)
# Penutup: 8 s
T=8.0; b=np.zeros(int(T*SR))
place(b, pad([C4/2, G4/2, E4, A4], T, 0.45, att=0.8, rel=2.5), 0)
for i,f in enumerate([C5, E5, G5, C5*2]): place(b, tone(f, 4.5, 0.18, decay=2.0), 0.5+i*0.22)
place(b, tone(C4, 5, 0.12, decay=2.5), 0.5)
save(sys.argv[2], b, T)
