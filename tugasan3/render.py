import json, subprocess, sys
E=json.load(open('edl.json')); KEEP=E['keep']; TOTAL=E['total']
def m(x):
    off=0
    for a,b in KEEP:
        if a-1e-6<=x<=b+1e-6: return off+(x-a)
        off+=b-a
    raise ValueError(x)
FULL=(3.0,19.7)
SLIDES=[(19.7,'03'),(40.46,'04'),(75.16,'06'),(98.96,'07'),(176.62,'08'),(240.0,'10'),(255.8,'11'),(272.2,'10'),(286.5,'12'),
(316.5,'13'),(370.8,'15'),(427.6,'17'),(464.4,'18'),(482.86,'16'),(490.8,'20'),(538.6,'19'),(553.3,'22'),(590.8,'21'),
(625.0,'23'),(692.8,'24'),(757.7,'25'),(817.4,'26'),(823.5,'27'),(832.6,'26'),(876.3,'29'),(917.07,'30'),(981.87,'31'),
(1039.37,'32'),(1107.09,'33'),(1162.45,'34'),(1267.7,'36'),(1327.54,'38'),(1340.0,'37')]
# slide track concat list (new timeline)
pts=[(0.0,'blank')]+[(m(t),p) for t,p in SLIDES]
with open('slides.txt','w') as f:
    for i,(t,p) in enumerate(pts):
        nxt=pts[i+1][0] if i+1<len(pts) else TOTAL
        f.write(f"file 'sl/{'blank' if p=='blank' else 'p'+p}.png'\nduration {nxt-t:.3f}\n")
    f.write(f"file 'sl/p{pts[-1][1]}.png'\n")
json.dump([(round(t,2),p) for t,p in pts],open('slide_times.json','w'))
fullend=m(FULL[1])
LOC1END=m(226.0)
mode=sys.argv[1] if len(sys.argv)>1 else 'all'
def run(c): print(' '.join(c[:6]),'...',flush=True); subprocess.run(c,check=True)
if mode in('cut','all'):
    with open('segs_list.txt','w') as f:
        for i,(a,b) in enumerate(KEEP):
            d=b-a
            run(['ffmpeg','-v','error','-y','-ss',f'{a:.3f}','-i','raw/video.mp4','-t',f'{d:.3f}',
                 '-af',f'afade=t=in:d=0.02,afade=t=out:st={d-0.03:.3f}:d=0.03','-c:v','libx264','-crf','14','-preset','fast','-r','30',
                 '-c:a','pcm_s16le','-ar','44100',f'seg{i}.mkv'])
            f.write(f"file 'seg{i}.mkv'\n")
    run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','segs_list.txt','-c:v','copy',
         '-af','loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000','-c:a','pcm_s16le','cut.mkv'])
if mode in('slides','all'):
    pts2=pts+[(TOTAL,None)]
    with open('sltrack.txt','w') as f:
        for i,(t,p) in enumerate(pts):
            nf=round(pts2[i+1][0]*30)-round(t*30)
            img='sl/blank.png' if p=='blank' else f'sl/p{p}.png'
            run(['ffmpeg','-v','error','-y','-loop','1','-framerate','30','-i',img,'-frames:v',str(nf),
                 '-vf','pad=1920:1080:40:48:color=0x114C5C,format=yuv420p','-c:v','libx264','-crf','16','-preset','fast','-tune','stillimage',
                 '-g','300','-bf','0',f'st{i:02d}.mp4'])
            f.write(f"file 'st{i:02d}.mp4'\n")
    run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','sltrack.txt','-c','copy','sltrack.mp4'])
if mode in('comp','all'):
    lim=sys.argv[2] if len(sys.argv)>2 else None
    fc=(f"[0:v]split[c1][c2];"
        f"[c1]crop=266:480:'if(lt(t,{LOC1END:.2f}),335,307)':0,scale=420:758:flags=lanczos[cam];"
        f"[c2]scale=1920:1080:flags=lanczos[full];"
        f"[1:v][cam]overlay=1460:57[b];"
        f"[b][full]overlay=0:0:enable='lt(t,{fullend:.2f})'[c];"
        f"[c]ass=final.ass,fade=t=in:d=0.6[v]")
    c=['ffmpeg','-v','error','-stats','-y','-i','cut.mkv','-i','sltrack.mp4','-filter_complex',fc,
       '-map','[v]','-map','0:a','-c:v','libx264','-crf','23','-maxrate','5M','-bufsize','10M','-preset','medium','-pix_fmt','yuv420p','-r','30',
       '-c:a','aac','-b:a','160k','-movflags','+faststart']
    if lim: c+=['-t',lim]
    run(c+['main.mp4'])
if mode in('end','all'):
    run(['ffmpeg','-v','error','-y','-loop','1','-framerate','30','-i','sl/rujukan.png','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','7',
         '-vf','scale=1920:1080,fade=t=in:d=0.5,fade=t=out:st=6.2:d=0.8,format=yuv420p','-c:v','libx264','-crf','18','-tune','stillimage','-c:a','aac','-b:a','160k','end.mp4'])
    with open('join.txt','w') as f: f.write("file 'main.mp4'\nfile 'end.mp4'\n")
    run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','join.txt','-c','copy','-movflags','+faststart','Video_Tugasan3_MPU3152.mp4'])
