'use strict';
/* =====================================================================
 *  KUCING & LUKISAN KEJURUTERAAN — animasi interaktif 30 saat
 *  HTML5 Canvas tulen (tiada pustaka luar) + requestAnimationFrame.
 *
 *  Lukisan diambil daripada jawapan:
 *    • Soalan 4 – Unjuran ortografik SUDUT KETIGA (pandangan atas,
 *      hadapan & sisi, dengan garisan miter 45°)
 *    • Soalan 5 – Lukisan isometri (arah A)
 *  Nilai ukuran TIDAK dipaparkan (hanya garisan dimensi kosong untuk
 *  "ditolak" kucing — boleh dimatikan: CONFIG.showDimensionLines).
 *
 *  Struktur fail
 *   1. CONFIG ............. saiz, warna, susun atur, garis masa babak
 *   2. Utiliti matematik
 *   3. DATA LUKISAN ....... koordinat asal PDF (pt) bagi setiap garisan
 *   4. Pembina skrip ...... tukar data → garisan beranimasi (masa mula/tamat)
 *   5. Garisan dimensi .... termasuk yang ditolak kucing kelabu
 *   6. Pensel ............. kedudukan hujung pensel ikut masa
 *   7. Trek kucing ........ jalan cerita (keyframe berasaskan masa)
 *   8. Lukis kertas/garisan/teks
 *   9. Lukis kucing (rig kartun berparameter)
 *  10. Kesan: emosi, zarah, Zzz, kapsyen
 *  11. Gelung animasi, kawalan & interaksi
 *
 *  Semua keadaan babak ialah fungsi masa t (0–30 s), jadi animasi boleh
 *  di-scrub, dijeda dan dirakam secara konsisten.
 * ===================================================================== */

// ---------------------------------------------------------------------
// 1. KONFIGURASI
// ---------------------------------------------------------------------
const CONFIG = {
  W: 1280, H: 720,          // saiz logik kanvas
  renderScale: 1.5,         // resolusi sebenar = 1920 × 1080
  duration: 30,
  showDimensionLines: true, // garisan dimensi (tanpa nombor) yang ditolak kucing

  sheet: { x: 24, y: 24, w: 1232, h: 672 },
  titleBlock: { x: 856, y: 606, w: 400, h: 90 },

  // Pemetaan koordinat PDF (pt) → kanvas
  ortho: { px0: 218, py0: 93.5, x: 60, y: 80, s: 1.3 },
  iso:   { px0: 230, py0: 150, x: 660, y: 140, s: 1.6 },

  inkSpeed: { ortho: 1800, iso: 1500 },   // px/s semasa pensel menakat

  colors: {
    paper: '#fdfdfb',
    gridMinor: 'rgba(70,120,180,0.07)',
    gridMajor: 'rgba(70,120,180,0.16)',
    frame: '#1f2a3a',
    fold: '#4d5d73',
    construct: '#8db0d8',
    ink: '#151c28',
    centre: '#b0479a',
    dim: '#0f7a73',
    trace: '#ff7a1a',
    label: '#243044',
    stamp: '#d63a2f',
  },

  cats: {
    oyen: { body: '#f5a443', dark: '#d77d22', belly: '#ffe3bd', muzzle: '#fff3e2',
            ear: '#f3a0a6', outline: '#3b2414', stripes: [-14, -6, 2, 10], scale: 1.0 },
    abu:  { body: '#a3acb7', dark: '#77828f', belly: '#eceff3', muzzle: '#f8fafc',
            ear: '#e8a4b2', outline: '#252b33', stripes: [-12, -3, 6], scale: 0.95 },
  },
};

const PHASES = [
  { t0: 0,  t1: 8,  text: 'BABAK 1 · Garisan binaan isometri & unjuran ortografik' },
  { t0: 8,  t1: 20, text: 'BABAK 2 · Oyen kejar garisan miter 45° · Abu tolak garisan dimensi' },
  { t0: 20, t1: 31, text: 'BABAK 3 · Lukisan siap! Kucing pun letih… Zzz' },
];

const COL = CONFIG.colors;
const FONT = '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const TAU = Math.PI * 2;
const R45 = Math.PI / 4;

// ---------------------------------------------------------------------
// 2. UTILITI MATEMATIK
// ---------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function rotAround(x, y, pv, a) {
  const dx = x - pv.x, dy = y - pv.y, c = Math.cos(a), s = Math.sin(a);
  return [pv.x + dx * c - dy * s, pv.y + dx * s + dy * c];
}

/** Polyline dengan panjang kumulatif — asas semua garisan beranimasi. */
function mkPath(pts) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, lens, total: lens[lens.length - 1] };
}

function pointAlong(path, d) {
  const { pts, lens, total } = path;
  d = clamp(d, 0, total);
  for (let i = 1; i < pts.length; i++) {
    if (d <= lens[i] || i === pts.length - 1) {
      const seg = lens[i] - lens[i - 1] || 1;
      const k = clamp((d - lens[i - 1]) / seg);
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      return { x: lerp(ax, bx, k), y: lerp(ay, by, k), ang: Math.atan2(by - ay, bx - ax) };
    }
  }
  return { x: pts[0][0], y: pts[0][1], ang: 0 };
}

function arcPts(cx, cy, r, a0, a1, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return out;
}
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

// Pemetaan PDF → kanvas
const O = ([px, py]) => [CONFIG.ortho.x + (px - CONFIG.ortho.px0) * CONFIG.ortho.s,
                         CONFIG.ortho.y + (py - CONFIG.ortho.py0) * CONFIG.ortho.s];
const I = ([px, py]) => [CONFIG.iso.x + (px - CONFIG.iso.px0) * CONFIG.iso.s,
                         CONFIG.iso.y + (py - CONFIG.iso.py0) * CONFIG.iso.s];

// ---------------------------------------------------------------------
// 3. DATA LUKISAN (koordinat PDF, unit pt, paksi-y ke bawah)
// ---------------------------------------------------------------------
const SOALAN4 = (() => {
  // Potongan separuh bulatan pada pandangan sisi
  const slot = arcPts(290.55, 317.5, 35.45, Math.PI, 0, 28);
  return {
    foldV: [[368.5, 93.5], [368.5, 470.6]],
    foldH: [[223.9, 289.1], [541.4, 289.1]],
    miter: [[368.5, 289.1], [218.3, 138.9]],       // garisan miter 45°
    miterArcCentre: [368.5, 289.1],

    // Garisan unjuran: atas → hadapan (menegak) [x, yAtas, yBawah]
    projV: [[396.9, 260.8, 374.2], [403.9, 260.8, 374.2], [418.1, 260.8, 374.2],
            [432.3, 260.8, 374.2], [446.5, 260.8, 374.2], [460.6, 260.8, 360.0],
            [503.1, 260.8, 360.0], [524.4, 260.8, 317.5]],
    // hadapan → sisi (mendatar) [y, xMula, xTamat]
    projH: [[402.5, 396.9, 340.2], [388.3, 396.9, 340.2], [374.2, 396.9, 311.8],
            [360.0, 460.6, 340.2], [317.5, 503.1, 340.2]],
    // atas → miter → sisi (bentuk L) [y, xMiter, yTamat], bermula di x = 396.9
    projL: [[260.8, 340.2, 317.5], [246.6, 326.0, 317.5], [232.4, 311.8, 345.8],
            [211.2, 290.6, 352.9], [197.0, 276.4, 350.0], [182.8, 262.2, 338.7],
            [175.7, 255.1, 317.5], [161.6, 240.9, 317.5]],

    side: {   // PANDANGAN SISI (arah B)
      outline: [[340.2, 402.5], [240.9, 402.5], [240.9, 317.5], [255.1, 317.5], ...slot,
                [340.2, 317.5], [340.2, 402.5]],
      lines: [[[240.9, 360.0], [340.2, 360.0]],
              [[240.9, 374.2], [311.8, 374.2], [311.8, 388.3], [340.2, 388.3]]],
      hidden: [[[262.2, 374.2], [262.2, 388.3]], [[290.6, 374.2], [290.6, 388.3]]],
      centre: [[[276.4, 367.1], [276.4, 395.4]], [[290.6, 306.1], [290.6, 358.6]],
               [[276.4, 317.5], [304.7, 317.5]]],
    },
    front: {  // PANDANGAN HADAPAN (arah A)
      outline: [[396.9, 402.5], [524.4, 402.5], [524.4, 317.5], [503.1, 317.5], [503.1, 360.0],
                [460.6, 360.0], [446.5, 374.2], [396.9, 374.2], [396.9, 402.5]],
      lines: [[[396.9, 388.3], [432.3, 388.3]], [[432.3, 374.2], [446.5, 388.3]]],
      hidden: [[[503.1, 352.9], [524.4, 352.9]], [[403.9, 374.2], [403.9, 388.3]],
               [[432.3, 374.2], [432.3, 387.8]]],
      centre: [[[418.1, 367.1], [418.1, 395.4]]],
    },
    top: {    // PANDANGAN ATAS
      outline: rectPts(396.85, 161.57, 127.56, 99.21),
      lines: [[[396.9, 232.4], [446.5, 232.4], [446.5, 161.6]], [[432.3, 232.4], [432.3, 260.8]],
              [[460.6, 161.6], [460.6, 260.8]], [[503.1, 161.6], [503.1, 260.8]],
              [[503.1, 175.7], [524.4, 175.7]], [[503.1, 246.6], [524.4, 246.6]],
              arcPts(418.1, 197.0, 14.2, -Math.PI / 2, Math.PI * 1.5, 36)],
      hidden: [],
      centre: [[[398.3, 197.0], [438.0, 197.0]], [[418.1, 177.2], [418.1, 216.9]],
               [[491.8, 211.2], [535.7, 211.2]]],
    },
    labels: {
      top:   { at: [460.6, 108], text: 'PANDANGAN ATAS' },
      front: { at: [460.6, 458], text: 'PANDANGAN HADAPAN', sub: '(DILIHAT DARI ARAH A)' },
      side:  { at: [290.6, 458], text: 'PANDANGAN SISI', sub: '(DILIHAT DARI ARAH B)' },
    },
  };
})();

