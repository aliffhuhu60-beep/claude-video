// Video: Kata Bilangan & Penjodoh Bilangan (30 s, 1920x1080, 30 fps)
// Setiap bingkai dijana oleh renderAt(t) — tiada animasi bergantung jam sebenar.
import * as THREE from 'three';
import { clamp, lin, lerp, easeOut, easeIn, easeInOut, easeOutBack, bounce, pulse, popEnv, rng } from './src/util.js';
import { makeTextures, buildWorld, box, T } from './src/world.js';
import { pencil, book, paper, cat, ball, apple, person, CAST } from './src/props.js';

const W = 1920, H = 1080;
const TL = await (await fetch('build/timeline.json')).json();
const C = Object.fromEntries(TL.clips.map(c => [c.id, c]));
const wt = (id, w, n = 0) => C[id].words.filter(x => x.w.toLowerCase() === w.toLowerCase())[n].t;
const SFX = []; const sfx = (type, t, v = 1) => SFX.push({ type, t: +t.toFixed(3), v });

// Titik potong babak (peralihan blok)
const CUT1 = 3.52, CUT2 = 12.83, CUT3 = 22.53, END = 30.0;

// ---------------- Three.js ----------------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1200);
makeTextures();
const world = buildWorld(scene, [
  { phi: -0.45, w: 0.62, r: 31 }, // babak 1 (kamera berpusing)
  { phi: 0.85, w: 0.32, r: 26 },  // babak 2
  { phi: -0.9, w: 0.3, r: 27 },   // babak 3
  { phi: 2.55, w: 0.42, r: 17 },  // babak 4
]);
scene.add(new THREE.HemisphereLight('#dcefff', '#6b8a4a', 1.55));
const sunL = new THREE.DirectionalLight('#fff1d6', 2.1);
sunL.position.set(14, 26, 12); sunL.castShadow = true;
Object.assign(sunL.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 });
sunL.shadow.mapSize.set(2048, 2048); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
scene.add(sunL);
const Y = new THREE.Vector3(0, 1, 0);

// Zarah "puff" semasa objek muncul
const puffs = [];
function puff(parent, x, y, z, t0, n = 12, color = '#ffffff', spread = 1.2) {
  const r = rng(Math.round(t0 * 1000) + n), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, e = (r() - 0.3) * 1.2;
    const m = box(g, 1, 1, 1, i % 3 ? color : '#d9dde3'); m.castShadow = false;
    parts.push({ m, d: new THREE.Vector3(Math.cos(a), e, Math.sin(a)).normalize().multiplyScalar(spread * (0.6 + r() * 0.6)), s: 0.14 + r() * 0.12 });
  }
  puffs.push({ g, parts, t0 });
}
function updPuffs(t) {
  for (const p of puffs) {
    const k = lin(t, p.t0, p.t0 + 0.6); p.g.visible = k > 0 && k < 1;
    if (!p.g.visible) continue;
    for (const q of p.parts) { q.m.position.copy(q.d).multiplyScalar(easeOut(k)); q.m.position.y += 0.4 * k; q.m.scale.setScalar(q.s * (1 - k)); }
  }
}
const bob = (t, ph = 0, a = 0.1) => a * Math.sin(t * 2.6 + ph);
const scale0 = (o, s) => { o.scale.setScalar(Math.max(1e-4, s)); o.visible = s > 0.001; };

