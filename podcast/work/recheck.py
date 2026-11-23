import json, wave, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
J=[(1,8.0,11.2),(1,26.8,34.6),(1,334.5,337.8),(1,382.3,384.8),(1,416.2,418.3),(1,478.6,480.3),(1,538.9,543.0),(1,563.7,572.0),(1,583.8,592.6),(1,598.7,603.4),(1,699.4,706.4),(1,727.5,730.2),(1,766.5,775.8),(2,74.0,81.7),(2,35.5,45.0),(1,57.0,62.9),(1,92.0,100.7),(1,246.0,256.6),(1,256.4,271.6)]
A={}
for n in (1,2):
    w=wave.open(f'a{n}.wav'); A[n]=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
res=[]
for n,a,b in J:
    seg=A[n][int(a*16000):int(b*16000)]
    s,_=m.transcribe(seg, language="ms", beam_size=5, initial_prompt="Podcast Bicara Bahasa tentang kerancuan bahasa, bahasa rojak, sintaksis, laras bahasa, bahasa baku.")
    t=' '.join(x.text.strip() for x in s); print(n,a,b,'|',t,flush=True); res.append((n,a,b,t))
json.dump(res,open('recheck.json','w'),ensure_ascii=False)
