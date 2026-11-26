// Objek voxel: pensel, buku, kertas, kucing, bola, epal, watak.
import * as THREE from 'three';
import { box, boxGeo, canvasTex, T } from './world.js';

export function pencil() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  box(body, 1.9, 0.3, 0.3, '#f2c23a', 0, 0, 0);
  box(body, 1.9, 0.08, 0.31, '#d9a52a', 0, 0.11, 0); // jalur sisi
  box(body, 0.2, 0.32, 0.32, '#c8ccd2', -1.05, 0, 0);
  box(body, 0.26, 0.3, 0.3, '#ee8aa2', -1.28, 0, 0);
  box(body, 0.24, 0.24, 0.24, '#ebcb9b', 1.07, 0, 0);
  box(body, 0.18, 0.16, 0.16, '#e2bd87', 1.27, 0, 0);
  box(body, 0.14, 0.09, 0.09, '#2e2e36', 1.42, 0, 0);
  return g;
}

export function book(cover = '#c8463d', accent = '#f3d26b') {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const W = 1.35, H = 1.8, D = 0.42;
  box(b, W, H, 0.07, cover, 0, 0, D / 2 - 0.035);
  box(b, W, H, 0.07, cover, 0, 0, -D / 2 + 0.035);
  box(b, 0.09, H, D, cover, -W / 2 + 0.045, 0, 0);
  box(b, W - 0.12, H - 0.1, D - 0.12, '#f7f2e4', 0.03, 0, 0);
  box(b, W * 0.62, 0.32, 0.02, accent, 0.05, 0.42, D / 2 + 0.005);
  box(b, W * 0.4, 0.08, 0.02, accent, 0.05, 0.1, D / 2 + 0.005);
  return g;
}

export function paper() {
  const g = new THREE.Group(), p = new THREE.Group(); g.add(p);
  const front = new THREE.MeshLambertMaterial({ map: T.paper }), edge = new THREE.MeshLambertMaterial({ color: '#e9e6dc' });
  const m = new THREE.Mesh(boxGeo(1.5, 1.95, 0.03), [edge, edge, edge, edge, front, front]);
  m.castShadow = true; p.add(m);
  return g;
}

export function cat() {
  const g = new THREE.Group(), c = new THREE.Group(); g.add(c);
  const O = '#e3913f', D = '#b8692a', Wt = '#f4ede2';
  box(c, 1.1, 0.55, 0.55, O, 0, 0.62, 0);
  [-0.25, 0.05, 0.35].forEach(x => box(c, 0.1, 0.57, 0.57, D, x, 0.63, 0));
  [[-0.4, 0.2], [-0.4, -0.2], [0.4, 0.2], [0.4, -0.2]].forEach(([x, z]) => { box(c, 0.18, 0.38, 0.18, O, x, 0.2, z); box(c, 0.19, 0.08, 0.19, Wt, x, 0.04, z); });
  const head = new THREE.Group(); head.position.set(0.62, 0.95, 0); c.add(head);
  const face = canvasTex(8, 8, (gg) => {
    gg.fillStyle = O; gg.fillRect(0, 0, 8, 8);
    gg.fillStyle = D; gg.fillRect(2, 0, 1, 2); gg.fillRect(5, 0, 1, 2);
    gg.fillStyle = '#4fb54a'; gg.fillRect(1, 3, 2, 2); gg.fillRect(5, 3, 2, 2);
    gg.fillStyle = '#111'; gg.fillRect(2, 3, 1, 2); gg.fillRect(5, 3, 1, 2);
    gg.fillStyle = Wt; gg.fillRect(2, 5, 4, 3);
    gg.fillStyle = '#e57a8a'; gg.fillRect(3, 5, 2, 1);
    gg.fillStyle = '#5a3a2a'; gg.fillRect(3, 6, 1, 1); gg.fillRect(4, 6, 1, 1);
  }, 31);
  const fm = new THREE.MeshLambertMaterial({ map: face });
  const hm = new THREE.Mesh(boxGeo(0.6, 0.55, 0.6), ['#e3913f', '#e3913f', '#e3913f', '#e3913f', '#e3913f', '#e3913f'].map(x => new THREE.MeshLambertMaterial({ color: x })));
  hm.material[0] = fm; hm.castShadow = true; head.add(hm);           // muka menghadap +x
  box(head, 0.16, 0.18, 0.12, D, 0, 0.35, 0.2); box(head, 0.16, 0.18, 0.12, D, 0, 0.35, -0.2);
  const tail = new THREE.Group(); tail.position.set(-0.55, 0.8, 0); c.add(tail);
  box(tail, 0.13, 0.75, 0.13, O, 0, 0.35, 0); box(tail, 0.14, 0.16, 0.14, D, 0, 0.66, 0);
  g.userData = { head, tail, body: c };
  g.userData.anim = t => { tail.rotation.x = 0.35 * Math.sin(t * 5); tail.rotation.z = -0.35; head.rotation.y = 0.12 * Math.sin(t * 1.7); };
  return g;
}