// ---------------- UI (DOM) ----------------
const ui = document.getElementById('ui');
function el(html, cls = '') { const d = document.createElement('div'); d.className = 'abs ' + cls; d.innerHTML = html; ui.appendChild(d); return d; }
function place(e, x, y, s = 1, o = 1, rot = 0) {
  e.style.opacity = o.toFixed(3); e.style.display = o <= 0.001 ? 'none' : '';
  e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${Math.max(0, s).toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
}
function popAt(e, t, a, b, x, y, extra = {}) {
  const { s, o } = popEnv(t, a, b, extra.inD, extra.outD);
  place(e, x + (extra.dx || 0) * (1 - clamp(s)), y + (extra.dy || 0) * (1 - clamp(s)), s * (extra.s || 1), o, extra.rot ? extra.rot * (1 - clamp(s)) : 0);
}
const tmpV = new THREE.Vector3();
function project(obj, local) { tmpV.copy(local); obj.localToWorld(tmpV); tmpV.project(camera); return [(tmpV.x + 1) / 2 * W, (1 - tmpV.y) / 2 * H]; }

// ================= BABAK 1: PEMBUKAAN =================
const S1 = new THREE.Group(); scene.add(S1);
const s1Kids = [[-1.7, 1.2, 0], [0, 0.6, 1], [1.7, 1.2, 2]].map(([x, z, i]) => { const p = person(CAST.student[i]); p.position.set(x, 0, z); S1.add(p); return p; });
const s1Cat = cat(); s1Cat.position.set(3.6, 0, 2.3); s1Cat.rotation.y = -Math.PI / 2 + 0.7; S1.add(s1Cat);
const s1Ball = ball(); s1Ball.position.set(-3.8, 0.5, 2.6); S1.add(s1Ball);
[[4.9, 0.2, 0.1], [5.5, -0.5, 0.8], [4.4, -0.9, 2.1]].forEach(([x, z, r]) => { const a = apple(); a.position.set(x, 0.26, z); a.rotation.y = r; S1.add(a); });
const s1Pen = pencil(); s1Pen.position.set(-5.2, 3.0, -1.8); S1.add(s1Pen);
const s1Book = book('#3b6fc4', '#f3d26b'); s1Book.position.set(5.6, 3.0, -2.6); S1.add(s1Book);
const s1Paper = paper(); s1Paper.position.set(-3.2, 4.6, -4.5); s1Paper.scale.setScalar(0.8); S1.add(s1Paper);

const uiTag = el('<div class="tag">TATABAHASA BAHASA MELAYU</div>');
const uiT1 = el('<div class="ttl kb">KATA BILANGAN</div>');
const uiAmp = el('<div class="amp">&amp;</div>');
const uiT2 = el('<div class="ttl pb">PENJODOH BILANGAN</div>');
const tK = wt('s1', 'kata') - 0.05, tA = wt('s1', 'dan'), tP = wt('s1', 'penjodoh') - 0.05;
sfx('whoosh', 0.05, 0.7); sfx('pop', 0.55, 0.6); sfx('pop', tK); sfx('pop', tA, 0.6); sfx('pop', tP); sfx('sparkle', tP + 0.35, 0.6);

function babak1(t) {
  const k = easeInOut(lin(t, 0, 3.7));
  const a = lerp(-0.85, 0.0, k), rad = lerp(30, 12.6, k), h = lerp(14, 3.7, k);
  const cam = { p: [Math.sin(a) * rad, h, Math.cos(a) * rad], l: [0, lerp(1.0, 2.75, k), 0], fov: lerp(46, 42, k) };
  s1Kids.forEach((p, i) => p.userData.pose(t, { wave: i === 1 ? clamp((t - 1.0) * 3) : (i === 0 ? clamp((t - 1.6) * 3) : 0), ph: i, look: -0.2 * (i - 1) }));
  s1Kids[2].userData.pose(t, { cheer: clamp((t - 2.4) * 3) * 0.6, jump: tP < t ? 0.25 * Math.abs(Math.sin((t - tP) * 6)) : 0 });
  s1Cat.userData.anim(t);
  const bt = (t * 1.25) % 1; s1Ball.position.y = 0.5 + 1.6 * (1 - Math.pow(2 * bt - 1, 2)); s1Ball.rotation.z = -t * 3;
  s1Pen.rotation.set(0.2, t * 1.4, 0.7); s1Pen.position.y = 3.0 + bob(t);
  s1Book.rotation.set(0.1, -0.6 + 0.3 * Math.sin(t * 1.3), 0.15); s1Book.position.y = 3.0 + bob(t, 1.5);
  s1Paper.rotation.set(-0.3, 0.4 + 0.2 * Math.sin(t), 0.2 * Math.sin(t * 1.7)); s1Paper.position.y = 4.6 + bob(t, 3);
  const z = 1 + 0.035 * lin(t, 1.2, 3.6);
  popAt(uiTag, t, 0.55, 1e9, 960, 150, { dy: -30 });
  popAt(uiT1, t, tK, 1e9, 960, 300, { s: z, dy: 40, inD: 0.42 });
  popAt(uiAmp, t, tA, 1e9, 960, 418, { s: z, rot: -20 });
  popAt(uiT2, t, tP, 1e9, 960, 530, { s: z, dy: 40, inD: 0.42 });
  return cam;
}

// ================= BABAK 2: KATA BILANGAN =================
const S2 = new THREE.Group(); scene.add(S2);
const ZX = [-8.4, -2.8, 2.8, 8.4];
ZX.forEach(x => { box(S2, 4.4, 0.12, 3.0, new THREE.MeshLambertMaterial({ map: T.planks }), x, 0.06, 0.2); });
const pens2 = [-0.45, 0.45].map((dx, i) => { const p = pencil(); p.position.set(ZX[0] + dx, 1.5, i * 0.15); S2.add(p); return p; });
const books2 = [['#c8463d', '#f3d26b'], ['#3b6fc4', '#f4f1e6'], ['#3e9a52', '#f3d26b']].map(([c, a], i) => { const b = book(c, a); b.position.set(ZX[1] + (i - 1) * 1.15, 1.25, 0.3); b.rotation.y = (i - 1) * -0.28; S2.add(b); return b; });
const kids2 = [0, 1, 2].map(i => { const p = person(CAST.student[[0, 1, 2][i]]); p.position.set(ZX[2] + (i - 1) * 1.15, 0.12, 0.2 + (i === 1 ? -0.3 : 0)); S2.add(p); return p; });
const players2 = [0, 1, 2, 3].map(i => { const p = person(CAST.player[i]); p.position.set(ZX[3] + (i - 1.5) * 0.98, 0.12, 0.1 + (i % 2) * -0.35); S2.add(p); return p; });
const ball2 = ball(); ball2.scale.setScalar(0.75); S2.add(ball2);

const e1 = C.e1.at, e2 = C.e2.at, e3 = C.e3.at, e4 = C.e4.at;
pens2.forEach((p, i) => { sfx('drop', e1 - 0.12 + i * 0.1 + 0.45, 0.8); });
books2.forEach((b, i) => { puff(S2, b.position.x, 1.0, 0.3, e2 - 0.12 + i * 0.1); sfx('pop', e2 - 0.12 + i * 0.1, 0.7); });
kids2.forEach((p, i) => { puff(S2, p.position.x, 0.9, p.position.z, e3 - 0.15 + i * 0.1); sfx('pop', e3 - 0.15 + i * 0.1, 0.7); });
players2.forEach((p, i) => { puff(S2, p.position.x, 0.9, p.position.z, e4 - 0.15 + i * 0.07); sfx('pop', e4 - 0.15 + i * 0.07, 0.6); });

const uiChap2 = el('<div class="chap kb">KATA BILANGAN</div>');
const uiDef2 = el('<div class="card"><div class="k kb">KATA BILANGAN</div><br>Perkataan yang menunjukkan <b class="kb">jumlah</b> atau <b class="kb">bilangan</b> sesuatu.</div>');
const lbl = (hl, rest, cls = 'kb', pre = '') => el(`<div class="lbl"><div>${pre}<span class="hl ${cls}">${hl}</span></div><div class="rest">${rest}</div></div>`);
const L2 = [lbl('DUA', 'batang pensel'), lbl('TIGA', 'buah buku'), lbl('BEBERAPA', 'orang murid'), lbl('SEMUA', 'pemain')];
const E2 = [e1, e2, e3, e4], K2 = [wt('e1', 'dua'), wt('e2', 'tiga'), wt('e3', 'beberapa'), wt('e4', 'semua')];
sfx('pop', CUT1 + 0.2, 0.5); sfx('pop', C.s2.at - 0.05, 0.6);
E2.forEach((a, i) => sfx('pop', a + 0.05, 0.7));
K2.forEach(a => sfx('ding', a + 0.05, 0.5));

function babak2(t) {
  // kamera: tolak masuk perlahan, kemudian beralih sedikit ke zon aktif
  const k0 = easeInOut(lin(t, CUT1 - 0.1, e1));
  const keys = [[e1 - 0.3, -1.4], [e2 - 0.3, -0.5], [e3 - 0.3, 0.5], [e4 - 0.3, 1.4]];
  let fx = 0; for (let i = 0; i < keys.length; i++) { const [kt, kv] = keys[i]; const prev = i ? keys[i - 1][1] : 0; fx = t < kt ? fx : lerp(prev, kv, easeInOut(lin(t, kt, kt + 0.7))); if (t < kt) break; }
  const cam = { p: [fx * 0.9, lerp(8.6, 6.3, k0), lerp(25.5, 20.6, k0)], l: [fx, lerp(2.4, 1.65, k0), 0], fov: 40 };
  // pensel jatuh & melantun
  pens2.forEach((p, i) => {
    const a = e1 - 0.12 + i * 0.1, k = lin(t, a, a + 0.75);
    p.visible = t >= a; p.position.y = lerp(8, 1.55, bounce(k)) + (k >= 1 ? bob(t, i) : 0);
    p.rotation.set(0, -0.35 + 0.25 * Math.sin(t * 1.2 + i), 0.95 + (1 - k) * 2.5);
  });
  books2.forEach((b, i) => { const a = e2 - 0.12 + i * 0.1; scale0(b, easeOutBack(lin(t, a, a + 0.4))); b.position.y = 1.25 + bob(t, i * 1.3, 0.06); });
  kids2.forEach((p, i) => {
    const a = e3 - 0.15 + i * 0.1; scale0(p, easeOutBack(lin(t, a, a + 0.4)));
    p.userData.pose(t, { wave: clamp((t - K2[2] - 0.1 * i) * 4), ph: i, look: (1 - i) * 0.15 });
  });
  players2.forEach((p, i) => {
    const a = e4 - 0.15 + i * 0.07; scale0(p, easeOutBack(lin(t, a, a + 0.4)));
    const jt = t - K2[3] - 0.05; const jump = jt > 0 && jt < 0.9 ? 0.55 * Math.abs(Math.sin(jt * Math.PI * 2.2)) * (1 - jt / 0.9) : 0;
    p.userData.pose(t, { cheer: clamp(jt * 4) * (jt < 1.2 ? 1 : 0.6), jump, ph: i });
  });
  { const a = e4 + 0.1, k = lin(t, a, a + 0.5); scale0(ball2, 0.75 * easeOutBack(k)); const bt = Math.max(0, t - a) * 1.7 % 1; ball2.position.set(ZX[3] + 1.9, 0.5 + 0.9 * (1 - Math.pow(2 * bt - 1, 2)), 1.2); ball2.rotation.z = -t * 3; }
  // UI
  popAt(uiChap2, t, CUT1 + 0.2, 1e9, 230, 78, { dx: -60 });
  popAt(uiDef2, t, C.s2.at - 0.05, e1 - 0.1, 960, 300, { dy: 30 });
  L2.forEach((e, i) => {
    const [x, y] = project(S2, new THREE.Vector3(ZX[i], 0.1, 2.0));
    popAt(e, t, E2[i] + 0.05, 1e9, x, y + 54, { dy: 30, s: 0.94 });
    const hl = e.querySelector('.hl'); const pz = pulse(t, K2[i] - 0.02, 0.5);
    hl.style.transform = `scale(${1 + 0.22 * pz})`; hl.style.boxShadow = pz > 0 ? `0 0 ${30 * pz}px ${8 * pz}px rgba(242,179,61,.8)` : 'none';
  });
  return cam;
}

// ================= BABAK 3: PENJODOH BILANGAN =================
const S3 = new THREE.Group(); scene.add(S3);
const PX = [-7.2, -2.4, 2.4, 7.2];
const stoneM = [T.stone, T.stone, T.stoneTop, T.stone, T.stone, T.stone].map(m => new THREE.MeshLambertMaterial({ map: m }));
PX.forEach(x => box(S3, 1.7, 1.0, 1.7, stoneM, x, 0.5, 0));
const pen3 = pencil(); S3.add(pen3);
const pap3 = paper(); S3.add(pap3);
const cat3 = cat(); S3.add(cat3);
const book3 = book('#8a4fc2', '#f3d26b'); S3.add(book3);
const items3 = [pen3, pap3, cat3, book3], P3 = ['p1', 'p2', 'p3', 'p4'].map(id => C[id].at);
items3.forEach((o, i) => { puff(S3, PX[i], 1.9, 0, P3[i] - 0.1, 14, '#ffffff', 1.4); sfx('pop', P3[i] - 0.1, 0.8); sfx('ding', P3[i] + 0.12, 0.45); });

const uiChap3 = el('<div class="chap pb">PENJODOH BILANGAN</div>');
const uiDef3 = el('<div class="card"><div class="k pb">PENJODOH BILANGAN</div><br>Digunakan bersama <b class="kb">kata bilangan</b> untuk menerangkan <b class="pb">unit</b> atau <b class="pb">bentuk</b> benda.</div>');
const uiLeg = el('<div class="legend"><span><i style="background:var(--kb)"></i>Kata bilangan</span><span><i style="background:var(--pb)"></i>Penjodoh bilangan</span></div>');
const L3 = [['BATANG', 'PENSEL'], ['HELAI', 'KERTAS'], ['EKOR', 'KUCING'], ['BUAH', 'BUKU']].map(([p, n]) => lbl(p, n.toLowerCase(), 'pb', '<span class="se">SE</span>'));
sfx('pop', CUT2 + 0.2, 0.5); sfx('pop', C.s4.at - 0.05, 0.6);

function babak3(t) {
  const k0 = easeInOut(lin(t, CUT2 - 0.1, C.p1.at));
  const cam = { p: [0.5 * Math.sin(t * 0.35), lerp(9.5, 5.4, k0), lerp(26, 18.2, k0)], l: [0, lerp(2.6, 1.85, k0), 0], fov: 40 };
  items3.forEach((o, i) => scale0(o, easeOutBack(lin(t, P3[i] - 0.12, P3[i] + 0.3))));
  pen3.position.set(PX[0], 2.45 + bob(t, 0), 0); pen3.rotation.set(0.15, t * 1.1, 0.8);
  pap3.position.set(PX[1], 2.4 + bob(t, 1), 0); pap3.rotation.set(-0.18, 0.35 * Math.sin(t * 1.1), 0.08 * Math.sin(t * 1.9));
  cat3.position.set(PX[2] - 0.05, 1.0, 0); cat3.rotation.y = -Math.PI / 2 + 0.55; cat3.userData.anim(t);
  book3.position.set(PX[3], 2.35 + bob(t, 2), 0); book3.rotation.set(0.05, -0.3 + 0.25 * Math.sin(t * 1.2), 0.08);
  popAt(uiChap3, t, CUT2 + 0.2, 1e9, 290, 78, { dx: -60 });
  popAt(uiDef3, t, C.s4.at - 0.05, C.p1.at - 0.15, 960, 300, { dy: 30 });
  popAt(uiLeg, t, C.p1.at - 0.3, 1e9, 1530, 78, { dx: 60 });
  L3.forEach((e, i) => {
    const [x, y] = project(S3, new THREE.Vector3(PX[i], 0.0, 1.3));
    popAt(e, t, P3[i] + 0.0, 1e9, x, y + 56, { dy: 30, s: 0.92 });
    const hl = e.querySelector('.hl'); const pz = pulse(t, P3[i] + 0.12, 0.55);
    hl.style.transform = `scale(${1 + 0.22 * pz})`; hl.style.boxShadow = pz > 0 ? `0 0 ${30 * pz}px ${8 * pz}px rgba(62,193,179,.8)` : 'none';
  });
  return cam;
}

// ================= BABAK 4: RUMUSAN & PENUTUP =================
const S4 = new THREE.Group(); scene.add(S4);
const crowd = [...[0, 1, 2, 3].map(i => person(CAST.student[i])), ...[0, 1, 2, 3].map(i => person(CAST.player[i]))];
const order = [4, 0, 5, 1, 6, 2, 7, 3];
order.forEach((ci, j) => { const p = crowd[ci]; p.position.set((j - 3.5) * 1.25, 0, -0.6 + (j % 2) * 0.5); S4.add(p); });
const cat4 = cat(); cat4.position.set(5.9, 0, 0.6); cat4.rotation.y = -Math.PI / 2 + 0.9; S4.add(cat4);
const ball4 = ball(); ball4.position.set(-5.9, 0.5, 0.8); S4.add(ball4);
// konfeti blok
const CONF = 160, confR = rng(99);
const conf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), new THREE.MeshLambertMaterial({ color: '#fff' }), CONF);
const confD = []; const cc = new THREE.Color(), cols = ['#F2B33D', '#3EC1B3', '#ffffff', '#e2483d', '#7bc05a'];
for (let i = 0; i < CONF; i++) { confD.push({ x: (confR() - 0.5) * 16, z: (confR() - 0.5) * 6 + 0.5, y0: 9 + confR() * 4, v: 1.6 + confR() * 1.6, d: confR() * 1.2, s: confR() * 6 }); conf.setColorAt(i, cc.set(cols[i % 5])); }
S4.add(conf);