const SOALAN5 = {
  // Asas isometri (dalam pt PDF): titik asal A = penjuru kiri-belakang tapak
  origin: [272.1, 277.8], k: 1.4173,
  box: { X: 166, Y: 60, Z: 71, base: 15 },   // kotak binaan (unit relatif)

  outline1: [[272.1, 277.8], [475.9, 395.4], [475.9, 374.2], [432.9, 349.4], [432.9, 270.0],
             [420.6, 262.9], [374.0, 289.8], [327.4, 209.1], [315.1, 202.0], [315.1, 281.3],
             [272.1, 256.5], [272.1, 277.8]],
  outline2: [[549.5, 352.9], [549.5, 331.7], [506.6, 306.9], [506.6, 227.5], [494.3, 220.4],
             [447.6, 247.3], [401.0, 166.5], [388.7, 159.4]],
  receding: [[[315.1, 202.0], [388.7, 159.4]], [[327.4, 209.1], [401.0, 166.5]],
             [[374.0, 289.8], [447.6, 247.3]], [[420.6, 262.9], [494.3, 220.4]],
             [[432.9, 270.0], [506.6, 227.5]], [[432.9, 349.4], [506.6, 306.9]],
             [[272.1, 256.5], [314.8, 231.9]]],
  slotUpper: [[494.3, 363.5], [492.1, 362.3], [489.8, 361.0], [487.6, 359.7], [485.4, 358.4], [483.1, 357.1],
              [481.5, 356.2], [479.0, 354.3], [476.9, 352.3], [475.5, 350.1], [474.6, 347.8], [474.4, 345.4],
              [474.8, 343.1], [475.9, 340.8], [477.6, 338.7], [479.8, 336.7], [482.5, 334.9], [485.7, 333.4],
              [489.2, 332.3], [493.0, 331.4], [497.0, 330.9], [501.1, 330.8], [505.2, 331.1], [509.1, 331.7],
              [512.8, 332.6], [516.3, 333.9], [518.8, 335.2], [520.7, 336.3], [522.9, 337.6], [525.2, 338.8],
              [527.4, 340.1], [529.6, 341.4], [531.1, 342.3]],
  slotLower: [[482.0, 356.5], [485.1, 354.9], [488.6, 353.7], [492.4, 352.8], [496.4, 352.2], [500.4, 352.1],
              [504.5, 352.2], [508.5, 352.8], [512.3, 353.7], [515.7, 354.9], [518.8, 356.5], [520.3, 357.3],
              [522.6, 358.6], [524.8, 359.9], [527.0, 361.2], [529.3, 362.5], [531.1, 363.5]],
  hitEdge:  [[475.9, 374.2], [494.3, 363.5]],   // tepi yang dicakar Oyen kali ke-2
  endBlock: [[[475.9, 395.4], [494.3, 384.8], [494.3, 363.5]]],
  farBlock: [[[531.1, 363.5], [549.5, 352.9]], [[531.1, 342.3], [549.5, 331.7]],
             [[531.1, 363.5], [531.1, 342.3]]],
  centre: [[[477.1, 332.4], [518.8, 356.5]], [[477.1, 359.3], [523.8, 332.4]]],
};

/** Titik isometri 3D (x sepanjang 166, y kedalaman, z tinggi) → kanvas. */
function P3(x, y, z) {
  const { origin: [ax, ay], k } = SOALAN5, c = Math.cos(Math.PI / 6);
  return I([ax + (x + y) * c * k, ay + (x - y) * 0.5 * k - z * k]);
}

// ---------------------------------------------------------------------
// 4. PEMBINA SKRIP LUKISAN
// ---------------------------------------------------------------------
const STYLES = {
  frame:     { color: COL.frame, width: 2.4 },
  frameThin: { color: COL.frame, width: 1.1 },
  fold:      { color: COL.fold, width: 1.5 },
  construct: { color: COL.construct, width: 0.9, fades: true },
  constructDash: { color: COL.construct, width: 1.0, dash: [10, 4, 2, 4], fades: true },
  ink:       { color: COL.ink, width: 2.4 },
  hidden:    { color: COL.ink, width: 1.4, dash: [7, 4] },
  centre:    { color: COL.centre, width: 1.0, dash: [16, 4, 3, 4] },
  trace:     { color: COL.trace, width: 3.4 },
};

function mkStroke(pts, t0, t1, style, extra = {}) {
  return Object.assign(mkPath(pts), { t0, t1, style }, extra);
}

/** Jadualkan senarai garisan pensel secara berturutan mengikut panjang. */
function scheduleInk(list, tStart, speed, gap = 0.03) {
  let t = tStart;
  const out = [];
  for (const item of list) {
    const p = mkPath(item.pts);
    const dur = Math.max(0.08, p.total / speed);
    out.push(mkStroke(item.pts, t, t + dur, item.style, item.extra || {}));
    t += dur + gap;
  }
  return { strokes: out, end: t };
}

