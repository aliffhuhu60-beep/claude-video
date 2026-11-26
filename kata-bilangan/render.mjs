// Tangkap bingkai: node render.mjs stills 1.5 5 9   |   node render.mjs frames [workers]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html?capture`;
const FPS = 30, N = 900;
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(URL0);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return page;
}
const mode = process.argv[2] || 'stills';
const out = path.join(ROOT, 'build', mode === 'frames' ? 'frames' : 'stills');
fs.mkdirSync(out, { recursive: true });

if (mode === 'stills') {
  const browser = await chromium.launch({ args: ARGS });
  const page = await open(browser);
  for (const ts of process.argv.slice(3)) {
    const t = +ts; const t0 = Date.now();
    await page.evaluate(t => window.renderAt(t), t);
    await page.screenshot({ path: path.join(out, `t${t.toFixed(2)}.png`) });
    console.log('still', t, Date.now() - t0, 'ms');
  }
  fs.writeFileSync(path.join(ROOT, 'build', 'sfx.json'), JSON.stringify(await page.evaluate(() => window.SFX), null, 1));
  await browser.close();
} else {
  const workers = +(process.argv[3] || 3);
  const t0 = Date.now(); let done = 0;
  await Promise.all([...Array(workers)].map(async (_, w) => {
    const browser = await chromium.launch({ args: ARGS });
    const page = await open(browser);
    if (w === 0) fs.writeFileSync(path.join(ROOT, 'build', 'sfx.json'), JSON.stringify(await page.evaluate(() => window.SFX), null, 1));
    for (let f = w; f < N; f += workers) {
      const file = path.join(out, `${String(f).padStart(4, '0')}.png`);
      if (fs.existsSync(file) && !process.env.FORCE) { done++; continue; }
      await page.evaluate(t => window.renderAt(t), f / FPS);
      await page.screenshot({ path: file });
      if (++done % 60 === 0) console.log(`${done}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await browser.close();
  }));
  console.log('selesai', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
server.close();