function voxelBall(parent, r, s, colorFn) {
  const cells = [];
  for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
    const d = Math.hypot(x, y, z); if (d <= r + 0.35 && d > r - 1.4) cells.push([x, y, z]);
  }
  const im = new THREE.InstancedMesh(boxGeo(s, s, s), new THREE.MeshLambertMaterial({ color: '#ffffff' }), cells.length);
  const o = new THREE.Object3D(), col = new THREE.Color();
  cells.forEach(([x, y, z], i) => { o.position.set(x * s, y * s, z * s); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, col.set(colorFn(x, y, z))); });
  im.castShadow = true; parent.add(im); return im;
}
export function ball() {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const cs = ['#e2483d', '#f5f3ec', '#3b7fd4', '#f3c93e'];
  voxelBall(b, 3, 0.15, (x, y, z) => cs[(((Math.atan2(z, x) + Math.PI) / (Math.PI / 2)) | 0) % 4]);
  g.userData.r = 0.5;
  return g;
}
export function apple() {
  const g = new THREE.Group();
  voxelBall(g, 2, 0.13, (x, y) => (y > 1 ? '#b82e26' : '#d63c30'));
  box(g, 0.06, 0.2, 0.06, '#5a3a22', 0, 0.36, 0); box(g, 0.16, 0.05, 0.1, '#4f9a35', 0.1, 0.42, 0);
  return g;
}

