#!/usr/bin/env bash
# Bina semula video dari awal: suara → garis masa → bingkai → audio → MP4
set -euo pipefail
cd "$(dirname "$0")"
npm install --silent
pip install -q edge-tts numpy
python3 audio/tts.py audio/script.json build/vo   # suara latar + masa perkataan
python3 audio/timeline.py                          # build/timeline.json
python3 audio/srt.py > /dev/null                   # sarikata.srt
node render.mjs frames 3                           # 900 bingkai PNG + build/sfx.json
python3 audio/mix.py                               # build/audio.wav
ffmpeg -y -v error -framerate 30 -i build/frames/%04d.png -i build/audio.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 \
  -t 30 -movflags +faststart kata-bilangan.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 kata-bilangan.mp4
