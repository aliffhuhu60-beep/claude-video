const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const out = process.argv[2], fps = 30, dur = 30;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1320, height: 900 } });
  await p.goto('file://' + require('path').resolve(__dirname, 'index.html') + '');
  await p.waitForTimeout(300);
  await p.evaluate(() => animasi.pause());
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < fps * dur; i++) {
    const t = i / fps;
    const data = await p.evaluate(t => { animasi.renderAt(t); return document.getElementById('kanvas').toDataURL('image/png'); }, t);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
})();
