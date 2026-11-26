// Dunia voxel: tekstur piksel prosedural, rupa bumi, pokok, bunga, awan, langit.
import * as THREE from 'three';
import { rng } from './util.js';

export function canvasTex(w, h, draw, seed = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData.canvas = c;
  return t;
}
const px = (g, x, y, [r, gg, b]) => { g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`; g.fillRect(x, y, 1, 1); };
const jit = (c, a, r) => { const k = (r() - 0.5) * 2 * a; return c.map(v => Math.max(0, Math.min(255, v + k))); };
function noise(g, w, h, base, amp, r) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(g, x, y, jit(base, amp, r)); }

const GRASS = [104, 166, 60], DIRT = [134, 96, 67];
export const T = {};
export function makeTextures() {
  T.grassTop = canvasTex(16, 16, (g, w, h, r) => {
    noise(g, w, h, GRASS, 16, r);
    for (let i = 0; i < 14; i++) px(g, (r() * 16) | 0, (r() * 16) | 0, [128, 190, 80]);
  }, 11);
  T.grassSide = canvasTex(16, 16, (g, w, h, r) => {
    noise(g, w, h, DIRT, 14, r);
    for (let i = 0; i < 10; i++) px(g, (r() * 16) | 0, 5 + (r() * 11) | 0, [110, 78, 52]);
    for (let x = 0; x < 16; x++) { const d = 3 + (r() < 0.45 ? 1 : 0) + (r() < 0.2 ? 1 : 0); for (let y = 0; y < d; y++) px(g, x, y, jit(GRASS, 14, r)); }
  }, 12);
  T.dirt = canvasTex(16, 16, (g, w, h, r) => { noise(g, w, h, DIRT, 14, r); for (let i = 0; i < 10; i++) px(g, (r() * 16) | 0, (r() * 16) | 0, [110, 78, 52]); }, 13);
  T.logSide = canvasTex(16, 16, (g, w, h, r) => {
    for (let x = 0; x < 16; x++) { const b = x % 4 === 0 ? [78, 58, 34] : x % 4 === 2 ? [96, 72, 44] : [108, 82, 50]; for (let y = 0; y < 16; y++) px(g, x, y, jit(b, 7, r)); }
  }, 14);
  T.logTop = canvasTex(16, 16, (g, w, h, r) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
      px(g, x, y, jit(d > 6.6 ? [96, 72, 44] : (d | 0) % 2 ? [176, 140, 88] : [150, 116, 70], 6, r));
    }
  }, 15);
  T.leaves = canvasTex(16, 16, (g, w, h, r) => {
    noise(g, w, h, [62, 134, 44], 22, r);
    for (let i = 0; i < 26; i++) px(g, (r() * 16) | 0, (r() * 16) | 0, [38, 92, 30]);
    for (let i = 0; i < 10; i++) px(g, (r() * 16) | 0, (r() * 16) | 0, [96, 170, 70]);
  }, 16);
  T.planks = canvasTex(16, 16, (g, w, h, r) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const row = y >> 2, seam = (x + row * 5) % 8 === 0;
      px(g, x, y, jit(y % 4 === 3 || seam ? [112, 82, 46] : [176, 136, 84], 8, r));
    }
  }, 17);
  T.stone = canvasTex(16, 16, (g, w, h, r) => { noise(g, w, h, [128, 128, 128], 14, r); for (let i = 0; i < 14; i++) px(g, (r() * 16) | 0, (r() * 16) | 0, [100, 100, 104]); }, 18);
  T.stoneTop = canvasTex(16, 16, (g, w, h, r) => {
    noise(g, w, h, [150, 150, 152], 10, r);
    g.fillStyle = 'rgb(108,108,112)'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
  }, 19);
  T.paper = canvasTex(64, 84, (g, w, h) => {
    g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9cc3e6'; for (let y = 14; y < h - 4; y += 7) g.fillRect(4, y, w - 8, 1);
    g.fillStyle = '#e58a8a'; g.fillRect(12, 0, 1, h);
  }, 20);
  return T;
}

const geoCache = new Map(), matCache = new Map();
export function boxGeo(w, h, d) {
  const k = `${w}|${h}|${d}`; if (!geoCache.has(k)) geoCache.set(k, new THREE.BoxGeometry(w, h, d)); return geoCache.get(k);
}
export function mat(c) {
  if (c instanceof THREE.Material) return c;
  if (!matCache.has(c)) matCache.set(c, new THREE.MeshLambertMaterial({ color: c })); return matCache.get(c);
}
export function box(parent, w, h, d, c, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(boxGeo(w, h, d), Array.isArray(c) ? c.map(mat) : mat(c));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
const L = t => new THREE.MeshLambertMaterial({ map: t });

// Rupa bumi + hiasan
export function buildWorld(scene, clears = []) {
  // sektor pandangan kamera dibiarkan lapang (tiada bukit / pokok menghalang)
  const blocked = (x, z, pad = 0.3, rp = 6) => {
    const d = Math.hypot(x, z), ph = Math.atan2(x, z);
    return clears.some(c => { let dd = Math.abs(ph - c.phi) % (Math.PI * 2); if (dd > Math.PI) dd = Math.PI * 2 - dd; return dd < c.w + pad && d < c.r + rp; });
  };
  const grassMats = [L(T.grassSide), L(T.grassSide), L(T.grassTop), L(T.dirt), L(T.grassSide), L(T.grassSide)];
  const dirtMat = L(T.dirt);
  const R = 34, flat = 13.5;
  const hmap = (x, z) => {
    const r = Math.hypot(x, z); if (r < flat || blocked(x, z)) return 0;
    const n = Math.sin(x * 0.31) + Math.cos(z * 0.27) + 0.7 * Math.sin((x + z) * 0.19 + 1.3);
    return Math.max(0, Math.min(5, Math.round((r - flat) * 0.22 + n * 0.75)));
  };
  const tops = [], dirts = [];
  for (let x = -R; x < R; x++) for (let z = -R; z < R; z++) {
    if (Math.hypot(x, z) > R + 2) continue;
    const h = hmap(x, z);
    const lo = Math.min(h, hmap(x + 1, z), hmap(x - 1, z), hmap(x, z + 1), hmap(x, z - 1));
    tops.push([x, h - 0.5, z]);
    for (let y = lo; y < h; y++) dirts.push([x, y - 0.5, z]);
  }
  const dummy = new THREE.Object3D();
  const inst = (list, geo, m) => {
    const im = new THREE.InstancedMesh(geo, m, list.length);
    list.forEach(([x, y, z], i) => { dummy.position.set(x + 0.5, y, z + 0.5); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    im.receiveShadow = true; im.castShadow = true; scene.add(im); return im;
  };
  const unit = new THREE.BoxGeometry(1, 1, 1);
  inst(tops, unit, grassMats); inst(dirts, unit, dirtMat);

  // pokok
  const r = rng(77), logs = [], logM = [L(T.logSide), L(T.logSide), L(T.logTop), L(T.logTop), L(T.logSide), L(T.logSide)];
  const leaves = [], spots = [];
  for (let i = 0; i < 160 && spots.length < 22; i++) {
    const a = r() * Math.PI * 2, d = 15 + r() * 15, x = Math.round(Math.cos(a) * d), z = Math.round(Math.sin(a) * d);
    if (spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 5) || blocked(x, z, 0.4, 5)) continue;
    spots.push([x, z]);
    const base = hmap(x, z), th = 4 + ((r() * 2) | 0);
    for (let y = 0; y < th; y++) logs.push([x, base + y + 0.5, z]);
    const top = base + th;
    for (let dy = -2; dy <= 1; dy++) {
      const rad = dy < 0 ? 2 : 1;
      for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) {
        if (dx === 0 && dz === 0 && dy < 0) continue;
        if (Math.abs(dx) === rad && Math.abs(dz) === rad && (dy === 1 || r() < 0.5)) continue;
        leaves.push([x + dx, top + dy + 0.5, z + dz]);
      }
    }
  }
  inst(logs, unit, logM); inst(leaves, unit, L(T.leaves));

  // bunga kecil
  const fl = rng(9), flowers = new THREE.Group(); scene.add(flowers);
  const cols = ['#e2483d', '#f3d03e', '#f2f2f2', '#8f6fe0'];
  for (let i = 0; i < 90; i++) {
    const a = fl() * Math.PI * 2, d = 10.5 + fl() * 16, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const y = hmap(Math.floor(x), Math.floor(z));
    box(flowers, 0.08, 0.42, 0.08, '#3f8a2e', x, y + 0.21, z);
    box(flowers, 0.24, 0.2, 0.24, cols[i % 4], x, y + 0.5, z);
  }

  // awan
  const clouds = new THREE.Group(); scene.add(clouds);
  const cm = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#d9e4f0', emissiveIntensity: 0.55, fog: false });
  const cr = rng(5);
  for (let i = 0; i < 16; i++) {
    const cg = new THREE.Group(); const a = (i / 16) * Math.PI * 2 + cr(), d = 40 + cr() * 50;
    cg.position.set(Math.cos(a) * d, 30 + cr() * 10, Math.sin(a) * d);
    const n = 2 + ((cr() * 3) | 0);
    for (let k = 0; k < n; k++) { const m = new THREE.Mesh(boxGeo(6 + cr() * 8, 1.6, 4 + cr() * 5), cm); m.position.set((cr() - 0.5) * 8, 0, (cr() - 0.5) * 5); cg.add(m); }
    clouds.add(cg);
  }

  // langit (kecerunan)
  const skyU = { top: { value: new THREE.Color('#3f8fe0') }, hor: { value: new THREE.Color('#cde8f6') } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(vP.y*1.4+0.05,0.0,1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.6)),1.0); \n#include <colorspace_fragment>\n }',
  }));
  sky.renderOrder = -1; scene.add(sky);
  scene.fog = new THREE.Fog('#cde8f6', 34, 95);

  // matahari (segi empat voxel)
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ color: '#fff4c4', fog: false }));
  scene.add(sun);
  return { sky, sun, clouds, hmap };
}