function buildScript() {
  const S = CONFIG.sheet, TB = CONFIG.titleBlock;
  const frame = [], construct = [], trace = [], ink = [], labels = [];
  const con = (pts, t0, t1, style = 'construct') => construct.push(mkStroke(pts, t0, t1, style));

  // --- Bingkai kertas & blok tajuk ---
  frame.push(mkStroke(rectPts(S.x, S.y, S.w, S.h), 0.3, 1.5, 'frame'));
  frame.push(mkStroke(rectPts(TB.x, TB.y, TB.w, TB.h), 1.2, 1.9, 'frameThin'));
  for (let r = 1; r < 3; r++) frame.push(mkStroke([[TB.x, TB.y + r * TB.h / 3], [TB.x + TB.w, TB.y + r * TB.h / 3]], 1.7, 2.1, 'frameThin'));
  frame.push(mkStroke([[TB.x + 250, TB.y], [TB.x + 250, TB.y + TB.h]], 1.9, 2.2, 'frameThin'));

  // --- ORTOGRAFIK: garisan lipatan, miter 45°, garisan unjuran ---
  const D4 = SOALAN4;
  frame.push(mkStroke(D4.foldV.map(O), 1.6, 2.4, 'fold'));
  frame.push(mkStroke(D4.foldH.map(O), 1.8, 2.6, 'fold'));
  con(D4.miter.map(O), 2.6, 3.4, 'constructDash');
  const mc = O(D4.miterArcCentre);
  con(arcPts(mc[0], mc[1], 34, Math.PI, Math.PI * 1.25, 12), 3.3, 3.7);
  labels.push({ text: '45°', x: mc[0] - 50, y: mc[1] - 16, t0: 3.5, size: 12, weight: 700, color: COL.label });

  D4.projV.forEach(([x, y0, y1], i) => con([O([x, y0]), O([x, y1])], 3.6 + i * 0.1, 4.1 + i * 0.1));
  D4.projH.forEach(([y, x0, x1], i) => con([O([x0, y]), O([x1, y])], 4.4 + i * 0.12, 4.9 + i * 0.12));
  D4.projL.forEach(([y, xm, yEnd], i) => con([O([396.9, y]), O([xm, y]), O([xm, yEnd])], 5.2 + i * 0.14, 6.0 + i * 0.14));

  // --- ISOMETRI: garis dasar, paksi 30°, kotak binaan ---
  const { X, Y, Z, base } = SOALAN5.box;
  const A = P3(X, 0, 0);                         // penjuru hadapan paling bawah
  con([[A[0] - 170, A[1]], [A[0] + 150, A[1]]], 1.6, 2.2, 'constructDash');
  con([A, P3(-14, 0, 0)], 2.0, 2.7);
  con([A, P3(X, Y + 16, 0)], 2.1, 2.8);
  con([A, P3(X, 0, Z + 14)], 2.2, 2.8);
  con(arcPts(A[0], A[1], 46, Math.PI, Math.PI * 7 / 6, 10), 2.7, 3.1);
  con(arcPts(A[0], A[1], 46, -Math.PI / 6, 0, 10), 2.7, 3.1);
  labels.push({ text: '30°', x: A[0] - 72, y: A[1] - 10, t0: 3.0, size: 12, weight: 700, color: COL.label });
  labels.push({ text: '30°', x: A[0] + 72, y: A[1] - 10, t0: 3.0, size: 12, weight: 700, color: COL.label });

  con([P3(0, 0, 0), P3(X, 0, 0), P3(X, Y, 0), P3(0, Y, 0), P3(0, 0, 0)], 3.2, 3.9);
  [[0, 0], [X, 0], [X, Y], [0, Y]].forEach(([x, y], i) => con([P3(x, y, 0), P3(x, y, Z)], 3.8 + i * 0.08, 4.1 + i * 0.08));
  con([P3(0, 0, Z), P3(X, 0, Z), P3(X, Y, Z), P3(0, Y, Z), P3(0, 0, Z)], 4.2, 4.9);
  con([P3(0, 0, base), P3(X, 0, base), P3(X, Y, base), P3(0, Y, base), P3(0, 0, base)], 4.9, 5.6);

  // --- BABAK 2: pensel menjejak garisan unjuran melalui miter (dikejar Oyen) ---
  const chase = [
    { pts: [O([396.9, 260.8]), O([340.2, 260.8])], t0: 8.6, t1: 9.3 },   // atas → miter
    { pts: [O([340.2, 260.8]), O([240.9, 161.6])], t0: 9.3, t1: 10.3 },  // sepanjang miter 45°
    { pts: [O([240.9, 161.6]), O([240.9, 317.5])], t0: 10.3, t1: 11.1 }, // turun ke pandangan sisi
  ];
  chase.forEach(c => trace.push(mkStroke(c.pts, c.t0, c.t1, 'trace')));

  // --- Pensel menakat pandangan ortografik ---
  const viewItems = v => [
    { pts: v.outline.map(O), style: 'ink' },
    ...v.lines.map(l => ({ pts: l.map(O), style: 'ink' })),
    ...v.hidden.map(l => ({ pts: l.map(O), style: 'hidden' })),
    ...v.centre.map(l => ({ pts: l.map(O), style: 'centre' })),
  ];
  let sch = scheduleInk([...viewItems(D4.side), ...viewItems(D4.front), ...viewItems(D4.top)],
                        11.15, CONFIG.inkSpeed.ortho);
  ink.push(...sch.strokes);
  const orthoDone = sch.end;

  // --- Pensel menakat lukisan isometri ---
  const D5 = SOALAN5;
  const isoItems = [
    { pts: D5.outline1.map(I), style: 'ink', extra: { iso: true } },
    { pts: D5.outline2.map(I), style: 'ink', extra: { iso: true } },
    ...D5.receding.map(l => ({ pts: l.map(I), style: 'ink', extra: { iso: true } })),
    { pts: D5.slotUpper.map(I), style: 'ink', extra: { iso: true } },
    { pts: D5.slotLower.map(I), style: 'ink', extra: { iso: true } },
    { pts: D5.hitEdge.map(I), style: 'ink', extra: { iso: true, hitEdge: true } },
    ...D5.endBlock.map(l => ({ pts: l.map(I), style: 'ink', extra: { iso: true } })),
    ...D5.farBlock.map(l => ({ pts: l.map(I), style: 'ink', extra: { iso: true } })),
    ...D5.centre.map(l => ({ pts: l.map(I), style: 'centre', extra: { iso: true } })),
  ];
  sch = scheduleInk(isoItems, Math.max(15.5, orthoDone + 0.3), CONFIG.inkSpeed.iso);
  ink.push(...sch.strokes);
  const hitStroke = sch.strokes.find(s => s.hitEdge);

  // --- BABAK 3: tajuk & label pandangan ---
  labels.push({ text: 'UNJURAN ORTOGRAFIK — SUDUT KETIGA', x: O([380, 0])[0], y: 58, t0: 20.0, size: 17, weight: 800, color: COL.label });
  labels.push({ text: 'LUKISAN ISOMETRI (ARAH A)', x: I([410, 0])[0], y: 58, t0: 20.15, size: 17, weight: 800, color: COL.label });
  Object.values(D4.labels).forEach((L, i) => {
    const [x, y] = O(L.at);
    labels.push({ text: L.text, x, y, t0: 20.3 + i * 0.15, size: 13, weight: 800, color: COL.label, underline: true });
    if (L.sub) labels.push({ text: L.sub, x, y: y + 17, t0: 20.4 + i * 0.15, size: 10.5, weight: 500, color: '#5a6779' });
  });

  return {
    frame, construct, trace, ink, labels,
    marks: {
      orthoDone,
      isoDone: sch.end,
      swat2: (hitStroke.t0 + hitStroke.t1) / 2,
      hitEdgeMid: lerp2(hitStroke.pts[0], hitStroke.pts[1], 0.5),
    },
  };
}

// ---------------------------------------------------------------------
// 5. GARISAN DIMENSI (tanpa nilai ukuran)
// ---------------------------------------------------------------------
function buildDims() {
  const fvL = O([396.9, 442.2]), fvR = O([524.4, 442.2]);
  const isoB = P3(-30, 0, 0), isoT = P3(-30, 0, 71);
  return {
    // Garisan dimensi lebar pandangan hadapan — ditolak dari kanan ke kiri
    orthoW: {
      p1: fvL, p2: fvR,
      ext: [[O([396.9, 405.5]), O([396.9, 446.5])], [O([524.4, 405.5]), O([524.4, 446.5])]],
      appear: 6.6,
      push: { t0: 9.5, t1: 12.1, from: [110, 0], shoves: 4 },
      cat: { ref: fvR, dx: 38, dy: 14, dir: -1 },
      burstAt: fvR,
    },
    // Garisan dimensi tinggi isometri — ditolak dari kiri ke kanan
    isoH: {
      p1: isoB, p2: isoT,
      ext: [[P3(-2, 0, 0), P3(-34, 0, 0)], [P3(33, 0, 71), P3(-34, 0, 71)]],
      appear: 7.0,
      push: { t0: 14.8, t1: 17.6, from: [-120, 0], shoves: 4 },
      cat: { ref: isoB, dx: -38, dy: 12, dir: 1 },
      burstAt: lerp2(isoB, isoT, 0.5),
    },
  };
}

/** Anjakan dimensi pada masa t: ditolak berperingkat, kemudian "spring" kecil. */
function dimOffset(d, t, forCat = false) {
  const pu = d.push;
  if (!pu) return [0, 0];
  const [fx, fy] = pu.from;
  if (t <= pu.t0) return [fx, fy];
  if (t < pu.t1) {
    const raw = ((t - pu.t0) / (pu.t1 - pu.t0)) * pu.shoves;
    const i = Math.floor(raw);
    const p = (i + easeInOut(raw - i)) / pu.shoves;   // tolak... rehat... tolak
    return [fx * (1 - p), fy * (1 - p)];
  }
  if (forCat) return [0, 0];
  const u = t - pu.t1, k = Math.exp(-u * 7) * Math.sin(u * 24) * 5;
  return [-Math.sign(fx) * k, -Math.sign(fy) * k];
}
const catPosForDim = (d, which) => {
  const off = which === 'start' ? d.push.from : [0, 0];
  return [d.cat.ref[0] + off[0] + d.cat.dx, d.cat.ref[1] + off[1] + d.cat.dy];
};

// ---------------------------------------------------------------------
// 6. PENSEL
// ---------------------------------------------------------------------
function buildPen(script) {
  const strokes = [...script.trace, ...script.ink].sort((a, b) => a.t0 - b.t0);
  const enter = { t: 8.1, p: [1330, -70] };
  const exit = { t: script.marks.isoDone + 0.8, p: [1330, -70] };
  const startOf = s => s.pts[0], endOf = s => s.pts[s.pts.length - 1];
  return function penAt(t) {
    if (t < enter.t || t > exit.t) return null;
    for (const s of strokes) {
      if (t >= s.t0 && t <= s.t1) {
        const q = pointAlong(s, ((t - s.t0) / (s.t1 - s.t0)) * s.total);
        return { pos: [q.x, q.y], down: true, lift: 0, style: s.style };
      }
    }
    let prev = null, next = null;
    for (const s of strokes) { if (s.t1 < t) prev = s; else if (s.t0 > t && !next) next = s; }
    const a = prev ? { p: endOf(prev), t: prev.t1 } : enter;
    const b = next ? { p: startOf(next), t: next.t0 } : exit;
    const k = easeInOut(clamp((t - a.t) / (b.t - a.t || 1)));
    return { pos: lerp2(a.p, b.p, k), down: false, lift: Math.sin(k * Math.PI) };
  };
}

// ---------------------------------------------------------------------
// 7. TREK KUCING (jalan cerita)
// ---------------------------------------------------------------------
// Jenis segmen:
//   jump  {from,to,h,rot?}   – lompat parabola
//   move  {path,gait,align?} – berjalan/berlari ikut laluan
//   idle  {at,dir,pose}      – sit | watch | wiggle | sniff | swat | proud | groom | tired
//   push  {dim}              – menolak garisan dimensi
//   sleep {at,dir}           – baring & tidur
const SIT_LEVEL = { sit: 1, watch: 1, proud: 1, groom: 1, tired: 0.7, swat: 0.3, wiggle: 0, sniff: 0 };

function prepareTrack(track) {
  track.forEach((s, i) => {
    const prev = track[i - 1];
    s.landing = !!prev && prev.type === 'jump';
    s.sitFrom = prev && prev.type === 'idle' ? (SIT_LEVEL[prev.pose] || 0) : 0;
    if (s.type === 'move') s._path = mkPath(s.path);
  });
  return track;
}

