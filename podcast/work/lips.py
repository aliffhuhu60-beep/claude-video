# Lip-opening per seat (L/C/R) at 10 fps -> lips_<n>.json. Each seat cropped (600x600) so faces are large enough.
import sys, json, subprocess, numpy as np, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
src, out = sys.argv[1], sys.argv[2]
W, H, FPS = 1920, 1080, 10
SEATS = {'L': (680, 500), 'C': (1075, 480), 'R': (1590, 440)}
B = 300
def mk():
    return vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='face_landmarker.task'), running_mode=vision.RunningMode.VIDEO,
        num_faces=1, min_face_detection_confidence=0.3, min_tracking_confidence=0.3))
L = {k: mk() for k in SEATS}
p = subprocess.Popen(['ffmpeg','-v','error','-i',src,'-vf',f'fps={FPS}','-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
rows=[]; i=0
while True:
    b = p.stdout.read(W*H*3)
    if len(b) < W*H*3: break
    fr = np.frombuffer(b,np.uint8).reshape(H,W,3)
    row={}
    for k,(cx,cy) in SEATS.items():
        x0=max(0,min(W-2*B,cx-B)); y0=max(0,min(H-2*B,cy-B))
        crop=np.ascontiguousarray(fr[y0:y0+2*B, x0:x0+2*B])
        r = L[k].detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=crop), int(i*1000/FPS))
        if r.face_landmarks:
            f=r.face_landmarks[0]; xs=[q.x for q in f]; ys=[q.y for q in f]
            fh=abs(f[152].y-f[10].y)*2*B+1e-6
            row[k]={'cx':x0+np.mean(xs)*2*B,'cy':y0+np.mean(ys)*2*B,'h':fh,
                    'open':abs(f[14].y-f[13].y)*2*B/fh}
    rows.append(row); i+=1
    if i%300==0: print(i/FPS, list(row), flush=True)
json.dump({'fps':FPS,'rows':rows}, open(out,'w'))