const s6 = C.s6, s8 = C.s8;
const uiChap4 = el('<div class="chap wh">RUMUSAN</div>');
const uiPK = el(`<div class="pane kb"><h2>KATA BILANGAN</h2><div class="chips"><span class="chip">DUA</span><span class="chip">TIGA</span><span class="chip">BEBERAPA</span></div><div class="cap">menunjukkan <b class="kb">jumlah</b></div></div>`);
const uiPP = el(`<div class="pane pb"><h2>PENJODOH BILANGAN</h2><div class="chips"><span class="chip">BATANG</span><span class="chip">HELAI</span><span class="chip">EKOR</span><span class="chip">BUAH</span></div><div class="cap">menunjukkan <b class="pb">unit</b> atau <b class="pb">bentuk</b></div></div>`);
const uiFull = el(`<div class="full"><div class="fw"><div class="blk kb">DUA</div><div class="ftag kb">kata bilangan</div></div><div class="fw"><div class="blk pb">BATANG</div><div class="ftag pb">penjodoh bilangan</div></div><div class="fw"><div class="blk wh">PENSEL</div><div class="ftag wh">kata nama</div></div></div>`);
const uiClose = el(`<div class="close">Gunakan <span class="kb">kata bilangan</span> dan <span class="pb">penjodoh bilangan</span> dengan betul!</div>`);
const chipsK = [...uiPK.querySelectorAll('.chip')], chipsP = [...uiPP.querySelectorAll('.chip')];
const capK = uiPK.querySelector('.cap'), capP = uiPP.querySelector('.cap');
const fullBlk = [...uiFull.querySelectorAll('.blk')], fullTag = [...uiFull.querySelectorAll('.ftag')];
const tPK = CUT3 + 0.12, tPP = CUT3 + 0.4, tOutP = s8.at - 0.45, tFull = s8.at - 0.35, tClose = s8.at + 0.05;
const tJum = wt('s6', 'jumlah'), tPen = wt('s6', 'penjodoh'), tUnit = wt('s6', 'unit');
sfx('pop', tPK, 0.8); sfx('pop', tPP, 0.8);
chipsK.forEach((_, i) => sfx('tick', tPK + 0.3 + i * 0.12, 0.5)); chipsP.forEach((_, i) => sfx('tick', tPP + 0.3 + i * 0.12, 0.5));
sfx('ding', tJum, 0.5); sfx('ding', tUnit, 0.5);
fullBlk.forEach((_, i) => sfx('pop', tFull + i * 0.13, 0.8));
sfx('pop', tClose, 0.9); sfx('sparkle', tClose + 0.2, 0.9); sfx('drop', s8.at + 0.35, 0.4);