function buildCats(script, dims) {
  const M = y => { const c = O([368.5, 289.1]); return [c[0] + (y - c[1]), y]; }; // titik atas miter
  const sw2 = script.marks.swat2;
  const oIso = [1090, 578];
  const oyen = [
    { type: 'jump', t0: 6.2, t1: 6.9, from: [1340, 780], to: [820, 598], h: 150 },
    { type: 'jump', t0: 6.9, t1: 7.6, from: [820, 598], to: [560, 440], h: 120 },
    { type: 'idle', t0: 7.6, t1: 8.6, at: [560, 440], dir: -1, pose: 'watch' },
    { type: 'idle', t0: 8.6, t1: 9.3, at: [560, 440], dir: -1, pose: 'wiggle' },
    { type: 'jump', t0: 9.3, t1: 9.75, from: [560, 440], to: M(306), h: 70, dir: -1, rot: [0, R45] },
    { type: 'move', t0: 9.75, t1: 10.45, path: [M(306), M(185)], gait: 'run', align: true, dir: -1, ease: 'linear' },
    { type: 'jump', t0: 10.45, t1: 11.1, from: M(185), to: [140, 348], h: 40, dir: 1, rot: [-R45, 0] },
    { type: 'idle', t0: 11.1, t1: 14.6, at: [140, 348], dir: 1, pose: 'watch' },
    { type: 'move', t0: 14.6, t1: 15.8, path: [[140, 348], [265, 350], [560, 500], oIso], gait: 'run' },
    { type: 'idle', t0: 15.8, t1: 16.45, at: oIso, dir: -1, pose: 'watch' },
    { type: 'idle', t0: 16.45, t1: 16.85, at: oIso, dir: -1, pose: 'swat' },
    { type: 'idle', t0: 16.85, t1: sw2 - 0.18, at: oIso, dir: -1, pose: 'watch' },
    { type: 'idle', t0: sw2 - 0.18, t1: sw2 + 0.18, at: oIso, dir: -1, pose: 'swat' },
    { type: 'idle', t0: sw2 + 0.18, t1: 20.2, at: oIso, dir: -1, pose: 'sit' },
    { type: 'idle', t0: 20.2, t1: 20.6, at: oIso, dir: -1, pose: 'tired' },
    { type: 'move', t0: 20.6, t1: 23.4, path: [oIso, [700, 640], [190, 676]], gait: 'walk', tired: true },
    { type: 'sleep', t0: 23.4, t1: 99, at: [190, 676], dir: -1 },
  ];

  const g0 = catPosForDim(dims.orthoW, 'start'), g1 = catPosForDim(dims.orthoW, 'end');
  const h0 = catPosForDim(dims.isoH, 'start'), h1 = catPosForDim(dims.isoH, 'end');
  const abu = [
    { type: 'jump', t0: 6.6, t1: 7.3, from: [-80, 790], to: [200, 640], h: 170 },
    { type: 'jump', t0: 7.3, t1: 7.9, from: [200, 640], to: [660, 600], h: 100 },
    { type: 'idle', t0: 7.9, t1: 8.5, at: [660, 600], dir: 1, pose: 'sit' },
    { type: 'move', t0: 8.5, t1: 9.2, path: [[660, 600], g0], gait: 'walk', dir: -1 },
    { type: 'idle', t0: 9.2, t1: 9.5, at: g0, dir: -1, pose: 'sniff' },
    { type: 'push', t0: 9.5, t1: 12.1, dim: 'orthoW' },
    { type: 'idle', t0: 12.1, t1: 13.0, at: g1, dir: -1, pose: 'proud' },
    { type: 'move', t0: 13.0, t1: 14.1, path: [g1, [540, 430], h0], gait: 'walk' },
    { type: 'idle', t0: 14.1, t1: 14.8, at: h0, dir: 1, pose: 'sniff' },
    { type: 'push', t0: 14.8, t1: 17.6, dim: 'isoH' },
    { type: 'idle', t0: 17.6, t1: 18.5, at: h1, dir: 1, pose: 'proud' },
    { type: 'idle', t0: 18.5, t1: 20.2, at: h1, dir: 1, pose: 'groom' },
    { type: 'idle', t0: 20.2, t1: 20.6, at: h1, dir: -1, pose: 'tired' },
    { type: 'move', t0: 20.6, t1: 23.4, path: [h1, [560, 600], [70, 652], [105, 676]], gait: 'walk', tired: true },
    { type: 'sleep', t0: 23.4, t1: 99, at: [105, 676], dir: 1 },
  ];

  return [
    { id: 'oyen', name: 'Oyen', pal: CONFIG.cats.oyen, track: prepareTrack(oyen), blink: 0.3, pitch: 1.0,
      emotes: [{ t0: 8.3, t1: 9.0, text: '!' }, { t0: 11.15, t1: 11.9, text: '?' },
               { t0: 16.6, t1: 17.3, text: 'Ngiau!' }, { t0: sw2, t1: sw2 + 0.6, text: '!' },
               { t0: 20.25, t1: 21.3, kind: 'sweat' }] },
    { id: 'abu', name: 'Abu', pal: CONFIG.cats.abu, track: prepareTrack(abu), blink: 1.9, pitch: 0.82,
      emotes: [{ t0: 9.15, t1: 9.7, text: '?' }, { t0: 12.15, t1: 12.95, text: '♪' },
               { t0: 14.15, t1: 14.75, text: 'Hmm…' }, { t0: 17.65, t1: 18.45, text: '♪' },
               { t0: 20.3, t1: 21.3, kind: 'sweat' }] },
  ];
}

/** Keadaan pose kucing pada masa t — semuanya fungsi masa. */
function catPose(cat, t, clock, pen) {
  const track = cat.track;
  const st = {
    x: 0, y: 0, lift: 0, dir: 1, rot: 0, gait: 0, phase: 0, run: 0, crouch: 0, stretch: 0,
    lie: 0, sit: 0, eye: 1, eyeMode: 'open', push: 0, swat: 0, wiggle: 0, headTilt: 0,
    tailAmp: 0.5, tailSpeed: 3, effort: 0, look: [0, 0], hidden: false, sleeping: false,
  };
  if (t < track[0].t0) { st.hidden = true; return st; }
  let seg = track[0];
  for (const s of track) if (t >= s.t0) seg = s;
  const p = clamp((t - seg.t0) / (seg.t1 - seg.t0));
  let lookPen = false;

  switch (seg.type) {
    case 'jump': {
      st.x = lerp(seg.from[0], seg.to[0], p);
      st.y = lerp(seg.from[1], seg.to[1], p);
      st.lift = 4 * seg.h * p * (1 - p);
      st.dir = seg.dir || (seg.to[0] < seg.from[0] ? -1 : 1);
      st.stretch = Math.pow(Math.sin(p * Math.PI), 0.7);
      st.crouch = smooth(0.85, 1, p) * 0.6;
      st.rot = seg.rot ? lerp(seg.rot[0], seg.rot[1], easeInOut(p)) : 0;
      st.tailAmp = 0.2;
      break;
    }
    case 'move': {
      const e = seg.ease === 'linear' ? p : easeInOutSine(p);
      const d = e * seg._path.total;
      const q = pointAlong(seg._path, d);
      st.x = q.x; st.y = q.y;
      st.dir = seg.dir || (Math.cos(q.ang) < 0 ? -1 : 1);
      if (seg.align) {
        let r = st.dir < 0 ? q.ang + Math.PI : q.ang;
        if (r > Math.PI) r -= TAU;
        st.rot = r;
      }
      const run = seg.gait === 'run';
      st.phase = (d / (run ? 44 : 30)) * TAU;
      st.gait = run ? 1.2 : 0.9;
      st.run = run ? 1 : 0;
      st.lift = Math.abs(Math.sin(st.phase)) * (run ? 5 : 1.5);
      st.stretch = run ? 0.3 + 0.2 * Math.sin(st.phase * 2) : 0;
      st.tailAmp = run ? 0.3 : 0.5;
      st.sit = seg.sitFrom * (1 - smooth(seg.t0, seg.t0 + 0.2, t));
      if (seg.tired) { st.eye = 0.5; st.eyeMode = 'tired'; st.crouch = 0.15; st.headTilt = 0.18; st.tailAmp = 0.15; }
      break;
    }
    case 'idle': {
      st.x = seg.at[0]; st.y = seg.at[1]; st.dir = seg.dir;
      const level = SIT_LEVEL[seg.pose] || 0;
      st.sit = lerp(seg.sitFrom, level, smooth(seg.t0, seg.t0 + 0.3, t));
      switch (seg.pose) {
        case 'sit': st.tailAmp = 0.35; break;
        case 'watch': lookPen = true; st.tailAmp = 0.8; st.tailSpeed = 5; break;
        case 'wiggle': st.crouch = 0.7; st.wiggle = 1; lookPen = true; st.tailAmp = 1; st.tailSpeed = 9; break;
        case 'sniff': st.crouch = 0.25; st.headTilt = 0.28 + Math.sin(clock * 14) * 0.05; break;
        case 'swat': st.swat = Math.pow(Math.sin(p * Math.PI), 0.6); st.tailAmp = 1; st.tailSpeed = 8; lookPen = true; break;
        case 'proud': st.eyeMode = 'happy'; st.headTilt = -0.15; st.tailAmp = 0.9; st.tailSpeed = 4; break;
        case 'groom': {
          const g = 0.5 + 0.5 * Math.sin(clock * 7);
          st.eyeMode = 'closed'; st.swat = 0.55 + 0.15 * g; st.headTilt = 0.2 + 0.08 * g; break;
        }
        case 'tired': st.eye = 0.45; st.eyeMode = 'tired'; st.headTilt = 0.15; st.tailAmp = 0.1; break;
      }
      break;
    }
    case 'push': {
      const d = DIMS[seg.dim], off = dimOffset(d, t, true);
      st.x = d.cat.ref[0] + off[0] + d.cat.dx;
      st.y = d.cat.ref[1] + off[1] + d.cat.dy;
      st.dir = d.cat.dir;
      st.phase = (Math.abs(off[0] - d.push.from[0]) / 24) * TAU;
      st.gait = 0.7; st.crouch = 0.35; st.push = 1; st.effort = 1;
      st.eyeMode = 'squeeze'; st.tailAmp = 0.6; st.tailSpeed = 6; st.headTilt = 0.12;
      break;
    }
    case 'sleep': {
      st.x = seg.at[0]; st.y = seg.at[1]; st.dir = seg.dir;
      const k = smooth(seg.t0, seg.t0 + 0.9, t);
      st.lie = k;
      st.eye = 1 - smooth(seg.t0 + 0.2, seg.t0 + 0.9, t);
      st.eyeMode = st.eye < 0.25 ? 'closed' : 'tired';
      st.tailAmp = 0.06; st.tailSpeed = 1.5; st.headTilt = 0.1 * k;
      st.sleeping = k > 0.95 && t > seg.t0 + 1.2;
      break;
    }
  }

  if (seg.landing && seg.type !== 'jump') st.crouch += 0.7 * (1 - smooth(seg.t0, seg.t0 + 0.22, t));
  if (st.eyeMode === 'open') { const b = (clock + cat.blink) % 3.6; if (b < 0.13) st.eye = 0.12; }

  // Mata mengikut pensel
  if (lookPen && pen && Math.abs(st.rot) < 0.01) {
    const hx = st.x + st.dir * 30, hy = st.y - 45;
    const dx = pen.pos[0] - hx, dy = pen.pos[1] - hy, L = Math.hypot(dx, dy) || 1;
    st.look = [(dx / L) * st.dir * 1.4, (dy / L) * 1.4];
  }

  // Reaksi apabila diklik (masa sebenar, bukan garis masa)
  if (cat.reactAt != null) {
    const r = (clock - cat.reactAt) / 0.55;
    if (r >= 0 && r < 1) {
      st.lift += 34 * 4 * r * (1 - r);
      st.eye = 1; st.eyeMode = 'open'; st.lie *= 0.5; st.stretch = Math.max(st.stretch, 0.4);
    }
  }
  return st;
}

