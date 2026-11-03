import json, re, sys
D=1372.1
CUTS=[(0,3.0),(226.0,240.0),(359.6,370.8),(472.7,474.3),(527.4,533.2),(617.9,625.0),
      (871.4,876.3),(1061.5,1068.8),(1215.7,1219.6),(1254.2,1267.7),(1368.7,D)]
KEEP=[];t=0
for a,b in CUTS:
    if a>t: KEEP.append((t,a))
    t=b
if t<D: KEEP.append((t,D))
def m(x):  # original -> new timeline (None if inside a cut)
    off=0
    for a,b in KEEP:
        if a<=x<=b: return off+(x-a)
        off+=b-a
    return None
TOTAL=sum(b-a for a,b in KEEP)
segs=json.load(open('transcript.json'))
txt={}
for l in open('subs.txt',encoding='utf8'):
    l=l.rstrip('\n')
    if '|' in l: i,s=l.split('|',1); txt[int(i)]=s
HL='&H00D2FF&'  # BGR -> #FFD200 yellow
def fmt(s):
    return re.sub(r'\*(.+?)\*', lambda mm:'{\\c'+HL+'\\fnInter ExtraBold}'+mm.group(1)+'{\\r}', s)
def ts(x):
    h=int(x//3600); mi=int(x%3600//60); se=x%60
    return f"{h}:{mi:02d}:{se:05.2f}"
cues=[]
for i,sg in enumerate(segs):
    s=txt[i]
    if s=='-': continue
    a=sg['words'][0]['s'] if sg['words'] else sg['start']; b=sg['end']
    # clip to keep ranges
    na=m(a); nb=m(b)
    if na is None:
        na=next(m(k[0]) for k in KEEP if k[0]>=a)
    if nb is None:
        nb=max(m(k[1]) for k in KEEP if k[1]<=b)
    cues.append([na,nb,s,i])
for j in range(len(cues)):
    nxt=cues[j+1][0] if j+1<len(cues) else TOTAL
    cues[j][1]=min(max(cues[j][1]+0.25,cues[j][0]+1.0), nxt-0.02)
LABELS=[(20,'BAHAGIAN 1  ·  PENGENALAN & HUBUNGAN FALSAFAH'),(65,'BAHAGIAN 2  ·  ANALISIS KRITIS ISU SEMASA'),
        (219,'BAHAGIAN 3  ·  CADANGAN PENYELESAIAN: KERANGKA BINA'),(307,'BAHAGIAN 4  ·  RUMUSAN & PENUTUP')]
cstart={c[3]:c[0] for c in cues}
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter SemiBold,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3.5,1.5,2,200,200,64,1
Style: Label,Inter SemiBold,30,&H00FFFFFF,&H00FFFFFF,&H00000000,&H66000000,0,0,0,0,100,100,1,0,3,14,0,7,56,56,48,1
Style: Name,Inter ExtraBold,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H66000000,0,0,0,0,100,100,0,0,3,16,0,1,56,56,262,1
Style: NameSub,Inter Medium,30,&H00FFFFFF,&H00FFFFFF,&H00000000,&H66000000,0,0,0,0,100,100,0,0,3,12,0,1,56,56,204,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev=[]
for a,b,s,i in cues:
    ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Sub,,0,0,0,,{fmt(s)}")
for i,lab in []:  # label bahagian dibuang atas permintaan
    a=cstart[i]
    ev.append(f"Dialogue: 1,{ts(a)},{ts(a+5)},Label,,0,0,0,,{{\\fad(300,300)}}{{\\c{HL}}}●{{\\c&HFFFFFF&}}  {lab}")
a=cstart[2]
ev.append(f"Dialogue: 1,{ts(a)},{ts(a+6)},Name,,0,0,0,,{{\\fad(300,300)}}Mohamad Aliff bin Ahmad Shahabuddin")
ev.append(f"Dialogue: 1,{ts(a)},{ts(a+6)},NameSub,,0,0,0,,{{\\fad(300,300)}}Bahasa Melayu Kumpulan 1  ·  Ambilan Ogos 2025  ·  MPU3152")
open('final.ass','w',encoding='utf8').write(hdr+'\n'.join(ev)+'\n')
# plain SRT too
with open('sarikata.srt','w',encoding='utf8') as f:
    for k,(a,b,s,i) in enumerate(cues,1):
        sr=lambda x:f"{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d},{int(round((x%1)*1000))%1000:03d}"
        f.write(f"{k}\n{sr(a)} --> {sr(b)}\n{s.replace('*','')}\n\n")
json.dump({'keep':KEEP,'total':TOTAL,'cues':cues},open('edl.json','w'))
print('keep',len(KEEP),'total %.1f s = %d:%04.1f'%(TOTAL,TOTAL//60,TOTAL%60), 'cues',len(cues))
