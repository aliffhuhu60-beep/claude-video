import json, sys, numpy as np
n=sys.argv[1]
T=json.load(open(f't{n}.json')); L=json.load(open(f'lips_{n}.json')); fps=L['fps']; R=L['rows']
def series(k):
    o=np.array([r[k]['open'] if k in r else np.nan for r in R]); return o
S={k:series(k) for k in 'LCR'}
# motion = abs diff of opening
M={k:np.abs(np.diff(np.nan_to_num(S[k],nan=np.nanmedian(S[k])),prepend=0)) for k in S}
out=[]
for i,s in enumerate(T):
    a,b=int(s['start']*fps),int(s['end']*fps)+1
    sc={k:float(np.nanmean(M[k][a:b])) if b>a else 0 for k in M}
    det={k:float(np.mean(~np.isnan(S[k][a:b]))) for k in S}
    best=max(sc,key=sc.get); srt=sorted(sc.values())
    conf=srt[-1]/(srt[-2]+1e-6)
    out.append((i,best,conf))
    print(f"{i:3d} {s['start']:6.1f} {best} {conf:4.2f} "+' '.join(f"{k}:{sc[k]*1000:5.1f}/{det[k]:.1f}" for k in 'LCR')+'  '+s['text'][:70])
json.dump(out,open(f'spk_{n}.json','w'))