// ---------------------------------------------------------------------
// 8. LUKIS: KERTAS, GARISAN, TEKS, PENSEL
// ---------------------------------------------------------------------
let GRID = null;
function buildGrid(scale) {
  const c = document.createElement('canvas');
  c.width = CONFIG.W * scale; c.height = CONFIG.H * scale;
  const g = c.getContext('2d');
  g.setTransform(scale, 0, 0, scale, 0, 0);
  const S = CONFIG.sheet;
  for (let i = 0, x = S.x; x <= S.x + S.w + 0.1; i++, x += 10) {
    const major = i % 5 === 0;
    g.strokeStyle = major ? COL.gridMajor : COL.gridMinor; g.lineWidth = major ? 0.8 : 0.5;
    g.beginPath(); g.moveTo(x, S.y); g.lineTo(x, S.y + S.h); g.stroke();
  }
  for (let i = 0, y = S.y; y <= S.y + S.h + 0.1; i++, y += 10) {
    const major = i % 5 === 0;
    g.strokeStyle = major ? COL.gridMajor : COL.gridMinor; g.lineWidth = major ? 0.8 : 0.5;
    g.beginPath(); g.moveTo(S.x, y); g.lineTo(S.x + S.w, y); g.stroke();
  }
  return c;
}

function drawPaper(ctx, t) {
  ctx.fillStyle = COL.paper;
  ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
  const g = smooth(0.1, 1.3, t);
  if (g > 0) {
    ctx.save();
    ctx.globalAlpha = g;
    ctx.beginPath(); ctx.rect(0, 0, CONFIG.W * easeOut(g), CONFIG.H); ctx.clip();
    ctx.drawImage(GRID, 0, 0, CONFIG.W, CONFIG.H);
    ctx.restore();
  }
}

function tracePath(ctx, pts, lens, len) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= len) { ctx.lineTo(pts[i][0], pts[i][1]); continue; }
    const seg = lens[i] - lens[i - 1];
    const k = seg > 0 ? (len - lens[i - 1]) / seg : 0;
    ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k));
    break;
  }
}

function drawStroke(ctx, s, t, alpha = 1, disp = null) {
  const p = clamp((t - s.t0) / (s.t1 - s.t0));
  if (p <= 0) return;
  const st = STYLES[s.style];
  ctx.save();
  ctx.globalAlpha = alpha * (st.fades ? FADE : 1);
  ctx.strokeStyle = st.color; ctx.lineWidth = st.width;
  ctx.setLineDash(st.dash || []);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = disp && s.iso ? s.pts.map(disp) : s.pts;
  tracePath(ctx, pts, s.lens, s.total * p);
  ctx.stroke();
  ctx.restore();
}

/** Jejak pensel bercahaya (yang dikejar Oyen) — pudar selepas tamat. */
function drawTrace(ctx, s, t) {
  const p = clamp((t - s.t0) / (s.t1 - s.t0));
  if (p <= 0) return;
  const a = t <= s.t1 ? 1 : 1 - smooth(s.t1, s.t1 + 1.6, t);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = COL.trace; ctx.lineWidth = STYLES.trace.width; ctx.lineCap = 'round';
  ctx.shadowColor = COL.trace; ctx.shadowBlur = 12;
  tracePath(ctx, s.pts, s.lens, s.total * p);
  ctx.stroke();
  ctx.restore();
}

/** Getaran garisan isometri selepas dicakar kucing. */
function wobbleDisp(hits, t) {
  const act = hits.filter(h => t >= h.t && t < h.t + 1.8);
  if (!act.length) return null;
  return ([x, y]) => {
    let dx = 0, dy = 0;
    for (const h of act) {
      const f = Math.max(0, 1 - Math.hypot(x - h.pos[0], y - h.pos[1]) / h.r);
      if (f <= 0) continue;
      const u = t - h.t, k = h.amp * f * Math.exp(-u * 3.2) * Math.sin(u * 26);
      dx += k; dy += k * 0.4;
    }
    return [x + dx, y + dy];
  };
}

function drawArrow(ctx, x, y, ang, size) {
  const c = Math.cos(ang), s = Math.sin(ang);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * c + size * 0.32 * s, y - size * s - size * 0.32 * c);
  ctx.lineTo(x - size * c - size * 0.32 * s, y - size * s + size * 0.32 * c);
  ctx.closePath(); ctx.fill();
}

function drawDims(ctx, t) {
  if (!CONFIG.showDimensionLines) return;
  for (const d of Object.values(DIMS)) {
    const a = smooth(d.appear, d.appear + 0.4, t);
    if (a <= 0) continue;
    const off = dimOffset(d, t);
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = COL.dim; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    const extA = d.push ? smooth(d.push.t1 - 0.1, d.push.t1 + 0.4, t) : 1;
    if (extA > 0) {
      ctx.globalAlpha = a * extA;
      for (const [e1, e2] of d.ext) { ctx.beginPath(); ctx.moveTo(...e1); ctx.lineTo(...e2); ctx.stroke(); }
    }
    ctx.globalAlpha = a;
    const p1 = [d.p1[0] + off[0], d.p1[1] + off[1]], p2 = [d.p2[0] + off[0], d.p2[1] + off[1]];
    ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke();
    const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    drawArrow(ctx, p2[0], p2[1], ang, 10);
    drawArrow(ctx, p1[0], p1[1], ang + Math.PI, 10);
    ctx.restore();
  }
}

function drawLabel(ctx, L, t) {
  const a = smooth(L.t0, L.t0 + 0.5, t);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(L.x, L.y + (1 - a) * 6);
  ctx.font = `${L.weight || 600} ${L.size || 12}px ${FONT}`;
  ctx.fillStyle = L.color || COL.label;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(L.text, 0, 0);
  if (L.underline) {
    const w = ctx.measureText(L.text).width * a;
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-w / 2, 9); ctx.lineTo(w / 2, 9); ctx.stroke();
  }
  ctx.restore();
}