function inner(e, t, a, dy = 18) { const { s, o } = popEnv(t, a); e.style.opacity = o; e.style.transform = `translateY(${dy * (1 - clamp(s))}px) scale(${s})`; }
function babak4(t) {
  const k = lin(t, CUT3, END);
  const a = lerp(-0.22, 0.22, easeInOut(k)), rad = lerp(15.5, 13.2, easeInOut(k));
  const cam = { p: [Math.sin(a) * rad, 4.6, Math.cos(a) * rad], l: [0, 3.9, -1], fov: 42 };
  const cheer = t > tClose + 0.2;
  order.forEach((ci, j) => {
    const p = crowd[ci], ct = t - tClose - 0.2 - j * 0.04;
    p.userData.pose(t, cheer ? { cheer: clamp(ct * 4), jump: 0.38 * Math.abs(Math.sin(ct * 6.2 + j * 0.4)) * clamp(ct * 4), ph: j } : { wave: j === 3 ? clamp((t - tPK) * 3) * 0 : 0, ph: j, look: 0 });
  });
  cat4.userData.anim(t);
  { const bt = (t * 1.1) % 1; ball4.position.y = 0.5 + 1.0 * (1 - Math.pow(2 * bt - 1, 2)); ball4.rotation.z = -t * 2.5; }
  // konfeti
  const o = new THREE.Object3D();
  for (let i = 0; i < CONF; i++) {
    const d = confD[i], ct = t - tClose - 0.25 - d.d * 0.6; let y = -10;
    if (ct > 0) y = d.y0 - d.v * ct * 1.6;
    o.position.set(d.x + 0.3 * Math.sin(ct * 3 + d.s), y, d.z); o.rotation.set(ct * 4 + d.s, ct * 3, d.s); o.scale.setScalar(y > 0 ? 1 : 0.0001); o.updateMatrix(); conf.setMatrixAt(i, o.matrix);
  }
  conf.instanceMatrix.needsUpdate = true;
  // UI
  popAt(uiChap4, t, CUT3 + 0.15, 1e9, 175, 78, { dx: -60 });
  popAt(uiPK, t, tPK, tOutP, 505, 420, { dy: 40 });
  popAt(uiPP, t, tPP, tOutP, 1415, 420, { dy: 40 });
  chipsK.forEach((c, i) => inner(c, t, tPK + 0.3 + i * 0.12));
  chipsP.forEach((c, i) => inner(c, t, tPP + 0.3 + i * 0.12));
  inner(capK, t, tJum - 0.05, 14); inner(capP, t, tUnit - 0.05, 14);
  // tekanan pada panel semasa disebut
  const gK = pulse(t, wt('s6', 'kata') - 0.05, 0.6), gP = pulse(t, tPen - 0.05, 0.6);
  uiPK.style.boxShadow = `0 0 0 5px #0b0e18, 0 0 ${40 * gK}px ${12 * gK}px rgba(242,179,61,.75), 0 18px 34px rgba(0,0,0,.35)`;
  uiPP.style.boxShadow = `0 0 0 5px #0b0e18, 0 0 ${40 * gP}px ${12 * gP}px rgba(62,193,179,.75), 0 18px 34px rgba(0,0,0,.35)`;
  { const { o: of } = popEnv(t, tFull); place(uiFull, 960, 250, 1, of); }
  fullBlk.forEach((b, i) => inner(b, t, tFull + i * 0.13, 40));
  fullTag.forEach((b, i) => inner(b, t, tFull + 0.35 + i * 0.13, 12));
  popAt(uiClose, t, tClose, 1e9, 960, 545, { dy: 40, s: 1 + 0.02 * lin(t, tClose + 0.4, END) });
  document.getElementById('dim').style.opacity = (0.85 * easeOut(lin(t, CUT3, CUT3 + 0.4))).toFixed(3);
  return cam;
}

