import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
import wave, numpy as np
wf=wave.open(sys.argv[1]); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
segs, info = m.transcribe(a, language="ms", word_timestamps=True, vad_filter=True, beam_size=5)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"s":w.start,"e":w.end,"w":w.word} for w in s.words]})
    print(f"{s.start:7.1f} {s.end:7.1f} {s.text}", flush=True)
json.dump(out, open(sys.argv[2],"w"), ensure_ascii=False)