/** Simbol unjuran sudut ketiga: bulatan di kiri, kon terpenggal di kanan. */
function drawThirdAngleSymbol(ctx, x, y, a) {
  ctx.save();
  ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(-14, 0, 8, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(-14, 0, 4, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(18, -8); ctx.lineTo(18, 8); ctx.lineTo(2, 4); ctx.closePath(); ctx.stroke();
  ctx.setLineDash([5, 2, 1, 2]); ctx.strokeStyle = COL.centre; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(22, 0); ctx.stroke();
  ctx.restore();
}

function drawTitleBlock(ctx, t) {
  const TB = CONFIG.titleBlock, rowH = TB.h / 3, cx = TB.x + 250;
  const cells = [
    { x: TB.x + 8, r: 0, label: 'TAJUK', text: 'SOALAN 4 & 5 (JAWAPAN)' },
    { x: cx + 8,   r: 0, label: 'NO.', text: 'LK-04/05' },
    { x: TB.x + 8, r: 1, label: 'UNJURAN', text: 'SUDUT KETIGA' },
    { x: cx + 8,   r: 1, label: 'ISOMETRI', text: 'ARAH A' },
    { x: TB.x + 8, r: 2, label: 'DILUKIS', text: 'OYEN & ABU' },
    { x: cx + 8,   r: 2, label: 'DISEMAK', text: 'CIKGU' },
  ];
  ctx.save();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  cells.forEach((c, i) => {
    const t0 = 20.4 + i * 0.22;
    const a = smooth(t0, t0 + 0.2, t);
    if (a <= 0) return;
    const y = TB.y + rowH * (c.r + 0.5);
    ctx.globalAlpha = a;
    ctx.font = `700 9px ${FONT}`; ctx.fillStyle = '#6b7788';
    ctx.fillText(c.label, c.x, y);
    const lw = ctx.measureText(c.label).width + 7;
    const n = Math.floor(c.text.length * clamp((t - t0) / 0.7));
    ctx.font = `700 12px ${FONT}`; ctx.fillStyle = COL.ink;
    ctx.fillText(c.text.slice(0, n), c.x + lw, y);
  });
  ctx.restore();
  drawThirdAngleSymbol(ctx, cx - 36, TB.y + rowH * 1.5, smooth(20.9, 21.3, t));
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawStamp(ctx, t) {
  const p = clamp((t - 21.4) / 0.45);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(1165, 104);
  ctx.rotate(-0.2);
  const s = 1 + 1.4 * (1 - easeOut(p));
  ctx.scale(s, s);
  ctx.globalAlpha = 0.9 * p;
  ctx.strokeStyle = ctx.fillStyle = COL.stamp;
  ctx.lineWidth = 3; rrect(ctx, -70, -26, 140, 52, 8); ctx.stroke();
  ctx.lineWidth = 1.2; rrect(ctx, -64, -20, 128, 40, 6); ctx.stroke();
  ctx.font = `900 28px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SIAP!', 0, 1);
  ctx.restore();
}

function drawPencil(ctx, pen) {
  const [x, y] = pen.pos, lift = pen.lift || 0;
  ctx.save();
  if (pen.down) {   // cahaya di hujung pensel
    const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
    g.addColorStop(0, pen.style === 'trace' ? 'rgba(255,140,40,0.7)' : 'rgba(255,200,80,0.45)');
    g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
  }
  ctx.translate(x, y - lift * 12);
  ctx.rotate(-0.95);
  // bayang
  ctx.save(); ctx.translate(5 + lift * 6, 9 + lift * 8); ctx.globalAlpha = 0.14; ctx.fillStyle = '#000';
  ctx.fillRect(8, -5, 70, 10); ctx.restore();
  ctx.lineWidth = 1; ctx.strokeStyle = '#5a4526';
  ctx.fillStyle = '#efcb95';                                    // kayu
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, -6); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#323843';                                    // grafit
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(6, -2); ctx.lineTo(6, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f6c21c'; ctx.fillRect(18, -6, 44, 12); ctx.strokeRect(18, -6, 44, 12);   // badan
  ctx.fillStyle = '#e0a90e'; ctx.fillRect(18, 2, 44, 4);
  ctx.fillStyle = '#bfc6cf'; ctx.fillRect(62, -6, 7, 12); ctx.strokeRect(62, -6, 7, 12);     // logam
  ctx.fillStyle = '#f28fa0'; rrect(ctx, 69, -6, 10, 12, 3); ctx.fill(); ctx.stroke();        // pemadam
  ctx.restore();
}

// ---------------------------------------------------------------------
// 9. LUKIS: KUCING (rig kartun berparameter, menghadap kanan dalam ruang tempatan)
// ---------------------------------------------------------------------
function limb(ctx, a, b, col, outline, w) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = outline; ctx.lineWidth = w + 3;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}
function paw(ctx, p, col, outline) {
  ctx.fillStyle = col; ctx.strokeStyle = outline; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(p[0] + 1.5, p[1] - 1.5, 4.6, 3.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
}

function drawCat(ctx, cat, st, clock) {
  if (st.hidden) return;
  const pal = cat.pal, sc = pal.scale;
  ctx.save();
  ctx.translate(st.x, st.y);
  ctx.rotate(st.rot);

  // Bayang di "lantai"
  const shK = clamp(1 - st.lift / 170, 0.35, 1);
  ctx.fillStyle = 'rgba(20,30,50,0.13)';
  ctx.beginPath(); ctx.ellipse(st.dir * 4 * sc, 1, (31 + st.lie * 10) * shK * sc, 5.5 * shK * sc, 0, 0, TAU); ctx.fill();

  ctx.translate(0, -st.lift);
  ctx.scale(st.dir * sc, sc);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  const lie = st.lie, sit = st.sit * (1 - lie);
  const breath = Math.sin(clock * 2.3) * 0.05 * lie;
  const wig = st.wiggle ? Math.sin(clock * 24) * 2.5 : 0;
  const bodyY = -30 + st.crouch * 8 + lie * 18 + sit * 6;
  const rx = 25 * (1 + 0.14 * st.stretch) * (1 - 0.08 * sit) * (1 + 0.06 * lie);
  const ry = 14 * (1 - 0.1 * st.stretch) * (1 + breath) * (1 - 0.12 * lie);
  const bodyAng = -0.5 * sit;
  const pivot = { x: -14 + wig, y: bodyY + 8 };
  const R = (x, y) => rotAround(x + wig, y, pivot, bodyAng);
  const center = R(0, bodyY);

  // --- kaki ---
  const g = st.gait, ph = st.phase;
  const legs = [
    { near: false, front: false, off: 0,       anchor: R(-12, bodyY + 6) },
    { near: false, front: true,  off: Math.PI, anchor: R(16, bodyY + 5) },
    { near: true,  front: false, off: Math.PI, anchor: R(-16, bodyY + 7) },
    { near: true,  front: true,  off: 0,       anchor: R(12, bodyY + 6) },
  ];
  const footOf = L => {
    let fx = L.anchor[0] + (L.front ? 1 : -1) + Math.sin(ph + L.off) * 10 * g;
    let fy = -Math.max(0, Math.cos(ph + L.off)) * 7 * g;
    fx += (L.front ? 13 : -13) * st.stretch; fy -= 7 * st.stretch;
    if (L.front) { fx = lerp(fx, L.anchor[0] + (L.near ? 3 : -1), sit); }
    else { fx = lerp(fx, pivot.x + (L.near ? 14 : 10), sit); }
    fy = lerp(fy, 0, sit);
    if (L.front && st.push) { fx = lerp(fx, L.anchor[0] + (L.near ? 18 : 15), st.push); fy = lerp(fy, bodyY + (L.near ? -2 : 5), st.push); }
    if (L.front && L.near && st.swat) { fx = lerp(fx, L.anchor[0] + 18, st.swat); fy = lerp(fy, bodyY - 22, st.swat); }
    if (L.front) { fx = lerp(fx, L.anchor[0] + (L.near ? 17 : 12), lie); fy = lerp(fy, -3, lie); }
    return [fx, fy];
  };

  // --- ekor ---
  const w = Math.sin(clock * st.tailSpeed + cat.blink) * st.tailAmp;
  const base = R(-rx + 5, bodyY - 3);
  const wRun = clamp(st.run * 0.8 + st.stretch * 0.8);
  const rel = (dx, dy) => [base[0] + dx, base[1] + dy];
  let tail = [rel(-12, -5), rel(-20 + w * 6, -25), rel(-11 + w * 13, -38)];
  const tRun = [rel(-14, -2), rel(-28, -6 + w * 4), rel(-40, -13 + w * 5)];
  const tSit = [[base[0] - 12, -3], [base[0] - 4, 2], [pivot.x + 30 + w * 3, -3]];
  const tLie = [[base[0] - 14, -2], [base[0] - 2, 5], [rx - 4 + w * 2, -3]];
  tail = tail.map((p, i) => lerp2(lerp2(lerp2(p, tRun[i], wRun), tSit[i], sit), tLie[i], lie));
  const tailFront = sit + lie > 0.5;
  const drawTail = () => {
    ctx.beginPath(); ctx.moveTo(base[0], base[1]);
    ctx.bezierCurveTo(tail[0][0], tail[0][1], tail[1][0], tail[1][1], tail[2][0], tail[2][1]);
    ctx.strokeStyle = pal.outline; ctx.lineWidth = 9.5; ctx.setLineDash([]); ctx.stroke();
    ctx.strokeStyle = pal.body; ctx.lineWidth = 6.5; ctx.stroke();
    ctx.strokeStyle = pal.dark; ctx.setLineDash([3.5, 5.5]); ctx.stroke(); ctx.setLineDash([]);
  };

  if (!tailFront) drawTail();

  // kaki belakang (jauh) & hadapan (jauh)
  for (const L of legs.filter(l => !l.near)) {
    if (!L.front && lie > 0.5) continue;
    const f = footOf(L); limb(ctx, L.anchor, f, pal.dark, pal.outline, 6.5); paw(ctx, f, pal.dark, pal.outline);
  }

  // --- badan ---
  ctx.save();
  ctx.translate(center[0], center[1]); ctx.rotate(bodyAng);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fillStyle = pal.body; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = pal.belly; ctx.beginPath(); ctx.ellipse(4, ry * 0.78, rx * 0.72, ry * 0.55, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = pal.dark; ctx.lineWidth = 3.4;
  for (const sx of pal.stripes) {
    ctx.beginPath(); ctx.moveTo(sx, -ry - 2); ctx.quadraticCurveTo(sx + 4, -ry * 0.5, sx + 1, -ry * 0.05); ctx.stroke();
  }
  ctx.restore();
  ctx.lineWidth = 2; ctx.strokeStyle = pal.outline;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
  ctx.restore();

  // paha (duduk / baring)
  const hk = Math.max(sit, lie);
  if (hk > 0.25) {
    ctx.fillStyle = pal.body; ctx.strokeStyle = pal.outline; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(pivot.x + 3, -11 + 3 * lie, 13 * hk, 10.5 * hk * (1 - 0.2 * lie), 0, 0, TAU); ctx.fill(); ctx.stroke();
    paw(ctx, [pivot.x + 15, -1], pal.belly, pal.outline);
  }

  // kaki hampir
  for (const L of legs.filter(l => l.near)) {
    if (!L.front && (lie > 0.5 || sit > 0.5)) continue;
    const f = footOf(L); limb(ctx, L.anchor, f, pal.body, pal.outline, 7); paw(ctx, f, pal.belly, pal.outline);
  }

  if (tailFront) drawTail();

  // garisan usaha ketika menolak
  if (st.effort) {
    ctx.strokeStyle = pal.outline; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.6;
    for (let k = 0; k < 3; k++) {
      const len = 6 + 3 * Math.sin(clock * 20 + k * 2);
      const yy = bodyY - 10 + k * 7, xx = -rx - 12;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - len, yy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // --- kepala ---
  let hx = rx + 1 + 3 * st.stretch, hy = bodyY - 13;
  hx -= 2 * st.push; hy += 8 * st.push;
  let head = R(hx, hy);
  head = [lerp(head[0], rx - 2, lie), lerp(head[1], -12, lie)];
  const headAng = st.headTilt + bodyAng * 0.35;
  drawHead(ctx, cat, st, head, headAng);

  // Simpan kedudukan kepala (koordinat dunia) untuk emosi & klik
  const m = ctx.getTransform();
  const wp = new DOMPoint(head[0], head[1]).matrixTransform(m);
  cat.headWorld = [wp.x / SCALE, wp.y / SCALE];
  ctx.restore();
}

function drawHead(ctx, cat, st, [x, y], ang) {
  const pal = cat.pal, r = 14;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.lineWidth = 2; ctx.strokeStyle = pal.outline;

  // telinga
  const droop = st.lie * 0.25;
  const polar = (rad, a) => [Math.cos(a) * rad, Math.sin(a) * rad];
  for (const [a, far] of [[-2.05 - droop, true], [-1.05 + droop * 0.5, false]]) {
    const b1 = polar(r * 0.9, a - 0.42), b2 = polar(r * 0.9, a + 0.42), tip = polar(r * 1.75, a);
    ctx.beginPath(); ctx.moveTo(...b1); ctx.lineTo(...tip); ctx.lineTo(...b2); ctx.closePath();
    ctx.fillStyle = far ? pal.dark : pal.body; ctx.fill(); ctx.stroke();
    const i1 = polar(r * 1.0, a - 0.22), i2 = polar(r * 1.0, a + 0.22), it = polar(r * 1.5, a);
    ctx.beginPath(); ctx.moveTo(...i1); ctx.lineTo(...it); ctx.lineTo(...i2); ctx.closePath();
    ctx.fillStyle = pal.ear; ctx.fill();
  }

  // kepala
  ctx.beginPath(); ctx.ellipse(0, 0, r + 1, r - 0.5, 0, 0, TAU);
  ctx.fillStyle = pal.body; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = pal.dark; ctx.lineWidth = 2.4;
  for (const sx of [-5, 0, 5]) { ctx.beginPath(); ctx.moveTo(sx, -15); ctx.lineTo(sx * 0.8, -9); ctx.stroke(); }
  ctx.fillStyle = pal.muzzle; ctx.beginPath(); ctx.ellipse(8, 5.5, 8, 5.5, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = pal.outline; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, r + 1, r - 0.5, 0, 0, TAU); ctx.stroke();

  // pipi
  ctx.fillStyle = 'rgba(255,120,140,0.35)';
  ctx.beginPath(); ctx.ellipse(1.5, 6, 3.4, 1.9, 0, 0, TAU); ctx.fill();

  // mata
  ctx.lineWidth = 1.8;
  for (const [i, ex] of [[0, -1], [1, 8]]) {
    const ey = -2;
    ctx.strokeStyle = ctx.fillStyle = pal.outline;
    switch (st.eyeMode) {
      case 'happy':
        ctx.beginPath(); ctx.arc(ex, ey + 1.2, 2.7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); break;
      case 'closed':
        ctx.beginPath(); ctx.arc(ex, ey - 1.2, 2.7, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); break;
      case 'squeeze': {
        const s = i === 0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(ex - 2.4 * s, ey - 2.6); ctx.lineTo(ex + 1.6 * s, ey); ctx.lineTo(ex - 2.4 * s, ey + 2.6); ctx.stroke();
        break;
      }
      default: {
        const open = clamp(st.eye, 0.08, 1);
        const lx = ex + st.look[0], ly = ey + st.look[1] * 0.8;
        ctx.beginPath(); ctx.ellipse(lx, ly, 2.5, 3.4 * open, 0, 0, TAU); ctx.fill();
        if (open > 0.5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx - 0.8, ly - 1.3, 0.95, 0, TAU); ctx.fill(); }
        if (st.eyeMode === 'tired') {
          ctx.strokeStyle = pal.outline; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(ex - 3.2, ey - 1.2); ctx.lineTo(ex + 3.2, ey - 1.6); ctx.stroke();
        }
      }
    }
  }

  // hidung, mulut, misai
  ctx.fillStyle = '#e27886';
  ctx.beginPath(); ctx.moveTo(12.6, 1.4); ctx.lineTo(16, 1.4); ctx.lineTo(14.3, 3.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = pal.outline; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(14.3, 3.6); ctx.lineTo(14.3, 5);
  ctx.quadraticCurveTo(12.8, 7.2, 11.2, 5.6); ctx.moveTo(14.3, 5); ctx.quadraticCurveTo(15.8, 7.2, 17.2, 5.6); ctx.stroke();
  ctx.globalAlpha = 0.7; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(14, 4.5); ctx.lineTo(28, 1.2); ctx.moveTo(14, 5.2); ctx.lineTo(28, 6.2); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------
// 10. KESAN: EMOSI, ZARAH, Zzz, HATI, KAPSYEN
// ---------------------------------------------------------------------
function drawBubble(ctx, x, y, text, k) {
  const pop = easeOutBack(clamp(k * 5)), a = 1 - smooth(0.8, 1, k);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.font = `800 14px ${FONT}`;
  const w = Math.max(24, ctx.measureText(text).width + 16), h = 24;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2b3442'; ctx.lineWidth = 1.6;
  rrect(ctx, -w / 2, -h, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(-10, 8); ctx.lineTo(2, -1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-10, 8); ctx.lineTo(2, 0); ctx.stroke();
  ctx.fillStyle = '#1d2533'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -h / 2 + 0.5);
  ctx.restore();
}

function drawSweat(ctx, x, y, k) {
  const a = 1 - smooth(0.75, 1, k);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y + k * 10);
  ctx.fillStyle = '#7cc4f2'; ctx.strokeStyle = '#2f79b5'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(6, 0, 0, 4); ctx.quadraticCurveTo(-6, 0, 0, -9); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawHeart(ctx, x, y, s, a) {
  ctx.save();
  ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#ff5d7a';
  ctx.beginPath(); ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-7, -3, -4, -9, 0, -5); ctx.bezierCurveTo(4, -9, 7, -3, 0, 3); ctx.fill();
  ctx.restore();
}

function drawCatFx(ctx, cat, st, t, clock) {
  if (st.hidden || !cat.headWorld) return;
  const [hx, hy] = cat.headWorld, d = st.dir;
  for (const e of cat.emotes) {
    if (t < e.t0 || t > e.t1) continue;
    const k = (t - e.t0) / (e.t1 - e.t0);
    if (e.kind === 'sweat') drawSweat(ctx, hx + d * 16, hy - 14, k);
    else drawBubble(ctx, hx + d * 12, hy - 22, e.text, k);
  }
  // Zzz ketika tidur
  if (st.sleeping) {
    ctx.save();
    ctx.fillStyle = '#4a5a78'; ctx.textAlign = 'center';
    for (let k = 0; k < 3; k++) {
      const ph = (clock * 0.55 + k / 3 + cat.blink * 0.3) % 1;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
      ctx.font = `800 ${10 + ph * 10}px ${FONT}`;
      ctx.fillText('z', hx + d * (6 + ph * 18) + Math.sin(ph * 6) * 3, hy - 14 - ph * 42);
    }
    ctx.restore();
  }
  // Reaksi klik: "Ngiau!" + hati
  if (cat.reactAt != null) {
    const life = clock - cat.reactAt;
    if (life < 1.0) drawBubble(ctx, hx + d * 12, hy - 22, 'Ngiau!', life / 1.0);
    for (let k = 0; k < 3; k++) {
      const u = (life - k * 0.12) / 1.2;
      if (u > 0 && u < 1) drawHeart(ctx, hx + d * (8 + k * 9) + Math.sin(u * 6 + k) * 4, hy - 18 - u * 46, 1.1 + k * 0.15, 1 - u);
    }
  }
}

function drawBursts(ctx, bursts, t) {
  for (const b of bursts) {
    const u = (t - b.t) / 0.55;
    if (u < 0 || u > 1) continue;
    ctx.save();
    ctx.globalAlpha = 1 - u; ctx.strokeStyle = b.color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3, r0 = 6 + u * 14, r1 = r0 + 8 * (1 - u) + 3;
      ctx.beginPath();
      ctx.moveTo(b.pos[0] + Math.cos(a) * r0, b.pos[1] + Math.sin(a) * r0);
      ctx.lineTo(b.pos[0] + Math.cos(a) * r1, b.pos[1] + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawCaption(ctx, t) {
  for (const ph of PHASES) {
    const a = smooth(ph.t0, ph.t0 + 0.4, t) * (1 - smooth(ph.t1 - 0.4, ph.t1, t));
    if (a <= 0) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `700 13px ${FONT}`;
    const w = ctx.measureText(ph.text).width + 28, x = 568 - w / 2, y = 652;
    ctx.fillStyle = 'rgba(31,42,58,0.88)'; rrect(ctx, x, y, w, 28, 14); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ph.text, 568, y + 14.5);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------
// 11. GELUNG ANIMASI, KAWALAN & INTERAKSI
// ---------------------------------------------------------------------
const SCALE = CONFIG.renderScale;
const SCRIPT = buildScript();
const DIMS = buildDims();
const PEN = buildPen(SCRIPT);
const CATS = buildCats(SCRIPT, DIMS);
const HITS = [
  { t: 16.65, pos: I([475.9, 384.8]), amp: 6, r: 95 },
  { t: SCRIPT.marks.swat2, pos: SCRIPT.marks.hitEdgeMid, amp: 4.5, r: 95 },
];
const BURSTS = [
  ...HITS.map(h => ({ t: h.t, pos: h.pos, color: COL.trace })),
  ...Object.values(DIMS).filter(d => d.push && CONFIG.showDimensionLines)
    .map(d => ({ t: d.push.t1, pos: d.burstAt, color: COL.dim })),
];
let FADE = 1;   // kelegapan garisan binaan (dipudarkan pada babak 3)

const canvas = document.getElementById('kanvas');
canvas.width = CONFIG.W * SCALE;
canvas.height = CONFIG.H * SCALE;
const CTX = canvas.getContext('2d');
GRID = buildGrid(SCALE);

function render(t, clock) {
  const ctx = CTX;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  FADE = 1 - 0.55 * smooth(20, 21.5, t);

  drawPaper(ctx, t);
  for (const s of SCRIPT.construct) drawStroke(ctx, s, t);
  for (const s of SCRIPT.frame) drawStroke(ctx, s, t);
  for (const s of SCRIPT.trace) drawTrace(ctx, s, t);
  const disp = wobbleDisp(HITS, t);
  for (const s of SCRIPT.ink) drawStroke(ctx, s, t, 1, disp);
  drawDims(ctx, t);
  for (const L of SCRIPT.labels) drawLabel(ctx, L, t);
  drawTitleBlock(ctx, t);
  drawStamp(ctx, t);
  drawBursts(ctx, BURSTS, t);
  drawCaption(ctx, t);

  const pen = PEN(t);
  const states = CATS.map(c => ({ c, st: catPose(c, t, clock, pen) })).sort((a, b) => a.st.y - b.st.y);
  for (const { c, st } of states) drawCat(ctx, c, st, clock);
  if (pen) drawPencil(ctx, pen);
  for (const { c, st } of states) drawCatFx(ctx, c, st, t, clock);
  LAST_STATES = states;
}
let LAST_STATES = [];

// --- keadaan main balik ---
const state = { t: 0, clock: 0, playing: true, speed: 1, loop: false, last: null, recorder: null };
const ui = {
  play: document.getElementById('btnPlay'),
  restart: document.getElementById('btnRestart'),
  seek: document.getElementById('seek'),
  time: document.getElementById('timeLabel'),
  speed: document.getElementById('speed'),
  loop: document.getElementById('loop'),
  rec: document.getElementById('btnRecord'),
};
ui.seek.max = CONFIG.duration;

function setPlaying(on) {
  if (on && state.t >= CONFIG.duration) state.t = 0;
  state.playing = on;
  ui.play.textContent = on ? '⏸ Jeda' : '▶ Main';
}
function seek(t) { state.t = clamp(t, 0, CONFIG.duration); }

function tick(now) {
  if (state.last == null) state.last = now;
  const dt = Math.min(0.1, (now - state.last) / 1000);
  state.last = now;
  if (state.playing) {
    state.t += dt * state.speed;
    if (state.t >= CONFIG.duration) {
      if (state.recorder) stopRecording();
      if (state.loop) state.t = 0;
      else { state.t = CONFIG.duration; setPlaying(false); }
    }
  }
  // jam animasi "hidup" (ekor, kelip mata, nafas) berjalan semasa main & selepas tamat
  if (state.playing || state.t >= CONFIG.duration) state.clock += dt;
  render(state.t, state.clock);
  if (document.activeElement !== ui.seek) ui.seek.value = state.t.toFixed(2);
  ui.time.textContent = `${state.t.toFixed(1)} / ${CONFIG.duration.toFixed(1)} s`;
  requestAnimationFrame(tick);
}

// --- Bunyi "ngiau" ringkas (Web Audio, hanya selepas klik pengguna) ---
let audioCtx = null;
function meow(pitch = 1) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(), f = audioCtx.createBiquadFilter(), g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520 * pitch, t0);
    osc.frequency.linearRampToValueAtTime(820 * pitch, t0 + 0.12);
    osc.frequency.exponentialRampToValueAtTime(420 * pitch, t0 + 0.45);
    f.type = 'bandpass'; f.Q.value = 3;
    f.frequency.setValueAtTime(900, t0); f.frequency.linearRampToValueAtTime(1800, t0 + 0.15);
    f.frequency.linearRampToValueAtTime(700, t0 + 0.45);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    osc.connect(f).connect(g).connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0 + 0.55);
  } catch (e) { /* tiada audio — abaikan */ }
}

function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * CONFIG.W, ((e.clientY - r.top) / r.height) * CONFIG.H];
}
function catAt([x, y]) {
  for (const { c, st } of [...LAST_STATES].reverse()) {
    if (st.hidden) continue;
    const cx = (st.x + (c.headWorld ? c.headWorld[0] : st.x)) / 2;
    const cy = (st.y - st.lift - 22 + (c.headWorld ? c.headWorld[1] : st.y)) / 2;
    if (Math.hypot(x - cx, y - cy) < 42) return c;
  }
  return null;
}
canvas.addEventListener('click', e => {
  const c = catAt(toLogical(e));
  if (c) { c.reactAt = state.clock; meow(c.pitch); }
});
canvas.addEventListener('mousemove', e => { canvas.style.cursor = catAt(toLogical(e)) ? 'pointer' : 'default'; });

ui.play.addEventListener('click', () => setPlaying(!state.playing));
ui.restart.addEventListener('click', () => { seek(0); setPlaying(true); });
ui.seek.addEventListener('input', () => seek(parseFloat(ui.seek.value)));
ui.speed.addEventListener('change', () => { state.speed = parseFloat(ui.speed.value); });
ui.loop.addEventListener('change', () => { state.loop = ui.loop.checked; });
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.code !== 'Space') return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!state.playing); }
  else if (e.key === 'r' || e.key === 'R') { seek(0); setPlaying(true); }
  else if (e.key === 'ArrowRight') seek(state.t + 1);
  else if (e.key === 'ArrowLeft') seek(state.t - 1);
});

// --- Rakam 30 saat sebagai video WebM (MediaRecorder) ---
function startRecording() {
  if (!canvas.captureStream || !window.MediaRecorder) { alert('Pelayar ini tidak menyokong rakaman kanvas.'); return; }
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
  const rec = new MediaRecorder(canvas.captureStream(60), { mimeType: mime, videoBitsPerSecond: 8e6 });
  const chunks = [];
  rec.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
  rec.onstop = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    a.download = 'kucing-lukisan-kejuruteraan.webm';
    a.click();
  };
  state.recorder = rec;
  state.speed = 1; ui.speed.value = '1';
  seek(0); setPlaying(true);
  rec.start();
  ui.rec.classList.add('on'); ui.rec.textContent = '⏺ Merakam…';
}
function stopRecording() {
  if (!state.recorder) return;
  state.recorder.stop();
  state.recorder = null;
  ui.rec.classList.remove('on'); ui.rec.textContent = '⏺ Rakam WebM';
}
ui.rec.addEventListener('click', () => (state.recorder ? stopRecording() : startRecording()));

// API kecil untuk ujian / tangkap layar: animasi.seek(12.5); animasi.pause();
window.animasi = {
  seek: t => { seek(t); render(state.t, state.clock); },
  // Render bingkai tepat (untuk eksport video bingkai demi bingkai)
  renderAt: (t, clock = t) => { seek(t); state.clock = clock; render(t, clock); },
  play: () => setPlaying(true),
  pause: () => setPlaying(false),
  marks: SCRIPT.marks,
};

requestAnimationFrame(tick);
