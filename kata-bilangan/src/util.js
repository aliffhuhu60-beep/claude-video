// Fungsi bantu animasi — semua animasi ialah fungsi masa t (deterministik).
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lin = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeOut = x => 1 - Math.pow(1 - x, 3);
export const easeIn = x => x * x * x;
export const easeInOut = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutBack = (x, s = 1.9) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
// lantunan (jatuh lalu melantun sekali dua)
export const bounce = x => {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
};
// denyut sekali (0→1→0) berpusat pada t0
export const pulse = (t, t0, d = 0.45) => { const k = (t - t0) / d; return k < 0 || k > 1 ? 0 : Math.sin(Math.PI * k); };

// Sampul kemunculan: muncul (pop) pada a, hilang pada b.
export function popEnv(t, a, b = 1e9, inD = 0.38, outD = 0.25) {
  if (t < a) return { s: 0, o: 0 };
  const ki = lin(t, a, a + inD);
  let s = easeOutBack(ki), o = clamp(ki * 2.2);
  if (t > b) { const ko = easeIn(lin(t, b, b + outD)); s *= 1 - 0.35 * ko; o *= 1 - ko; }
  return { s, o };
}

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