// ---------------- Peralihan blok ----------------
const wipe = document.getElementById('wipe'); const cells = [];
const tileURL = { 1: T.grassSide.userData.canvas.toDataURL(), 2: T.planks.userData.canvas.toDataURL(), 3: T.stone.userData.canvas.toDataURL() };
for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) { const d = document.createElement('div'); d.style.left = c * 120 + 'px'; d.style.top = r * 120 + 'px'; wipe.appendChild(d); cells.push({ d, r, c }); }
[CUT1, CUT2, CUT3].forEach(tc => sfx('whoosh', tc - 0.3, 0.9));
function updWipe(t) {
  let idx = 0, tc = 0;
  [CUT1, CUT2, CUT3].forEach((c, i) => { if (Math.abs(t - c) < 0.6) { idx = i + 1; tc = c; } });
  wipe.style.display = idx ? '' : 'none'; if (!idx) return;
  for (const { d, r, c } of cells) {
    const dl = ((c + r * 0.8) / (15 + 8 * 0.8)) * 0.16;
    const sIn = easeOut(lin(t, tc - 0.34 + dl, tc - 0.16 + dl)), sOut = 1 - easeIn(lin(t, tc + 0.02 + dl, tc + 0.2 + dl));
    const s = Math.min(sIn, sOut) * 1.02;
    d.style.backgroundImage = `url(${tileURL[idx]})`;
    d.style.transform = `scale(${s.toFixed(3)}) rotate(${((1 - s) * 30).toFixed(1)}deg)`;
    d.style.filter = `brightness(${(0.85 + 0.25 * ((r + c) % 2)).toFixed(2)})`;
  }
}

