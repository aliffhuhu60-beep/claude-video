import sys, wave, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
wf=wave.open('audio.wav'); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
P="Protokol SEMAK: Sumber, Emosi, Motif, Akibat, Konfirmasi. Indeks Perpaduan Nasional (IPNas). RIMUP. Furnivall. Allport. sosiogram. syarahan."
for rng in sys.argv[1:]:
    s,e=map(float,rng.split('-'))
    segs,_=m.transcribe(a[int(s*16000):int(e*16000)],language="ms",initial_prompt=P,word_timestamps=True,beam_size=5)
    print("---",rng)
    for sg in segs:
        print(' '.join(f"[{w.start+s:.2f}]{w.word.strip()}" for w in sg.words))