// ---------------- Watak blok ----------------
const P = 0.056; // satu "piksel" watak
function headTex(o, side) {
  return canvasTex(8, 8, (g) => {
    const f = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    if (o.tudung) {
      f(o.tudung, 0, 0, 8, 8);
      if (side === 'front') { f(o.skin, 1, 2, 6, 5); }
    } else {
      f(o.skin, 0, 0, 8, 8);
      if (side === 'front') { f(o.hair, 0, 0, 8, 2); f(o.hair, 0, 2, 1, 1); f(o.hair, 7, 2, 1, 1); if (o.fringe) f(o.hair, 1, 2, 3, 1); }
      else if (side === 'back') { f(o.hair, 0, 0, 8, o.long ? 8 : 6); }
      else if (side === 'top') { f(o.hair, 0, 0, 8, 8); }
      else { f(o.hair, 0, 0, 8, 3); f(o.hair, side === 'left' ? 6 : 0, 3, 2, o.long ? 5 : 1); }
    }
    if (side === 'front') {
      f('#ffffff', 1, 4); f(o.eye || '#3b2a20', 2, 4); f(o.eye || '#3b2a20', 5, 4); f('#ffffff', 6, 4);
      f('#9a5644', 3, 6, 2, 1);
    }
  }, 41);
}
function shirtTex(o) {
  return canvasTex(8, 12, (g) => {
    const f = (c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    f(o.shirt, 0, 0, 8, 12);
    if (o.jersey) { f(o.trim, 0, 0, 8, 1); f(o.trim, 3, 1, 2, 1); f(o.trim, 0, 5, 8, 1); f(o.trim, 3, 7, 2, 3); }
    else {
      f('#d7d9de', 2, 0, 4, 1); f('#d7d9de', 3, 1, 2, 1);
      if (o.tie) { f(o.tie, 3, 1, 2, 1); f(o.tie, 3, 2, 2, 4); }
      if (o.belt) f('#262a36', 0, 11, 8, 1);
    }
  }, 42);
}
export function person(o) {
  o = Object.assign({ skin: '#c99272', hair: '#2a1d15', shirt: '#f3f3f0', pants: '#24305e', shoes: '#1d1d22' }, o);
  const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
  const lam = c => new THREE.MeshLambertMaterial(typeof c === 'string' ? { color: c } : { map: c });
  // kaki
  const leg = (x) => {
    const p = new THREE.Group(); p.position.set(x * P, 12 * P, 0); rig.add(p);
    box(p, 4 * P, 10 * P, 4 * P, o.pants, 0, -5 * P, 0); box(p, 4.1 * P, 2 * P, 4.1 * P, o.shoes, 0, -11 * P, 0); return p;
  };
  const legL = leg(-2), legR = leg(2);
  // badan
  const st = shirtTex(o), sc = lam(o.shirt);
  const bm = new THREE.Mesh(boxGeo(8 * P, 12 * P, 4 * P), [sc, sc, sc, sc, lam(st), sc]); bm.position.y = 18 * P; bm.castShadow = true; rig.add(bm);
  // lengan
  const arm = (x) => {
    const p = new THREE.Group(); p.position.set(x * P, 24 * P, 0); rig.add(p);
    box(p, 4 * P, 5 * P, 4 * P, o.shirt, 0, -2.5 * P, 0);
    box(p, 3.8 * P, 7 * P, 3.8 * P, o.long_sleeve ? o.shirt : o.skin, 0, -8.5 * P, 0);
    if (o.long_sleeve) box(p, 3.9 * P, 1.5 * P, 3.9 * P, o.skin, 0, -11.6 * P, 0);
    return p;
  };
  const armL = arm(-6), armR = arm(6);
  // kepala
  const head = new THREE.Group(); head.position.y = 24 * P; rig.add(head);
  const hmats = ['right', 'left', 'top', 'bottom', 'front', 'back'].map(s => lam(headTex(o, s)));
  const hm = new THREE.Mesh(boxGeo(8 * P, 8 * P, 8 * P), hmats); hm.position.y = 4 * P; hm.castShadow = true; head.add(hm);
  if (o.tudung) box(head, 8.6 * P, 3 * P, 6 * P, o.tudung, 0, -0.6 * P, -0.6 * P); // labuh tudung
  g.userData = { rig, legL, legR, armL, armR, head };
  // pose(t, {walk, wave, jump, cheer})
  g.userData.pose = (t, k = {}) => {
    const w = k.walk || 0, sw = Math.sin(t * 9) * 0.7 * w;
    legL.rotation.x = sw; legR.rotation.x = -sw;
    armL.rotation.x = -sw * 0.8; armR.rotation.x = sw * 0.8; armL.rotation.z = 0; armR.rotation.z = 0;
    rig.position.y = Math.abs(Math.sin(t * 9)) * 0.05 * w;
    if (k.wave) { armR.rotation.x = 0; armR.rotation.z = 2.6 * k.wave + 0.25 * k.wave * Math.sin(t * 10); }
    if (k.cheer) { armL.rotation.z = -2.7 * k.cheer; armR.rotation.z = 2.7 * k.cheer; armL.rotation.x = armR.rotation.x = 0; }
    if (k.jump) rig.position.y += k.jump;
    head.rotation.y = k.look || 0;
    if (!w && !k.jump) rig.position.y = 0.012 * Math.sin(t * 2.4 + (k.ph || 0));
  };
  return g;
}

export const CAST = {
  student: [
    { skin: '#c99272', hair: '#24170f', tie: '#2a3f7a' },
    { skin: '#e0b48f', tudung: '#f6f6f2', long_sleeve: true, pants: '#22356b' },
    { skin: '#a8714f', hair: '#140e0b', tie: '#2a3f7a', fringe: true },
    { skin: '#d9a47c', tudung: '#f6f6f2', long_sleeve: true, pants: '#22356b' },
  ],
  player: [
    { skin: '#c99272', hair: '#24170f', shirt: '#2f6fd6', trim: '#f4f4f4', jersey: true, pants: '#f4f4f4', shoes: '#e2483d' },
    { skin: '#e0b48f', hair: '#3a2416', shirt: '#2f6fd6', trim: '#f4f4f4', jersey: true, pants: '#f4f4f4', shoes: '#e2483d', fringe: true },
    { skin: '#a8714f', hair: '#140e0b', shirt: '#2f6fd6', trim: '#f4f4f4', jersey: true, pants: '#f4f4f4', shoes: '#e2483d' },
    { skin: '#d9a47c', hair: '#1c120c', shirt: '#2f6fd6', trim: '#f4f4f4', jersey: true, pants: '#f4f4f4', shoes: '#e2483d', fringe: true },
  ],
};