// ---------------- Sarikata ----------------
const subEl = document.getElementById('sub');
const fmt = s => s.replace(/\*(.+?)\*/g, '<b class="kb">$1</b>').replace(/~(.+?)~/g, '<b class="pb">$1</b>').replace(/\^(.+?)\^/g, '<b class="wh">$1</b>');
let lastSub = '';
function updSub(t) {
  let cur = null;
  TL.clips.forEach((c, i) => { const nx = TL.clips[i + 1]; const until = nx ? Math.min(c.end + 0.25, nx.at - 0.06) : c.end + 0.3; if (t >= c.at - 0.08 && t < until) cur = c; });
  if (!cur || cur.hideSub) { subEl.style.display = 'none'; return; }
  subEl.style.display = '';
  const h = fmt(cur.sub); if (h !== lastSub) { subEl.innerHTML = h; lastSub = h; }
  const k = easeOut(lin(t, cur.at - 0.08, cur.at + 0.06));
  subEl.style.opacity = k; subEl.style.transform = `translate(-50%,-50%) translateY(${(1 - k) * 10}px)`;
}

// ---------------- Gelung utama ----------------
const SCN = [
  { t0: -1, t1: CUT1, yaw: 0.0, g: S1, f: babak1 },
  { t0: CUT1, t1: CUT2, yaw: 0.85, g: S2, f: babak2 },
  { t0: CUT2, t1: CUT3, yaw: -0.9, g: S3, f: babak3 },
  { t0: CUT3, t1: 99, yaw: 2.55, g: S4, f: babak4 },
];
const UIS = [[uiTag, uiT1, uiAmp, uiT2], [uiChap2, uiDef2, ...L2], [uiChap3, uiDef3, uiLeg, ...L3], [uiChap4, uiPK, uiPP, uiFull, uiClose]];
const sunDir = new THREE.Vector3(14, 26, 12).normalize();
function renderAt(t) {
  const si = SCN.findIndex(s => t >= s.t0 && t < s.t1), S = SCN[si];
  SCN.forEach((s, i) => { s.g.visible = i === si; s.g.rotation.y = s.yaw; });
  UIS.forEach((list, i) => { if (i !== si) list.forEach(e => (e.style.display = 'none')); });
  if (si !== 3) document.getElementById('dim').style.opacity = 0;
  const cam = S.f(t);
  const p = new THREE.Vector3(...cam.p).applyAxisAngle(Y, S.yaw), l = new THREE.Vector3(...cam.l).applyAxisAngle(Y, S.yaw);
  camera.position.copy(p); camera.lookAt(l); camera.fov = cam.fov; camera.updateProjectionMatrix();
  scene.updateMatrixWorld(true);
  // ulang kira label selepas kamera dikemas kini
  S.f(t);
  updPuffs(t);
  world.sky.position.copy(camera.position);
  world.sun.position.copy(camera.position).addScaledVector(sunDir, 380); world.sun.lookAt(camera.position);
  world.clouds.children.forEach((c, i) => { c.position.x += 0; c.rotation.y = 0; });
  world.clouds.position.x = t * 0.6;
  updWipe(t); updSub(t);
  const b = Math.max(1 - lin(t, 0, 0.35), lin(t, END - 0.3, END));
  document.getElementById('black').style.opacity = b.toFixed(3);
  renderer.render(scene, camera);
}

await document.fonts.load('400 40px Lilita'); await document.fonts.load('800 40px Nunito'); await document.fonts.load('900 40px Nunito');
await document.fonts.ready;
window.renderAt = renderAt;
window.SFX = SFX.sort((a, b) => a.t - b.t);
window.CUTS = [CUT1, CUT2, CUT3];
window.READY = true;
if (!/capture/.test(location.search)) {
  const q = new URLSearchParams(location.search); const t0 = performance.now(), start = +(q.get('t') || 0);
  if (q.has('t')) renderAt(start); else { const loop = () => { renderAt(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); }; loop(); }
}
