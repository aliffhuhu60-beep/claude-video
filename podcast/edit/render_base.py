"""Render base.mp4: semua keratan rakaman (ikut edit/pieces.json) dengan colour grading, 1080p30.
    python3 edit/render_base.py
"""
import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(os.path.join(ROOT, 'edit', 'pieces.json')))['pieces']
GRADE = open(os.path.join(ROOT, 'edit', 'grade.txt')).read().strip()
TMP = os.path.join(ROOT, 'work', 'pieces')
os.makedirs(TMP, exist_ok=True)
SRC = {1: os.path.join(ROOT, 'raw', 'VID_1.mov'), 2: os.path.join(ROOT, 'raw', 'VID_2.mov')}


def one(k):
    p = P[k]
    out = os.path.join(TMP, f'p{k:03d}.mp4')
    vf = f"fps=30,{GRADE},format=yuv420p"
    if p['hold']:
        vf += f",tpad=stop_mode=clone:stop={p['hold']}"
    cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f"{p['a']:.3f}", '-i', SRC[p['clip']], '-an', '-vf', vf,
           '-frames:v', str(p['frames'] + p['hold']), '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-g', '15',
           '-bf', '0', '-threads', '2', out]
    subprocess.run(cmd, check=True)
    return out


with ThreadPoolExecutor(2) as ex:
    outs = list(ex.map(one, range(len(P))))
lst = os.path.join(TMP, 'list.txt')
with open(lst, 'w') as f:
    for o in outs:
        f.write(f"file '{o}'\n")
dst = os.path.join(ROOT, 'remotion', 'public', 'base.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', dst], check=True)
n = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', dst],
                   capture_output=True, text=True).stdout.strip()
print('base.mp4 frames:', n, 'expected:', sum(p['frames'] + p['hold'] for p in P))
